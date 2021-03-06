/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2014, Joyent, Inc.
 */

/*
 * Returns servers objects which pass validation.
 */

var assert = require('assert-plus');
var validations = require('../validations');

function
filterInvalidServers(servers, opts, cb)
{
	assert.arrayOfObject(servers, 'servers');
	assert.object(opts, 'opts');
	assert.func(cb, 'cb');

	var log = opts.log;
	var reasons = {};

	var validServers = servers.filter(function (server) {
		var msg = validations.validateServer(server);

		if (msg) {
			/*
			 * This is an unfortunate workaround since amon
			 * triggers on this warning, but unsetup servers
			 * return invalid server objects.  We don't want the
			 * amon probe firing on an unsetup server.
			 */
			if (typeof (server) !== 'object' || server.setup)
				log.warn('Skipping server in request:', msg);
		}

		if (msg)
			reasons[server.uuid] = msg;

		return (!msg);
	});

	return (cb(null, validServers, reasons));
}

module.exports = {
	name: 'Servers objects which are valid',
	run: filterInvalidServers
};
