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

// Reset bit
var reset = true;

// Test number for bitmask
function bit_test(num, bit) {
	if ((num & bit) != 0) { return true; }
	else { return false; }
}

var MID = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.parse_in           = parse_in;
	this.parse_out          = parse_out;
	this.send_device_status = send_device_status;

	// Parse data sent to MID module
	function parse_in(data) {
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x01: // Request: device status
				command = 'request';
				value   = 'device status';

				// Send the ready packet since this module doesn't actually exist
				send_device_status();
				break;

			case 0x02: // Device status
				switch (data.msg[1]) {
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

			default:
				command = 'unknown';
				value   = new Buffer(data.msg);
				break;
		}

		console.log('[%s->%s] %s:', data.src_name, data.dst_name, command, value);
	}

	// Parse data sent from MID module
	function parse_out(data) {
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x01: // Request: device status
				command = 'request';
				value   = 'device status';
				break;

			case 0x02: // Device status
				switch (data.msg[1]) {
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

			case 0x35: // Broadcast: car memory
				command = 'broadcast';
				value   = 'car memory';
				break;

			case 0x79: // Request: door/flap status
				command = 'request';
				value   = 'door/flap status';
				break;

			default:
				command = 'unknown';
				value   = new Buffer(data.msg);
				break;
		}

		console.log('[%s->%s] %s:', data.src_name, data.dst_name, command, value);
	}

	// MID->GLO Device status ready
	function send_device_status() {
		// Init variables
		var src      = 0xC0; // MID
		var dst      = 0xBF; // GLO
		var src_name = 'MID'; 
		var dst_name = 'GLO'; 
		var command  = 'device status';
    var data;
    var msg;

		// Handle 'ready' vs. 'ready after reset'
		if (reset == true) {
			data  = 'ready after reset';
			reset = false;
			msg   = [0x02, 0x01];
		}
		else {
			data  = 'ready';
			msg   = [0x02, 0x00];
		}

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(msg),
		}

		console.log('[%s->%s] %s:', src_name, dst_name, command, data);

		omnibus.ibus_connection.send_message(ibus_packet);
	}
}

module.exports = MID;
