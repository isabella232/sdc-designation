/*
 * Copyright (c) 2012, Joyent, Inc. All rights reserved.
 */

var assert = require('assert');
var picker = require('../../lib/algorithms/pick-random.js');



exports.pickRandom =
function (t) {
    var givenServers = [
        { memory_available_bytes: 256 },
        { memory_available_bytes: 768 },
        { memory_available_bytes: 512 }
    ];

    var pickedServers = [];

    for (var i = 0; i != 60; i++) {
        var server = picker.run(givenServers)[0];
        var ram = server.memory_available_bytes;
        pickedServers[ram] = true;

        t.ok(ram === 256 || ram === 512 || ram === 768);
    }

    t.ok(pickedServers[256] && pickedServers[512] && pickedServers[768]);

    t.done();
};



exports.pickRandom_with_no_servers =
function (t) {
    for (var i = 0; i != 5; i++) {
        var pickedServers = picker.run([]);
        t.deepEqual(pickedServers, []);
    }

    t.done();
};
