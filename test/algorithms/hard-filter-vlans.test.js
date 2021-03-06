/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2017, Joyent, Inc.
 */

var assert = require('assert-plus');
var test = require('tape');
var filter = require('../../lib/algorithms/hard-filter-vlans.js');
var common = require('./common.js');


var SERVERS = [
	{
		uuid: '00009386-8c67-b674-587f-101f1db2eda7',
		sysinfo: {
			'Network Interfaces': {
				e1000g0: {
					'Link Status': 'up',
					'NIC Names': [ 'external' ]
				},
				e1000g1: {
					'Link Status': 'up',
					'NIC Names': [ 'admin' ]
				}
			}
		}
	},
	{
		uuid: '1111e5f9-75e6-43e8-a016-a85835b377e1',
		sysinfo: {
			'Network Interfaces': {
				e1000g0: {
					'Link Status': 'down',
					'NIC Names': [ 'external' ]
				},
				e1000g1: {
					'Link Status': 'up',
					'NIC Names': [ 'admin' ]
				}
			}
		}
	},
	{
		uuid: '222266d7-465d-4c22-b26e-a6707a22390e',
		sysinfo: {
			'Network Interfaces': {
				e1000g0: {
					'Link Status': 'up',
					'NIC Names':
						[ 'external', 'customer12' ]
				},
				e1000g1: {
					'Link Status': 'up',
					'NIC Names': [ 'admin' ]
				}
			}
		}
	},

	// Servers on overlay networks

	{
		uuid: '3333059f-8ce2-4573-b56a-4ed2db802ea8',
		sysinfo: {
			'Network Interfaces': { },
			'Virtual Network Interfaces': {
				sdc_underlay0: {
					'Link Status': 'up',
					'Overlay Nic Tags': [ 'sdc_overlay' ]
				}
			}
		}
	},

	{
		uuid: '44448d4e-c4a6-484c-ae49-0ff5cc2e293c',
		sysinfo: {
			'Network Interfaces': { },
			'Virtual Network Interfaces': {
				e1000g0: {
					'Link Status': 'down',
					'Overlay Nic Tags': [ 'sdc_overlay' ]
				}
			}
		}
	},

	{
		uuid: '5555fa4e-144f-43e1-809f-70404573b076',
		sysinfo: {
			'Network Interfaces': {
				ixgbe0: {
					'Link Status': 'up',
					'NIC Names': [ 'customer13' ]
				}
			},
			'Virtual Network Interfaces': {
				sdc_underlay0: {
					'Link Status': 'up',
					'Overlay Nic Tags': [ 'sdc_overlay' ]
				}
			}
		}
	},

	{
		uuid: '666660a9-4174-4e97-91d3-4becd075d280',
		sysinfo: {
			'Network Interfaces': { },
			'Virtual Network Interfaces': {
				e1000g0: {
					'Link Status': 'up'
					// Missing 'Overlay Nic Tags' entirely
				}
			}
		}
	}
];


function missing(tags) {
	return ('Server must have one of the NIC Tags: ' + tags.join(', '));
}


function runTestHelper(t, opts, expectedUuids, expectedReasons) {
	filter.run(SERVERS, opts, function (err, servers, reasons) {
		assert.arrayOfObject(servers);
		assert.object(reasons);

		t.ifError(err);

		var serverUuids = servers.map(function (s) { return s.uuid; });

		t.deepEqual(serverUuids.sort(), expectedUuids);
		t.deepEqual(reasons, expectedReasons);

		t.end();
	});
}


function runTest(t, nic_tags, expectedUuids, expectedReasons) {
	var opts = common.addCommonOpts({ vm: { nic_tags: nic_tags }});

	runTestHelper(t, opts, expectedUuids, expectedReasons);
}


function runMixedTest(t, reqs, expectedUuids, expectedReasons) {
	var opts = common.addCommonOpts({ vm: { nic_tag_requirements: reqs }});

	runTestHelper(t, opts, expectedUuids, expectedReasons);
}


test('filterTags() on single vlan 1', function (t) {
	var expectUuids = [
		'00009386-8c67-b674-587f-101f1db2eda7',
		'222266d7-465d-4c22-b26e-a6707a22390e'
	];
	var expectReasons = {
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			'NIC e1000g0 for tag "external" is down',
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'external' ]),
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			missing([ 'external' ]),
		'5555fa4e-144f-43e1-809f-70404573b076':
			missing([ 'external' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'external' ])
	};

	runTest(t, ['external'], expectUuids, expectReasons);
});


