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

// Set a bit in a bitmask
function bit_set(num, bit) {
	num |= bit;
	return num;
}

var RAD = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.led       = led;
	this.parse_out = parse_out;

	// Parse data sent from RAD module
	function parse_out(data) {
		// Init variables
		var src     = data.src;
		var dst     = data.dst;
		var message = data.msg;

		var command;
		var value;

		// Device status
		switch (message[0]) {
			case 0x01: // device status request + CD changer emulation handling
				if (data.dst_name == 'CDC') {
					command = 'device status request';
					value   = 'CD changer';

					// Do CDC->LOC Device status ready
					omnibus.CDC.send_device_status();
				}
				break;

			case 0x02: // device status

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

			case 0x10: // Ignition status request
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x23: // Update display text
				command = 'update';
				value   = 'display text';
				break;

			case 0x38: // CD control status request
				if (data.dst_name == 'CDC') {
					command = 'request'
					value   = '[CDC] CD control status';

					// Do CDC->LOC CD status play
					omnibus.CDC.send_cd_status_play();
				}
				break;

			case 0x4a: // Cassette status
				command = 'cassette status';
				value   = 'request';

				omnibus.BMBT.send_cassette_status;
				break;

			case 0x79: // Door/flap status request
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

	// Turn on/off/flash the RAD LED by encoding a bitmask from an input object
	function led(object) {
		console.log('[node-bmw] Encoding \'RAD LED\' packet');

		// Bitmask
		// 0x00 = all off
		// 0x01 = solid red
		// 0x02 = flash red
		// 0x04 = solid yellow
		// 0x08 = flash yellow
		// 0x10 = solid green
		// 0x20 = flash green

		// Initialize output byte
		var byte = 0x00;

		if (object.solid_red)    { byte = bit_set(byte, bit_0); }
		if (object.flash_red)    { byte = bit_set(byte, bit_1); }
		if (object.solid_yellow) { byte = bit_set(byte, bit_2); }
		if (object.flash_yellow) { byte = bit_set(byte, bit_3); }
		if (object.solid_green)  { byte = bit_set(byte, bit_4); }
		if (object.flash_green)  { byte = bit_set(byte, bit_5); }

		// Assemble strings
		var src     = 0xC8; // TEL
		var dst     = 0xE7; // OBC
		var command = 0x2B; // Turn on radio LED
		var packet  = [command, byte];

		// Send message
		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(packet),
		}

		// Send the message
		console.log('[node-bmw] Sending \'RAD LED\' packet');

		omnibus.ibus_connection.send_message(ibus_packet);
	}
}

module.exports = RAD;
