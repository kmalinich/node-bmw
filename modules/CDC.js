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

var CDC = function(omnibus) {
	// Self reference
	var _self = this;

	// Reset bit
	var reset = true;

	// Exposed data
	this.parse_data          = parse_data;
	this.send_cd_status_play = send_cd_status_play;
	this.send_cd_status_stop = send_cd_status_stop;
	this.send_device_status  = send_device_status;

	// Parse data sent from CDC module
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

			case 0x16: // Request: odometer
				command = 'request';
				data    = 'odometer';
				break;

			case 0x39: // Broadcast: CD status
				command = 'broadcast';
				data    = 'CD status';
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

		console.log('[CDC->???] Sent %s:', command, data);
	}

	// CDC->LOC Device status ready
	function send_device_status() {
		// Init variables
		var command = 'device status';
		var src     = 0x18; // CDC
		var dst     = 0xFF; // LOC

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

		omnibus.ibus.send_message(ibus_packet);

		console.log('[CDC->LOC] Sent %s:', command, data);
	}

	// CDC->RAD CD status stopped
	function send_cd_status_stop() {
		// Init variables
		var command = 'CD status';
		var data    = 'stopped';

		var src = 0x18; // CDC
		var dst = 0x68; // RAD
		var msg = [0x39, 0x00, 0x02, 0x00, 0x01, 0x00, 0x01, 0x01];

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus.send_message(ibus_packet);

		console.log('[CDC->LOC] Sent %s:', command, data);
	}

	// CDC->RAD CD status playing
	function send_cd_status_play() {
		// Init variables
		var command = 'CD status';
		var data    = 'playing';

		var src = 0x18; // CDC
		var dst = 0x68; // RAD
		var msg = [0x39, 0x02, 0x09, 0x00, 0x01, 0x00, 0x01, 0x00];

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus.send_message(ibus_packet);

		console.log('[CDC->LOC] Sent %s:', command, data);
	}
}

module.exports = CDC;
