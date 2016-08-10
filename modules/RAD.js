#!/usr/bin/env node

// npm libraries
var clc  = require('cli-color');
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
	this.led        = led;
	this.parse_data = parse_data;

	// Turn on/off/flash the RAD LED by encoding a bitmask from an input object
	function led(object) {
		console.log('[RAD]  Encoding \'RAD LED\' packet');

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
		console.log('[RAD]  Sending \'RAD LED\' packet');
		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// Parse data sent by real RAD module
	function parse_data(packet) {
		// Init variables
		var dst     = omnibus.bus_modules.get_module_name(packet.dst);
		var src     = omnibus.bus_modules.get_module_name(packet.src);
		var message = packet.msg;
		var command;
		var data;

		// Device status
		if (message[0] == 0x02) {
			if (message[1] == 0x00) {
				command = 'device status';
				data    = 'ready';
			}

			else if (message[1] == 0x01) {
				command = 'device status';
				data    = 'ready after reset';
			}
		}

		// Ignition status request
		else if (message[0] == 0x10) {
			command = 'request';
			data    = 'ignition status';
		}

		// Door/flap status request
		else if (message[0] == 0x79) {
			command = 'request';
			data    = 'door/flap status';
		}

		// CD changer emulation handling
		else if (dst == 'CDC' && message[0] == 0x01) {
			command = 'request'
			command = '[CDC] device status';

			// Do CDC->LOC Device status ready
			omnibus.CDC.send_device_status_ready();
		}

		else if(dst == 'CDC' && message[0] == 0x38 && message[1] == 0x00 && message[2] == 0x00) {
			command = 'request'
			data    = '[CDC] CD control status';


			// Do CDC->LOC CD status play
			omnibus.CDC.send_cd_status_play();
		}

		else {
			command = 'unknown';                                                                    
			data    = new Buffer(message);
		}

		console.log('[RAD]  Sent %s:', command, data);
	}
}

module.exports = RAD;
