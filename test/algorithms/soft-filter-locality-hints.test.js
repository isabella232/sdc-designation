/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright 2016 Joyent, Inc.
 */

var genUuid = require('libuuid').create;
var test = require('tape');
var filter = require('../../lib/algorithms/soft-filter-locality-hints.js');
var common = require('./common.js');


// --- globals


var OWNER_UUID = 'b0bbbbbb-9172-4c58-964e-fe58a9989708';


// --- internal support stuff


var checkFilter = common.createPluginChecker(filter);


function
genVms(numVms, numOwnerVms)
{
	var vms = {};

	var data = [];
	for (var i = 0; i !== numOwnerVms; i++) {
		data.push([ genUuid(), { owner_uuid: OWNER_UUID } ]);
	}
	for (i = 0; i !== numVms - numOwnerVms; i++) {
		data.push([ genUuid(), { owner_uuid: genUuid() } ]);
	}

	shuffleArray(data);
	for (i = 0; i < data.length; i++) {
		vms[data[i][0]] = data[i][1];
	}

	return (vms);
}


/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 *
 * Via http://stackoverflow.com/a/2450976
 */
function
shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	return (array);
}

function randInt(min, max) {
	var num = (Math.floor(Math.random() * (max - min + 1)) + min);
	return (num);
}


// --- tests


test('name', function (t) {
	t.equal(typeof (filter.name), 'string');
	t.end();
});


test('no locality, no servers', function (t) {
	var opts = { vm: { owner_uuid: OWNER_UUID } };

	checkFilter(t, [], opts, [], {});
});


test('locality, no servers', function (t) {
	var opts = { vm: {
		owner_uuid: OWNER_UUID,
		locality: { near: '468994e6-d53d-c74c-8245-3273a86dc3d9' }
	}};

	checkFilter(t, [], opts, [], {});
});


test('locality scenario A', function (tt) {
	var servers = [
		{ hostname: 'cn0', uuid: 'cafe0000-14b6-8040-8d36-54a1e5ec2ef9',
			vms: genVms(3, 2) },
		// cn1 has no VMs owned by `ownerUuid`.
		{ hostname: 'cn1', uuid: 'cafe1111-14b6-8040-8d36-54a1e5ec2ef9',
			vms: genVms(3, 0) },
		{ hostname: 'cn2', uuid: 'cafe2222-14b6-8040-8d36-54a1e5ec2ef9',
			vms: genVms(3, 1) },
		{ hostname: 'cn3', uuid: 'cafe3333-14b6-8040-8d36-54a1e5ec2ef9',
			vms: genVms(3, 1) },
		{ hostname: 'cn4', uuid: 'cafe4444-14b6-8040-8d36-54a1e5ec2ef9',
			vms: genVms(3, 2) }
	];

	function ownerVmOnServer(idx) {
		return Object.keys(servers[idx].vms).filter(function (v) {
			return (servers[idx].vms[v].owner_uuid === OWNER_UUID);
		})[0];
	}
	function nonOwnerVmOnServer(idx) {
		return Object.keys(servers[idx].vms).filter(function (v) {
			return (servers[idx].vms[v].owner_uuid !== OWNER_UUID);
		})[0];
	}

	var ownerVmOnServer0 = ownerVmOnServer(0);
	var ownerVmOnServer2 = ownerVmOnServer(2);
	var ownerVmOnServer3 = ownerVmOnServer(3);
	var ownerVmOnServer4 = ownerVmOnServer(4);

	tt.test('  no locality -> owner spread', function (t) {
		var expServers = [ servers[1] ];

		var expReasons = {};
		[0, 2, 3, 4].forEach(function (idx) {
			expReasons[servers[idx].uuid]
				= 'exclude: spread by owner';
		});

		var opts = { vm: { owner_uuid: OWNER_UUID } };

		checkFilter(t, servers, opts, expServers, expReasons);
	});

	tt.test('  no locality -> owner spread (ignored)', function (t) {
		var subsetServers = [ servers[3], servers[4] ];

		var expServers = subsetServers;
		var expReasons = {
			'*': 'exclude: spread by owner (ignored b/c non-strict)'
		};

		var opts = { vm: { owner_uuid: OWNER_UUID } };

		checkFilter(t, subsetServers, opts, expServers,
			expReasons);
	});

	tt.test('  non-strict far (string)', function (t) {
		var expServers = servers.slice(1, 5);
		var expReasons = {};
		expReasons[servers[0].uuid]
			= 'exclude: inst!=' + ownerVmOnServer0;

		var opts = { vm: {
			owner_uuid: OWNER_UUID,
			locality: { far: ownerVmOnServer0 }
		} };

		checkFilter(t, servers, opts, expServers, expReasons);
	});

	tt.test('  non-strict far (string)', function (t) {
		var expServers = servers.slice(1, 5);
		var expReasons = {};
		expReasons[servers[0].uuid]
			= 'exclude: inst!=' + ownerVmOnServer0;

		var opts = { vm: {
			owner_uuid: OWNER_UUID,
			locality: { far: [ownerVmOnServer0] }
		} };

		checkFilter(t, servers, opts, expServers, expReasons);
	});

	tt.test('  strict far', function (t) {
		var expServers = servers;
		var expReasons = {
			skip: 'Strict locality requested and no spreading ' +
				'needed'
		};

		var opts = { vm: {
			owner_uuid: OWNER_UUID,
			locality: { strict: true, far: [ownerVmOnServer0] }
		} };

		checkFilter(t, servers, opts, expServers, expReasons);
	});

	tt.test('  non-strict near', function (t) {
		var expServers = [ servers[3] ];
		var expReasons = {};
		expReasons[servers[3].uuid]
			= 'include: inst==~' + ownerVmOnServer3;

		var opts = { vm: {
			owner_uuid: OWNER_UUID,
			locality: { strict: false, near: [ownerVmOnServer3] }
		} };

		checkFilter(t, servers, opts, expServers, expReasons);
	});

	tt.test('  strict near', function (t) {
		var expServers = servers;
		var expReasons = {
			skip: 'Strict locality requested and no spreading ' +
				'needed'
		};

		var opts = { vm: {
			owner_uuid: OWNER_UUID,
			locality: { strict: true, near: [ownerVmOnServer3] }
		} };

		checkFilter(t, servers, opts, expServers, expReasons);
	});

	tt.test('  non-strict near non-existent-VM (gets ignored)',
	    function (t) {
		var nonExistentVm = 'ef26f01e-200e-2a43-a056-cab333731e8f';
		var opts = { vm: {
			owner_uuid: OWNER_UUID,
			locality: { strict: false, near: [nonExistentVm] }
		} };

		var expServers = servers;
		var expReasons = {
			'*': 'exclude: inst==~' + nonExistentVm
				+ ' (ignored b/c non-strict)'
		};

		checkFilter(t, servers, opts, expServers, expReasons);
	});

	// Here we expect to return all the CNs with *any* of the list VMs.
	tt.test('  non-strict near, VMs on multiple CNs', function (t) {
		var near = [ownerVmOnServer0, ownerVmOnServer2];
		var opts = { vm: {
			owner_uuid: OWNER_UUID,
			locality: { strict: false, near: near }
		} };

		var expServers = [servers[0], servers[2]];
		var expReasons = {};
		expReasons[servers[0].uuid]
			= 'include: inst==~' + ownerVmOnServer0;
		expReasons[servers[2].uuid]
			= 'include: inst==~' + ownerVmOnServer2;

		checkFilter(t, servers, opts, expServers, expReasons);
	});

	tt.test('  non-strict far, that gets ignored', function (t) {
		var far = [ownerVmOnServer3, ownerVmOnServer4];
		var opts = { vm: {
			owner_uuid: OWNER_UUID,
			locality: { strict: false, far: far }
		} };

		var subsetServers = [servers[3], servers[4]];
		var expServers = subsetServers;

		var expReasons = {};
		expReasons[servers[3].uuid] = 'exclude: inst!='
			+ ownerVmOnServer3 + ' (ignored b/c non-strict)';
		expReasons[servers[4].uuid] = 'exclude: inst!='
			+ ownerVmOnServer4 + ' (ignored b/c non-strict)';

		checkFilter(t, subsetServers, opts, expServers, expReasons);
	});
});


