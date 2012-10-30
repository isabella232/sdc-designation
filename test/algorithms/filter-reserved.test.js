/*
 * Copyright (c) 2012, Joyent, Inc. All rights reserved.
 */

var assert = require('assert');
var filter = require('../../lib/algorithms/filter-reserved.js');



exports.filterReserved =
function (t) {
    var givenServers = [
        { memory_available_bytes: 128, reserved: false   },
        { memory_available_bytes: 256, reserved: 'true'  },
        { memory_available_bytes: 384                    },
        { memory_available_bytes: 512, reserved: 'false' },
        { memory_available_bytes: 768, reserved: true    }
    ];

    var expectedServers = [ givenServers[0], givenServers[3] ];

    var filteredServers = filter.run(givenServers);
    t.deepEqual(filteredServers, expectedServers);

    t.done();
};



exports.filterReserved_with_no_servers =
function (t) {
    var filteredServers = filter.run([]);
    t.equal(filteredServers.length, 0);

    t.done();
};