test('filterTags() on single vlan 2', function (t) {
	var expectUuids = [
		'00009386-8c67-b674-587f-101f1db2eda7',
		'1111e5f9-75e6-43e8-a016-a85835b377e1',
		'222266d7-465d-4c22-b26e-a6707a22390e'
	];
	var expectReasons = {
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'admin' ]),
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			missing([ 'admin' ]),
		'5555fa4e-144f-43e1-809f-70404573b076':
			missing([ 'admin' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'admin' ])
	};

	runTest(t, ['admin'], expectUuids, expectReasons);
});


test('filterTags() on single vlan 3', function (t) {
	var expectUuids = [ '222266d7-465d-4c22-b26e-a6707a22390e' ];
	var expectReasons = {
		'00009386-8c67-b674-587f-101f1db2eda7':
			missing([ 'customer12' ]),
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			missing([ 'customer12' ]),
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'customer12' ]),
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			missing([ 'customer12' ]),
		'5555fa4e-144f-43e1-809f-70404573b076':
			missing([ 'customer12' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'customer12' ])
	};

	runTest(t, ['customer12'], expectUuids, expectReasons);
});


test('filterTags() on single vlan 4', function (t) {
	var expectUuids = [
		'00009386-8c67-b674-587f-101f1db2eda7',
		'1111e5f9-75e6-43e8-a016-a85835b377e1',
		'222266d7-465d-4c22-b26e-a6707a22390e',
		'3333059f-8ce2-4573-b56a-4ed2db802ea8',
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c',
		'5555fa4e-144f-43e1-809f-70404573b076',
		'666660a9-4174-4e97-91d3-4becd075d280'
	];
	var expectReasons = {};

	runTest(t, [], expectUuids, expectReasons);
});


test('filterTags() on single vlan 5', function (t) {
	var expectUuids = [];
	var expectReasons = {
		'00009386-8c67-b674-587f-101f1db2eda7':
			missing([ 'doesnotexist' ]),
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			missing([ 'doesnotexist' ]),
		'222266d7-465d-4c22-b26e-a6707a22390e':
			missing([ 'doesnotexist' ]),
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'doesnotexist' ]),
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			missing([ 'doesnotexist' ]),
		'5555fa4e-144f-43e1-809f-70404573b076':
			missing([ 'doesnotexist' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'doesnotexist' ])
	};

	runTest(t, ['doesnotexist'], expectUuids, expectReasons);
});


test('filterTags() on multiple vlans 1', function (t) {
	var expectUuids = [
		'00009386-8c67-b674-587f-101f1db2eda7',
		'222266d7-465d-4c22-b26e-a6707a22390e'
	];
	var expectReasons = {
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			'NIC e1000g0 for tag "external" is down',
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'external' ]),
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			missing([ 'external' ]),
		'5555fa4e-144f-43e1-809f-70404573b076':
			missing([ 'external' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'external' ])
	};

	runTest(t, ['external', 'admin'], expectUuids, expectReasons);
});


test('filterTags() on multiple vlans 2', function (t) {
	var expectUuids = [
		'00009386-8c67-b674-587f-101f1db2eda7',
		'222266d7-465d-4c22-b26e-a6707a22390e'
	];
	var expectReasons = {
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			'NIC e1000g0 for tag "external" is down',
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'admin' ]),
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			missing([ 'admin' ]),
		'5555fa4e-144f-43e1-809f-70404573b076':
			missing([ 'admin' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'admin' ])
	};

	runTest(t, ['admin', 'external'], expectUuids, expectReasons);
});


test('filterTags() on multiple vlans 3', function (t) {
	var expectUuids = [ '222266d7-465d-4c22-b26e-a6707a22390e' ];
	var expectReasons = {
		'00009386-8c67-b674-587f-101f1db2eda7':
			missing([ 'customer12' ]),
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			missing([ 'customer12' ]),
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'customer12' ]),
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			missing([ 'customer12' ]),
		'5555fa4e-144f-43e1-809f-70404573b076':
			missing([ 'customer12' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'customer12' ])
	};

	runTest(t, ['customer12', 'admin', 'external'], expectUuids,
		expectReasons);
});



test('filterTags() on multiple vlans 4', function (t) {
	var expectUuids = [];
	var expectReasons = {
		'00009386-8c67-b674-587f-101f1db2eda7':
			missing([ 'doesnotexist' ]),
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			missing([ 'doesnotexist' ]),
		'222266d7-465d-4c22-b26e-a6707a22390e':
			missing([ 'doesnotexist' ]),
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'admin' ]),
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			missing([ 'admin' ]),
		'5555fa4e-144f-43e1-809f-70404573b076':
			missing([ 'admin' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'admin' ])
	};

	runTest(t, ['admin', 'doesnotexist'], expectUuids, expectReasons);
});


