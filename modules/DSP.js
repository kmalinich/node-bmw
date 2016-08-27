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


var DSP = function(omnibus) {

	// Self reference
	var _self = this;

	// Exposed data
	this.parse_data               = parse_data;
	this.send_device_status_ready = send_device_status_ready;

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

			case 0x35: // Broadcast: car memory
				command = 'broadcast';
				data    = 'car memory';
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

		console.log('[DSP]  Sent %s:', command, data);
	}

	// DSP->GLO Device status ready
	function send_device_status_ready() {
		// Init variables
		var command = 'device status';
		var src     = 0x6A; // DSP
		var dst     = 0xBF; // GLO
    var data;
    var msg;

		// Handle 'ready' vs. 'ready after reset'
		if (reset == true) {
			reset = false;
			data  = 'ready';
			msg   = [0x02, 0x00];
		}
		else {
			data = 'ready after reset';
			msg  = [0x02, 0x01];
		}

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus_connection.send_message(ibus_packet);

		console.log('[DSP->GLO] Sent %s:', command, data);
	}
}

module.exports = DSP;
