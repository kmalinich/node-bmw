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


var IHKA = function(omnibus) {

	// Self reference
	var _self = this;

	// Exposed data
	this.parse_out = parse_out;

	// Parse data sent from IHKA module
	function parse_out(message) {
		// Init variables
		var src      = data.src;
		var dst      = data.dst;
		var message  = data.msg;

		var command;
		var value;

		// Device status
		if (message[0] == 0x02) {
			if (message[1] == 0x00) {
				command = 'device status';
				value   = 'ready';
			}

			else if (message[1] == 0x01) {
				command = 'device status';
				value   = 'ready after reset';
			}
		}

		// Request: ignition status
		else if (message[0] == 0x10) {
			command = 'request';
			value   = 'ignition status';
		}

		// Request: temperature
		else if (message[0] == 0x12) {
			command = 'request';
			value   = 'IKE sensor status';
		}

		// Request: temperature
		else if (message[0] == 0x1D) {
			command = 'request';
			value   = 'temperature';
		}

		// Request: rain sensor status
		else if (message[0] == 0x71) {
			command = 'request';
			value   = 'rain sensor status';
		}

		// Door/flap status request
		else if (message[0] == 0x79) {
			command = 'request';
			value   = 'door/flap status';
		}

		// AC compressor status 
		else if (message[0] == 0x83) {
			command = 'broadcast';
			value   = 'AC compressor status';
		}

		// Diagnostic command replies
		else if (message[0] == 0xA0) {
			command = 'diagnostic command';
			value   = 'acknowledged';
		}

		else if (message[0] == 0xA2) {
			command = 'diagnostic command';
			value   = 'rejected';
		}

		else if (message[0] == 0xFF) {
			command = 'diagnostic command';
			value   = 'not acknowledged';
		}

		else {
			command = 'unknown';                                                                    
			value   = new Buffer(message);
		}

		console.log('[%s->%s] %s:', data.src_name, data.dst_name, command, value);
	}
}

module.exports = IHKA;
