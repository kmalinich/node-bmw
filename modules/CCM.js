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


var CCM = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.parse_out = parse_out;

	// Parse data sent from CCM module
	function parse_out(data) {
		// Init variables
		var src      = data.src;
		var dst      = data.dst;
		var message  = data.msg;

		var command;
		var value;

		switch (message[0]) {
			case 0x02: // Broadcast: device status
				if (message[1] == 0x00) {
					command = 'device status';
					value   = 'ready';
				}

				else if (message[1] == 0x01) {
					command = 'device status';
					value   = 'ready after reset';
				}
				break;

			case 0x10: // Request: ignition status
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x1A: // Broadcast: check control message 
				command = 'check control message';
				value   = ''+message+'';
				break;

			case 0x51: // Broadcast: check control sensors
				command = 'check control sensors';
				value   = 'unknown';
				break;

			case 0x73: // Request: immobiliser status
				command = 'request';
				value   = 'immobiliser status';
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

module.exports = CCM;