test('locality scenario B: large set', function (tt) {
	var servers = [];
	// A 1000 CNs, each with 250 VMs.
	for (var i = 0; i < 1000; i++) {
		servers.push({
			hostname: 'cn' + i,
			uuid: 'cafe' + (1000 + i).toString()
				+ '-dfce-244e-8f98-0f80b53e8971',
			vms: genVms(250, randInt(1, 10))
		});
	}

	function ownerVmOnServer(idx) {
		return Object.keys(servers[idx].vms).filter(function (v) {
			return (servers[idx].vms[v].owner_uuid === OWNER_UUID);
		})[0];
	}
	function nonOwnerVmOnServer(idx) {
		return Object.keys(servers[idx].vms).filter(function (v) {
			return (servers[idx].vms[v].owner_uuid !== OWNER_UUID);
		})[0];
	}

	var ownerVmOnServer42 = ownerVmOnServer(42);
	var ownerVmOnServer997 = ownerVmOnServer(997);

	tt.test('  non-strict near', function (t) {
		var opts = common.addCommonOpts({
			vm: {
				owner_uuid: OWNER_UUID,
				locality: {
					strict: false,
					near: [ownerVmOnServer997]
				}
			}
		});

		var givenServers = common.clone(servers);

		var start = Date.now();
		filter.run(givenServers, opts,
				function (err, filteredServers, reasons) {
			t.ifError(err);

			var end = Date.now();
			var elapsed = end - start;
			t.ok(elapsed < 50, '<50ms elapsed: ' + elapsed + 'ms');

			t.equal(filteredServers.length, 1);

			t.end();
		});
	});

	tt.test('  non-strict far', function (t) {
		var opts = common.addCommonOpts({
			vm: {
				owner_uuid: OWNER_UUID,
				locality: {
					strict: false,
					far: [
						ownerVmOnServer42,
						ownerVmOnServer997
					]
				}
			}
		});

		var givenServers = common.clone(servers);

		var start = Date.now();
		filter.run(givenServers, opts,
				function (err, filteredServers, reasons) {
			t.ifError(err);

			var end = Date.now();
			var elapsed = end - start;
			t.ok(elapsed < 50, '<50ms elapsed: ' + elapsed + 'ms');

			t.equal(filteredServers.length, 998);

			t.end();
		});
	});
});
