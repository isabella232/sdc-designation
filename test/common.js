/*
 * Copyright 2011 Joyent, Inc.  All rights reserved.
 *
 * Grab-bag of common functions and data.
 */



var assert = require('assert');
var crypto = require('crypto');

var Logger = require('bunyan');
var restify = require('restify');
var uuid = require('node-uuid');



module.exports = {

    setup: function (callback) {
        assert.ok(callback);

        var logger = new Logger({
            level: process.env.LOG_LEVEL || 'info',
            name: 'dapi_unit_test',
            stream: process.stderr,
            serializers: restify.bunyan.serializers
        });

        var client = restify.createJsonClient({
            url: 'http://localhost:8080',
            version: '*',
            retryOptions: { retry: 0 },
            agent: false,
            log: logger
        });

        return callback(null, client);
    },

    checkHeaders: function (t, headers) {
        assert.ok(t);

        t.ok(headers);
        t.ok(headers.date);
        t.equal(headers['content-type'], 'application/json');
        t.equal(headers['api-version'], '7.0.0');
        t.ok(headers['request-id']);
        t.ok(headers['response-time'] >= 0);
        t.ok(headers['content-length'] >= 0);
    },

    exampleServers: [ {
        /* BEGIN JSSTYLED */
        'datacenter': 'us-beta-4',
        'sysinfo': {
          'Live Image': '20130729T215806Z',
          'System Type': 'SunOS',
          'Boot Time': '1375216140',
          'Datacenter Name': 'us-beta-4',
          'SDC Version': '7.0',
          'Manufacturer': 'Supermicro',
          'Product': 'X9DRD-7LN4F',
          'Serial Number': '0123456789',
          'Setup': 'true',
          'VM Capable': true,
          'CPU Type': 'Intel(R) Xeon(R) CPU E5-2670 0 @ 2.60GHz',
          'CPU Virtualization': 'vmx',
          'CPU Physical Cores': 4,
          'UUID': '00000000-0000-0000-0000-00259094373c',
          'Hostname': '00-25-90-94-37-3c',
          'CPU Total Cores': 64,
          'MiB of Memory': '131043',
          'Zpool': 'zones',
          'Zpool Disks': 'c0t5000A7203007B1A9d0,c10t5000CCA0160D6E5Dd0,c11t5000CCA022019BEDd0,c12t5000CCA022008921d0,c13t5000CCA01610CA05d0,c1t5000CCA02203FAFDd0,c2t5000CCA016148695d0,c3t5000CCA022016BADd0,c4t5000CCA02201A4C5d0,c5t5000CCA0220199C1d0,c6t5000CCA02200C8C1d0,c7t5000CCA02203CA49d0,c8t5000CCA016148709d0,c9t5000CCA0160EB825d0',
          'Zpool Profile': 'mirror',
          'Zpool Creation': 1364822661,
          'Zpool Size in GiB': 3283,
          'Disks': {
            'c0t5000A7203007B1A9d0': {
              'Size in GB': 100
            },
            'c10t5000CCA0160D6E5Dd0': {
              'Size in GB': 600
            },
            'c11t5000CCA022019BEDd0': {
              'Size in GB': 600
            },
            'c12t5000CCA022008921d0': {
              'Size in GB': 600
            },
            'c13t5000CCA01610CA05d0': {
              'Size in GB': 600
            },
            'c1t5000CCA02203FAFDd0': {
              'Size in GB': 600
            },
            'c2t5000CCA016148695d0': {
              'Size in GB': 600
            },
            'c3t5000CCA022016BADd0': {
              'Size in GB': 600
            },
            'c4t5000CCA02201A4C5d0': {
              'Size in GB': 600
            },
            'c5t5000CCA0220199C1d0': {
              'Size in GB': 600
            },
            'c6t5000CCA02200C8C1d0': {
              'Size in GB': 600
            },
            'c7t5000CCA02203CA49d0': {
              'Size in GB': 600
            },
            'c8t5000CCA016148709d0': {
              'Size in GB': 600
            },
            'c9t5000CCA0160EB825d0': {
              'Size in GB': 600
            }
          },
          'Boot Parameters': {
            'hostname': '00-25-90-94-37-3c',
            'rabbitmq': 'guest:guest:10.3.1.23:5672',
            'rabbitmq_dns': 'guest:guest:rabbitmq.us-beta-4.joyent.us:5672',
            'admin_nic': '00:25:90:94:37:3c',
            'external_nic': '90:e2:ba:2a:bb:18',
            'console': 'text',
            'text_mode': '115200,8,n,1,-'
          },

          'Network Interfaces': {
            'igb0': {
              'MAC Address': '00:25:90:94:37:3c',
              'ip4addr': '10.3.1.37',
              'Link Status': 'up',
              'NIC Names': [
                'admin'
              ]
            },
            'igb1': {
              'MAC Address': '00:25:90:94:37:3d',
              'ip4addr': '',
              'Link Status': 'down',
              'NIC Names': []
            },
            'igb2': {
              'MAC Address': '00:25:90:94:37:3e',
              'ip4addr': '',
              'Link Status': 'down',
              'NIC Names': []
            },
            'igb3': {
              'MAC Address': '00:25:90:94:37:3f',
              'ip4addr': '',
              'Link Status': 'down',
              'NIC Names': []
            },
            'ixgbe0': {
              'MAC Address': '90:e2:ba:2a:bb:18',
              'ip4addr': '',
              'Link Status': 'up',
              'NIC Names': [
                'external'
              ]
            },
            'ixgbe1': {
              'MAC Address': '90:e2:ba:2a:bb:19',
              'ip4addr': '',
              'Link Status': 'down',
              'NIC Names': []
            }
          },
          'Virtual Network Interfaces': {},
          'Link Aggregations': {}
        },
        'ram': 131043,
        'current_platform': '20130729T215806Z',
        'headnode': false,
        'boot_platform': '20130729T215806Z',
        'overprovision_ratio': 1,
        'reservation_ratio': 0.15,
        'traits': {},
        'rack_identifier': '',
        'comments': '',
        'uuid': '00000000-0000-0000-0000-00259094373c',
        'reserved': false,
        'boot_params': {
          'rabbitmq': 'guest:guest:rabbitmq.us-beta-4.joyent.us:5672'
        },
        'default_console': 'vga',
        'serial': 'ttyb',
        'setup': true,
        'setting_up': false,
        'last_boot': '2013-07-30T20:29:00.000Z',
        'created': '2013-04-01T13:24:21.000Z',
        'transitional_status': '',
        'hostname': '00-25-90-94-37-3c',
        'last_heartbeat': '2013-08-23T14:58:22.084Z',
        'status': 'running',
        'overprovision_ratios': {
          'cpu': 4,
          'ram': 1,
          'disk': 1
        },
        'memory_available_bytes': 125551230976,
        'memory_arc_bytes': 1945323800,
        'memory_total_bytes': 137399590912,
        'disk_kvm_zvol_used_bytes': 44023414784,
        'disk_kvm_zvol_volsize_bytes': 44023414784,
        'disk_kvm_quota_bytes': 10737418240,
        'disk_zone_quota_bytes': 134217728000,
        'disk_cores_quota_bytes': 536870912000,
        'disk_installed_images_used_bytes': 5905771008,
        'disk_pool_size_bytes': 3582002724864,
        'vms': {
          '736ddef6-8854-4dd5-82a0-2d184bd90cd4': {
            'uuid': '736ddef6-8854-4dd5-82a0-2d184bd90cd4',
            'owner_uuid': '9dce1460-0c4c-4417-ab8b-25ca478c5a78',
            'quota': 25,
            'max_physical_memory': 128,
            'zone_state': 'running',
            'state': 'running',
            'brand': 'joyent',
            'cpu_cap': 100,
            'last_modified': '2013-06-21T17:38:51.000Z'
          },
          'c3ae2426-9ed2-4322-a780-9ef032359d9a': {
            'uuid': 'c3ae2426-9ed2-4322-a780-9ef032359d9a',
            'owner_uuid': '390c229a-8c77-445f-b227-88e41c2bb3cf',
            'quota': 25,
            'max_physical_memory': 1024,
            'zone_state': 'running',
            'state': 'running',
            'brand': 'joyent',
            'cpu_cap': 300,
            'last_modified': '2013-06-06T22:22:31.000Z'
          },
          '9dc466a4-b918-4a6f-9226-1e49d0017a79': {
            'uuid': '9dc466a4-b918-4a6f-9226-1e49d0017a79',
            'owner_uuid': '390c229a-8c77-445f-b227-88e41c2bb3cf',
            'quota': 25,
            'max_physical_memory': 128,
            'zone_state': 'running',
            'state': 'running',
            'brand': 'joyent',
            'cpu_cap': 100,
            'last_modified': '2013-07-09T20:22:25.000Z'
          },
          '01d16d02-9713-4bfa-a572-b68ef9eed942': {
            'uuid': '01d16d02-9713-4bfa-a572-b68ef9eed942',
            'owner_uuid': '390c229a-8c77-445f-b227-88e41c2bb3cf',
            'quota': 10,
            'max_physical_memory': 1280,
            'zone_state': 'running',
            'state': 'running',
            'brand': 'kvm',
            'cpu_cap': 300,
            'last_modified': '2013-07-30T20:30:52.000Z'
          },
          '6295c165-e718-47be-b4d1-af78ee54bbb9': {
            'uuid': '6295c165-e718-47be-b4d1-af78ee54bbb9',
            'owner_uuid': '9dce1460-0c4c-4417-ab8b-25ca478c5a78',
            'quota': 25,
            'max_physical_memory': 8192,
            'zone_state': 'running',
            'state': 'running',
            'brand': 'joyent-minimal',
            'cpu_cap': 400,
            'last_modified': '2013-08-20T00:16:45.000Z'
          },
          'edaaee38-6e2a-4f0c-b7af-655959b60c36': {
            'uuid': 'edaaee38-6e2a-4f0c-b7af-655959b60c36',
            'owner_uuid': '17d6dd35-291a-407a-884c-c4c1bff4476b',
            'quota': 25,
            'max_physical_memory': 128,
            'zone_state': 'installed',
            'state': 'failed',
            'brand': 'joyent',
            'cpu_cap': 100,
            'last_modified': '2013-07-08T12:07:31.000Z'
          }
        }
      },
      {
        'datacenter': 'us-beta-4',
        'sysinfo': {
          'Live Image': '20130111T180733Z',
          'System Type': 'SunOS',
          'Manufacturer': 'Supermicro',
          'Product': 'X9DRD-7LN4F',
          'Serial Number': '0123456789',
          'UUID': '00000000-0000-0000-0000-0025909437d4',
          'Hostname': '00-25-90-94-37-d4',
          'VM Capable': true,
          'CPU Type': 'Intel(R) Xeon(R) CPU E5-2670 0 @ 2.60GHz',
          'CPU Virtualization': 'vmx',
          'CPU Physical Cores': 4,
          'CPU Total Cores': 64,
          'MiB of Memory': '131043',
          'Disks': {
            'c0t5000A7203007B1A7d0': {
              'Size in GB': 100
            },
            'c10t5000CCA02201A769d0': {
              'Size in GB': 600
            },
            'c11t5000CCA022016B95d0': {
              'Size in GB': 600
            },
            'c12t5000CCA01603FA1Dd0': {
              'Size in GB': 600
            },
            'c13t5000CCA02201A10Dd0': {
              'Size in GB': 600
            },
            'c1t5000CCA0160E28C1d0': {
              'Size in GB': 600
            },
            'c2t5000CCA01605A655d0': {
              'Size in GB': 600
            },
            'c3t5000CCA0160B77D9d0': {
              'Size in GB': 600
            },
            'c4t5000CCA022040CE9d0': {
              'Size in GB': 600
            },
            'c5t5000CCA022016689d0': {
              'Size in GB': 600
            },
            'c6t5000CCA016101D7Dd0': {
              'Size in GB': 600
            },
            'c7t5000CCA016148739d0': {
              'Size in GB': 600
            },
            'c8t5000CCA02203E461d0': {
              'Size in GB': 600
            },
            'c9t5000CCA02203E4ADd0': {
              'Size in GB': 600
            }
          },
          'Boot Parameters': {
            'rabbitmq': 'guest:guest:10.3.1.23:5672',
            'hostname': '00-25-90-94-37-d4',
            'boot_time': '2013:0:30:18:10:27',
            'admin_nic': '00:25:90:94:37:d4',
            'external_nic': '90:e2:ba:26:59:6c'
          },
          'Network Interfaces': {
            'igb0': {
              'MAC Address': '00:25:90:94:37:d4',
              'ip4addr': '10.3.1.33',
              'Link Status': 'up',
              'NIC Names': [
                'admin'
              ]
            },
            'igb1': {
              'MAC Address': '00:25:90:94:37:d5',
              'ip4addr': '',
              'Link Status': 'unknown',
              'NIC Names': []
            },
            'igb2': {
              'MAC Address': '00:25:90:94:37:d6',
              'ip4addr': '',
              'Link Status': 'unknown',
              'NIC Names': []
            },
            'igb3': {
              'MAC Address': '00:25:90:94:37:d7',
              'ip4addr': '',
              'Link Status': 'unknown',
              'NIC Names': []
            },
            'ixgbe0': {
              'MAC Address': '90:e2:ba:26:59:6c',
              'ip4addr': '',
              'Link Status': 'unknown',
              'NIC Names': [
                'external'
              ]
            },
            'ixgbe1': {
              'MAC Address': '90:e2:ba:26:59:6d',
              'ip4addr': '',
              'Link Status': 'unknown',
              'NIC Names': []
            }
          },
          'Virtual Network Interfaces': {},
          'Link Aggregations': {},
          'Zpool': 'zones',
          'Zpool Creation': 1359153251,
          'Zpool Disks': 'c0t5000A7203007B1A7d0,c10t5000CCA02201A769d0,c11t5000CCA022016B95d0,c12t5000CCA01603FA1Dd0,c13t5000CCA02201A10Dd0,c1t5000CCA0160E28C1d0,c2t5000CCA01605A655d0,c3t5000CCA0160B77D9d0,c4t5000CCA022040CE9d0,c5t5000CCA022016689d0,c6t5000CCA016101D7Dd0,c7t5000CCA016148739d0,c8t5000CCA02203E461d0,c9t5000CCA02203E4ADd0',
          'Zpool Profile': 'mirror',
          'Zpool Size in GiB': 3283
        },
        'ram': 131043,
        'current_platform': '20130111T180733Z',
        'headnode': false,
        'boot_platform': '20130111T180733Z',
        'overprovision_ratio': 1,
        'reservation_ratio': 0.15,
        'traits': {},
        'rack_identifier': '',
        'comments': '',
        'uuid': '00000000-0000-0000-0000-0025909437d4',
        'reserved': false,
        'boot_params': {
          'rabbitmq': 'guest:guest:rabbitmq.us-beta-4.joyent.us:5672'
        },
        'default_console': 'vga',
        'serial': 'ttyb',
        'setup': true,
        'setting_up': false,
        'last_boot': '2013-01-30T18:11:13.000Z',
        'created': '2013-01-25T22:34:11.000Z',
        'transitional_status': '',
        'hostname': '00-25-90-94-37-d4',
        'last_heartbeat': '2013-08-23T14:58:20.111Z',
        'status': 'running',
        'overprovision_ratios': {
          'cpu': 4,
          'ram': 1,
          'disk': 1
        },
        'memory_available_bytes': 40111435776,
        'memory_arc_bytes': 71384713856,
        'memory_total_bytes': 137399590912,
        'disk_kvm_zvol_used_bytes': 0,
        'disk_kvm_zvol_volsize_bytes': 0,
        'disk_kvm_quota_bytes': 0,
        'disk_zone_quota_bytes': 3379065520128,
        'disk_cores_quota_bytes': 27943501824000,
        'disk_installed_images_used_bytes': 6539030016,
        'disk_pool_size_bytes': 3582002724864,
        'vms': {
          '0474f238-353f-4cad-90a1-fdde2a3e0c93': {
            'uuid': '0474f238-353f-4cad-90a1-fdde2a3e0c93',
            'brand': 'joyent',
            'zone_state': 'running',
            'state': 'running',
            'owner_uuid': '9c294396-cddf-44b7-924b-baaddbec4be6',
            'max_physical_memory': 512,
            'cpu_cap': 350,
            'last_modified': '2013-05-22T21:25:05.000Z',
            'create_timestamp': '2013-05-22T21:25:05.000Z',
            'quota': 10
          },
          '6f0a4b97-3642-48ba-bae1-b1215f4ad972': {
            'uuid': '6f0a4b97-3642-48ba-bae1-b1215f4ad972',
            'brand': 'joyent',
            'zone_state': 'running',
            'state': 'running',
            'owner_uuid': 'd97bb63b-b7cb-4711-acc3-d9437619e71c',
            'max_physical_memory': 1024,
            'cpu_cap': 350,
            'last_modified': '2013-05-22T21:25:05.000Z',
            'create_timestamp': '2013-05-22T21:25:05.000Z',
            'quota': 15
          },
          '834bd053-ddb4-4d68-8bcd-5db976501cb6': {
            'uuid': '834bd053-ddb4-4d68-8bcd-5db976501cb6',
            'brand': 'joyent',
            'zone_state': 'running',
            'state': 'running',
            'owner_uuid': '390c229a-8c77-445f-b227-88e41c2bb3cf',
            'max_physical_memory': 1024,
            'cpu_cap': 350,
            'last_modified': '2013-06-21T12:46:34.000Z',
            'create_timestamp': '2013-06-21T12:46:34.000Z',
            'quota': 15
          },
          '29d4f6b3-ccf1-481f-a0fa-5f04b0d4b853': {
            'uuid': '29d4f6b3-ccf1-481f-a0fa-5f04b0d4b853',
            'brand': 'joyent',
            'zone_state': 'running',
            'state': 'running',
            'owner_uuid': '390c229a-8c77-445f-b227-88e41c2bb3cf',
            'max_physical_memory': 1024,
            'cpu_cap': 350,
            'last_modified': '2013-05-22T21:25:05.000Z',
            'create_timestamp': '2013-05-22T21:25:05.000Z',
            'quota': 15
          },
          '1ac5a633-c0ab-4bd3-9642-92f84470406f': {
            'uuid': '1ac5a633-c0ab-4bd3-9642-92f84470406f',
            'brand': 'joyent',
            'zone_state': 'running',
            'state': 'running',
            'owner_uuid': '390c229a-8c77-445f-b227-88e41c2bb3cf',
            'max_physical_memory': 512,
            'cpu_cap': 350,
            'last_modified': '2013-05-22T21:25:06.000Z',
            'create_timestamp': '2013-05-22T21:25:06.000Z',
            'quota': 10
          },
          'ae9f609c-25b6-47fb-b429-e7e341a7875f': {
            'uuid': 'ae9f609c-25b6-47fb-b429-e7e341a7875f',
            'brand': 'joyent',
            'zone_state': 'running',
            'state': 'running',
            'owner_uuid': '390c229a-8c77-445f-b227-88e41c2bb3cf',
            'max_physical_memory': 512,
            'cpu_cap': 350,
            'last_modified': '2013-05-22T21:25:06.000Z',
            'create_timestamp': '2013-05-22T21:25:06.000Z',
            'quota': 10
          },
          'a90b17b8-527f-4b57-bef9-c429c2d90049': {
            'uuid': 'a90b17b8-527f-4b57-bef9-c429c2d90049',
            'brand': 'joyent',
            'zone_state': 'running',
            'state': 'running',
            'owner_uuid': '5c3a2297-e01b-4faf-9495-8d8c3314e08c',
            'max_physical_memory': 64,
            'cpu_cap': 350,
            'last_modified': '2013-05-14T18:23:07.000Z',
            'create_timestamp': '2013-05-14T18:23:07.000Z',
            'quota': 1024
          },
          '6b525cdd-8d0d-454a-9b0a-39cd654300cd': {
            'uuid': '6b525cdd-8d0d-454a-9b0a-39cd654300cd',
            'brand': 'joyent',
            'zone_state': 'running',
            'state': 'running',
            'cpu_cap': 700,
            'owner_uuid': 'f723a444-e17e-4c6f-a1f9-233ea4ccb48b',
            'max_physical_memory': 1024,
            'last_modified': '2013-05-14T18:23:08.000Z',
            'create_timestamp': '2013-05-14T18:23:08.000Z',
            'quota': 1024
          },
          '02dd4dd4-6393-457b-a859-359da549549c': {
            'uuid': '02dd4dd4-6393-457b-a859-359da549549c',
            'brand': 'joyent',
            'zone_state': 'running',
            'state': 'running',
            'owner_uuid': '13ed069e-d25e-47c9-a91f-0c202e25e945',
            'max_physical_memory': 64,
            'cpu_cap': 350,
            'last_modified': '2013-05-14T18:23:08.000Z',
            'create_timestamp': '2013-05-14T18:23:08.000Z',
            'quota': 1024
          }
        }
      },
      {
        'datacenter': 'us-beta-4',
        'uuid': 'asdsa',
        'setup': true
      }
    ]
    /* END JSSTYLED */
};