test('filterTags() with no servers', function (t) {
	var emptyServers = [];
	var opts = common.addCommonOpts({ vm: { nic_tags: ['admin'] }});

	filter.run(emptyServers, opts, function (err, servers, reasons) {
		t.ifError(err);

		t.deepEqual(servers, []);
		t.deepEqual(reasons, {});

		t.end();
	});
});


test('filterTags() on single overlay tag', function (t) {
	var expectUuids = [ '3333059f-8ce2-4573-b56a-4ed2db802ea8',
		'5555fa4e-144f-43e1-809f-70404573b076' ];
	var expectReasons = {
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			'NIC e1000g0 for tag "sdc_overlay" is down',
		'00009386-8c67-b674-587f-101f1db2eda7':
			missing([ 'sdc_overlay' ]),
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			missing([ 'sdc_overlay' ]),
		'222266d7-465d-4c22-b26e-a6707a22390e':
			missing([ 'sdc_overlay' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'sdc_overlay' ])
	};

	runTest(t, ['sdc_overlay'], expectUuids, expectReasons);
});


test('filterTags() on overlay tag and vlan', function (t) {
	var expectUuids = [ '5555fa4e-144f-43e1-809f-70404573b076' ];
	var expectReasons = {
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			'NIC e1000g0 for tag "sdc_overlay" is down',
		'00009386-8c67-b674-587f-101f1db2eda7':
			missing([ 'sdc_overlay' ]),
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			missing([ 'sdc_overlay' ]),
		'222266d7-465d-4c22-b26e-a6707a22390e':
			missing([ 'sdc_overlay' ]),
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'customer13' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'sdc_overlay' ])
	};

	runTest(t, ['sdc_overlay', 'customer13'], expectUuids, expectReasons);
});


test('filterTags() on pool with mixed tags', function (t) {
	var expectUuids = [ '222266d7-465d-4c22-b26e-a6707a22390e' ];
	var expectReasons = {
		'00009386-8c67-b674-587f-101f1db2eda7':
			missing([ 'customer12', 'nonexistent1' ]),
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			'NIC e1000g0 for tag "external" is down',
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'external' ]),
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			missing([ 'external' ]),
		'5555fa4e-144f-43e1-809f-70404573b076':
			missing([ 'external' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'external' ])
	};

	runMixedTest(t, [
		[ 'external' ],
		[ 'customer12', 'nonexistent1' ],
		[ 'customer13', 'external', 'admin', 'nonexistent2' ]
	], expectUuids, expectReasons);
});


test('filterTags() on pool that has all NIC Tags', function (t) {
	var allTags = [
		'customer12', 'customer13', 'external',
		'admin', 'sdc_overlay'
	];
	var expectUuids = [
		'00009386-8c67-b674-587f-101f1db2eda7',
		'1111e5f9-75e6-43e8-a016-a85835b377e1',
		'222266d7-465d-4c22-b26e-a6707a22390e',
		'3333059f-8ce2-4573-b56a-4ed2db802ea8',
		'5555fa4e-144f-43e1-809f-70404573b076'
	];
	var expectReasons = {
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			'NIC e1000g0 for tag "sdc_overlay" is down',
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing(allTags)
	};

	runMixedTest(t, [ allTags ], expectUuids, expectReasons);
});


test('filterTags() with too restrictive requirements', function (t) {
	var expectUuids = [ ];
	var expectReasons = {
		'00009386-8c67-b674-587f-101f1db2eda7':
			missing([ 'customer12', 'nonexistent1' ]),
		'1111e5f9-75e6-43e8-a016-a85835b377e1':
			'NIC e1000g0 for tag "external" is down',
		'222266d7-465d-4c22-b26e-a6707a22390e':
			missing([ 'customer13', 'nonexistent2' ]),
		'3333059f-8ce2-4573-b56a-4ed2db802ea8':
			missing([ 'external' ]),
		'44448d4e-c4a6-484c-ae49-0ff5cc2e293c':
			missing([ 'external' ]),
		'5555fa4e-144f-43e1-809f-70404573b076':
			missing([ 'external' ]),
		'666660a9-4174-4e97-91d3-4becd075d280':
			missing([ 'external' ])
	};

	runMixedTest(t, [
		[ 'external' ],
		[ 'customer12', 'nonexistent1' ],
		[ 'customer13', 'nonexistent2' ]
	], expectUuids, expectReasons);
});


test('name', function (t) {
	t.equal(typeof (filter.name), 'string');
	t.end();
});
