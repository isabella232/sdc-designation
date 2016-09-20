/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2014, Joyent, Inc.
 */

var test = require('tape');
var filter = require('../../lib/algorithms/hard-filter-headnode.js');
var common = require('./common.js');


var LOG = {
	trace: function () { return (true); },
	debug: function () { return (true); }
};

var SERVERS = [
	{ memory_available_bytes: 256 },
	{ memory_available_bytes: 512, headnode: true },
	{ memory_available_bytes: 768, headnode: false }
];


var checkFilter = common.createPluginChecker(filter, LOG);


test('filterHeadnode() 1', function (t) {
	var expectServers = [ SERVERS[0], SERVERS[2] ];
	var expectReasons = {};

	var constraints = { defaults: {} };

	checkFilter(t, SERVERS, constraints, expectServers, expectReasons);
});


test('filterHeadnode() 2', function (t) {
	var expectServers = SERVERS;
	var expectReasons = { skip: 'Do not filter out headnodes' };

	var constraints = { defaults: { filter_headnode: false } };

	checkFilter(t, SERVERS, constraints, expectServers, expectReasons);
});


test('filterHeadnode() with no servers', function (t) {
	var expectServers = [];
	var expectReasons = {};

	var constraints = { defaults: {} };

	checkFilter(t, [], constraints, expectServers, expectReasons);
});


test('name', function (t) {
	t.equal(typeof (filter.name), 'string');
	t.end();
});
