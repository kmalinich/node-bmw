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


var BMBT = function(omnibus) {

	// Self reference
	var _self = this;

	// Exposed data
	this.parse_data = parse_data;


	// Parse data sent by real BMBT module
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

			case 0x32: // Broadcast: volume control
				command = 'broadcast';
				data    = 'volume control';
				break;

			case 0x47: // Broadcast: BM status
				command = 'broadcast';
				data    = 'BM status';
				break;

			case 0x47: // Broadcast: BM button
				command = 'broadcast';
				data    = 'BM button';
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

		console.log('[BMBT] Sent %s:', command, data);
	}
}

module.exports = BMBT;
