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


var EWS = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.parse_out = parse_out;

	// Parse data sent from EWS module
	function parse_out(data) {
		// Init variables
		var src      = data.src;
		var dst      = data.dst;
		var message  = data.msg;

		var command;
		var value;

		switch (message[0]) {

			case 0x02: // Broadcast: device status
				switch (message[1]) {
					case 0x00:
						command = 'device status';
						value   = 'ready';
						break;

					case 0x01:
						command = 'device status';
						value   = 'ready after reset';
						break;
				}
				break;

			case 0x10: // Request: ignition status
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x74: // Broadcast: immobiliser status
				command = 'immobiliser status';

				// Init variables
				var data_1;
				var data_2;

				// Bitmask for message[1]
				// 0x00 = no key detected
				// 0x01 = immobilisation deactivated
				// 0x04 = valid key detected

				// Key detected/vehicle immobilised
				switch (message[1]) {
					case 0x00:
						data_1 = 'no key detected';
						break;
					case 0x01:
						data_1 = 'immobilisation deactivated';
						break;
					case 0x04:
						data_1 = 'valid key detected'; 
						break;
					default:
						data_1 = new Buffer([message[1]]);
						break;
				}

				// Key #/Vehicle immobilised
				switch (message[2]) {
					case 0x01:
						data_2 = 'key 1';
						break;
					case 0x02:
						data_2 = 'key 2';
						break;
					case 0x03:
						data_2 = 'key 3';
						break;
					case 0x04:
						data_2 = 'key 4';
						break;
					case 0x05:
						data_2 = 'key 5';
						break;
					case 0x06:
						data_2 = 'key 6';
						break;
					case 0xFF:
						data_2 = 'immobilised';
						break;
					default:
						data_1 = new Buffer([message[1]]);
						break;
				}

				// Assemble string
				data = data_1+' '+data_2;
				break;

			case 0xA0: // Broadcast: diagnostic command acknowledged
				command = 'diagnostic command';
				value   = 'acknowledged';
				break;

			case 0xA2: // Broadcast: diagnostic command rejected
				command = 'diagnostic command';
				value   = 'rejected';
				break;

			case 0xFF: // Broadcast: diagnostic command not acknowledged
				command = 'diagnostic command';
				value   = 'not acknowledged';
				break;

			case 0x79: // Request: door/flap status
				command = 'request';
				value   = 'door/flap status';
				break;

			default:
				command = 'unknown';
				value   = new Buffer(message);
				break;
		}

		console.log('[%s->%s] %s:', data.src_name, data.dst_name, command, value);
	}
}

module.exports = EWS;
