#!/usr/bin/env node

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

var ANZV = function(omnibus) {
	// Exposed data
	this.parse_data = parse_data;

	// Parse data sent from ANZV module
	function parse_data(message) {
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x02: // Broadcast: device status
				command = 'device status';

				switch (data.msg[1]) {
					case 0x00:
						value = 'ready';
						break;

					case 0x01:
						value = 'ready after reset';
						break;

					default:
						value = 'unknown';
						break;
				}
				break;

			case 0x10: // Request: ignition status
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x12: // Request: IKE sensor status
				command = 'request';
				value   = 'IKE sensor status';
				break;

			case 0x1D: // Request: temperature
				command = 'request';
				value   = 'temperature';
				break;

			case 0x79: // Request: door/flap status
				command = 'request';
				value   = 'door/flap status';
				break;

			default:
				command = 'unknown';
				value   = Buffer.from(data.msg);
				break;
		}

		console.log('[ANZV] Sent %s:', command, value);
	}
}

module.exports = ANZV;
