#!/usr/bin/env node

// npm libraries
var dbus = require('dbus-native');
var wait = require('wait.for');

// Bitmasks in hex
var bit_0 = 0x01; // 1
var bit_1 = 0x02; // 2
var bit_2 = 0x04; // 4
var bit_3 = 0x08; // 8
var bit_4 = 0x10; // 16
var bit_5 = 0x20; // 32
var bit_6 = 0x40; // 64
var bit_7 = 0x80; // 128

// Test number for bitmask
function bit_test(num, bit) {
	if ((num & bit) != 0) { return true; }
	else { return false; }
}


var NAV = function(omnibus) {

	// Self reference

	// Exposed data
	this.parse_data = parse_data;

	// 7F 80 1F 40 14 58 07 00 07 20 11,NAV --> IKE Time & date UTC 14:58 07 Juli 2011
	// 7F 80 1F 40 14 59 07 00 07 20 11,NAV --> IKE Time & date UTC 14:59 07 Juli 2011
	// 7F 80 1F 40 16 35 24 00 07 20 11,NAV --> IKE Time & date UTC 16:35 24 Juli 2011
	// 7F 80 1F 40 17 47 05 00 06 20 11,NAV --> IKE Time & date UTC 17:47 05 Juni 2011
	// 7F 80 1F 40 17 48 05 00 06 20 11,NAV --> IKE Time & date UTC 17:48 05 Juni 2011
	// 7F 80 1F 40 17 49 05 00 06 20 11,NAV --> IKE Time & date UTC 17:49 05 Juni 2011
	// 7F 80 1F 40 17 50 05 00 06 20 11,NAV --> IKE Time & date UTC 17:50 05 Juni 2011
	// 7F 80 1F 40 17 51 05 00 06 20 11,NAV --> IKE Time & date UTC 17:51 05 Juni 2011
	// 7F 80 1F 40 17 52 05 00 06 20 11,NAV --> IKE Time & date UTC 17:52 05 Juni 2011
	// 7F 80 1F 40 17 53 05 00 06 20 11,NAV --> IKE Time & date UTC 17:53 05 Juni 2011
	// 7F 80 1F 40 17 54 05 00 06 20 11,NAV --> IKE Time & date UTC 17:54 05 Juni 2011
	// 7F 80 1F 40 17 55 05 00 06 20 11,NAV --> IKE Time & date UTC 17:55 05 Juni 2011
	// 7F 80 1F 40 19 05 13 00 10 20 11,NAV --> IKE Time & date UTC 19:05 13 October 2011
	// 7F 80 1F 40 20 07 12 00 10 20 11,NAV --> IKE Time & date UTC 20:07 12 Oktober 2011
	// 7F 80 1F 40 20 07 20 00 07 20 11,NAV --> IKE Time & date UTC 20:07 20 Juli 2011
	// 7F 80 1F 40 20 08 12 00 10 20 11,NAV --> IKE Time & date UTC 20:08 12 Oktober 2011
	// 7F 80 1F 40 20 08 20 00 07 20 11,NAV --> IKE Time & date UTC 20:08 20 Juli 2011
	// 7F 80 1F 40 20 15 22 00 08 20 11,NAV --> IKE Time & date UTC 20:15 22 August 2011
	// 7F 80 1F 40 20 16 22 00 08 20 11,NAV --> IKE Time & date UTC 20:16 22 August 2011
	// 7F 80 1F 40 21 26 06 00 07 20 11,NAV --> IKE Time & date UTC 21:26 06 Juli 2011
	// 7F 80 1F 40 21 27 06 00 07 20 11,NAV --> IKE Time & date UTC 21:27 06 Juli 2011
	// 7F 80 1F 40 21 28 06 00 07 20 11,NAV --> IKE Time & date UTC 21:28 06 Juli 2011
	// 7F 80 1F 40 21 28 25 00 10 20 11,NAV --> IKE Time & date UTC 21:28 25 October 2011
	// 7F 80 1F 40 21 29 06 00 07 20 11,NAV --> IKE Time & date UTC 21:29 06 Juli 2011
	// 7F 80 1F 40 21 29 25 00 10 20 11,NAV --> IKE Time & date UTC 21:29 25 October 2011
	// 7F 80 1F 40 21 30 25 00 10 20 11,NAV --> IKE Time & date UTC 21:30 25 October 2011
	// 7F 80 1F 40 21 31 25 00 10 20 11,NAV --> IKE Time & date UTC 21:31 25 October 2011
	// 7F 80 1F 40 21 32 25 00 10 20 11,NAV --> IKE Time & date UTC 21:32 25 October 2011
	// 7F 80 1F 40 21 33 25 00 10 20 11,NAV --> IKE Time & date UTC 21:33 25 October 2011
	// 7F 80 1F 40 21 34 25 00 10 20 11,NAV --> IKE Time & date UTC 21:34 25 October 2011
	// 7F 80 1F 40 21 35 25 00 10 20 11,NAV --> IKE Time & date UTC 21:35 25 October 2011
	// 7F 80 1F 40 21 36 25 00 10 20 11,NAV --> IKE Time & date UTC 21:36 25 October 2011
	// 7F 80 1F 40 21 37 25 00 10 20 11,NAV --> IKE Time & date UTC 21:37 25 October 2011
	// 7F 80 1F 40 21 38 25 00 10 20 11,NAV --> IKE Time & date UTC 21:38 25 October 2011

	// Parse data sent from NAV module
	function parse_data(message) {
		// Init variables
		var command;
		var data;

		switch (message[0]) {
			case 0x01: // Request: device status
				command = 'request';
				data    = 'device status';
				break;

			case 0x02: // Device status
				switch (message[1]) {
					case 0x00:
						command = 'device status';
						data    = 'ready';
						break;

					case 0x01:
						command = 'device status';
						data    = 'ready after reset';
						break;
				}
				break;

			case 0x10: // Request: ignition status
				command = 'request';
				data    = 'ignition status';
				break;

			case 0x5D: // Request: light dimmer status
				command = 'request';
				data    = 'light dimmer status';
				break;

			case 0x79: // Request: door/flap status
				command = 'request';
				data    = 'door/flap status';
				break;

			default:
				command = 'unknown';
				data    = new Buffer(message);
				break;
		}

		console.log('[NAV] Sent %s:', command, data);
	}
}

module.exports = NAV;
