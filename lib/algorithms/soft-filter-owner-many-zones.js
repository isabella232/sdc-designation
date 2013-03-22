/*
 * Copyright (c) 2013, Joyent, Inc. All rights reserved.
 *
 * Sorts and filters out the servers which have the most number of zones
 * belonging to a given owner.
 */



// how many of the servers with the least of an owner's zones to pass along
var KEEP_RATIO = 0.25;



function filterManyZones(log, state, servers, vmDetails) {
    var owner_uuid = vmDetails.owner_uuid;

    var zoneCounts = servers.map(function (server) {
        var owned = 0;
        var vms = server.vms;
        var vmNames = Object.keys(vms);

        for (var i = 0; i !== vmNames.length; i++) {
            var vm_owner = vms[vmNames[i]].owner_uuid;

            if (vm_owner === owner_uuid)
                owned++;
        }

        return [owned, server];
    });

    zoneCounts.sort();

    var keepNumServers = servers.length * KEEP_RATIO;
    if (keepNumServers < 1)
        keepNumServers = 1;

    var fewestZoneCounts = zoneCounts.slice(0, keepNumServers);

    var fewestZonesServers = fewestZoneCounts.map(function (zoneCount) {
        return zoneCount[1];
    });

    return fewestZonesServers;
}



module.exports = {
    name: 'Servers which contain fewer of an owner\'s zones',
    run: filterManyZones
};