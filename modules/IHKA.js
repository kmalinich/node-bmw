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

var IHKA = function(omnibus) {
	// Exposed data
	this.parse_out = parse_out;

	// Parse data sent from IHKA module
	function parse_out(data) {
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
				value   = 'temperature';
				break;

				// Request: rain sensor status
			case 0x71:
				command = 'request';
				value   = 'rain sensor status';
				break;

				// Door/flap status request
			case 0x79:
				command = 'request';
				value   = 'door/flap status';
				break;

				// AC compressor status
			case 0x83:
				command = 'broadcast';
				value   = 'AC compressor status';
				break;

				// Diagnostic command replies
			case 0xA0:
				command = 'diagnostic command';
				value   = 'acknowledged';
				break;

			case 0xA2:
				command = 'diagnostic command';
				value   = 'rejected';
				break;

			case 0xFF:
				command = 'diagnostic command';
				value   = 'not acknowledged';
				break;

			default:
				command = 'unknown';
				value   = Buffer.from(data.msg);
				break;
		}

		console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
	}
}

module.exports = IHKA;
