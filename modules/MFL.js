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


var MFL = function(omnibus) {

	// Self reference
	var _self = this;

	// Exposed data
	this.parse_data = parse_data;


	// Parse data sent by real MFL module
	function parse_data(message) {
		// Init variables
		var action;
		var button;
		var command;

		// Volume buttons
		if (message[0] == 0x32) {
			command = 'button action';
			button  = 'volume';

			// Needs to be finished.. I think
			if      (message[1] == 0x10) { action = 'decrease 1 step'; }
			else if (message[1] == 0x11) { action = 'increase 1 step'; }
		}

		// Recirc button
		else if (message[0] == 0x3A) {
			command = 'button action';
			button  = 'recirculation';

			// Bitmask:
			// 0x00 = released
			// 0x08 = pressed

			if      (message[1] == 0x00) { action = 'released';  }
			else if (message[1] == 0x01) { action = 'depressed'; }
		}

		// Media control buttons
		else if (message[0] == 0x3B) {
			command = 'button action';

			// Bitmask:
			// 0x00 = no buttons pressed
			// 0x01 = right
			// 0x08 = left
			// 0x10 = long depress
			// 0x20 = release
			// 0x80 = send/end

			// Detect button
			if      (bit_test(message[1], bit_0)) { button = 'right';    }
			else if (bit_test(message[1], bit_3)) { button = 'left';     }
			else if (bit_test(message[1], bit_7)) { button = 'send/end'; }
			else {
				button = 'unknown';
			}

			// Detect action
			if      (bit_test(message[1], bit_4)) { action = 'long depress'; }
			else if (bit_test(message[1], bit_5)) { action = 'release';      }
			else {
				action = 'depress';
			}

			if (button == 'left' && action == 'depress') {
				console.log('[MFL]  Sending previous track command over system bus');

				// Send previous track command to BlueZ
				omnibus.system_bus.invoke({
					path        : '/org/bluez/hci0/dev_EC_88_92_5E_5D_36/player0',
					destination : 'org.bluez',
					'interface' : 'org.bluez.MediaPlayer1',
					member      : 'Previous',
					type        : dbus.messageType.methodCall
				});
			}

			else if (button == 'right' && action == 'depress') {
				console.log('[MFL]  Sending next track command over system bus');

				// Send next track command to BlueZ
				omnibus.system_bus.invoke({
					path        : '/org/bluez/hci0/dev_EC_88_92_5E_5D_36/player0',
					destination : 'org.bluez',
					'interface' : 'org.bluez.MediaPlayer1',
					member      : 'Next',
					type        : dbus.messageType.methodCall
				});
			}
		}

		// Nope..
		// 50 B0 01,MFL --> SES: Device status request
		// 50 C8 01,MFL --> TEL: Device status request
		// else if (message[0] == 0x01) {
		//  command = 'button action';
		//  button  = 'r/t';
		//  action  = 'depress';
		// }

		else {
			command = 'unknown';
			button  = 'unknown';
			action  = new Buffer(message);
		}

		console.log('[MFL]  Sent %s: %s', command, button, action);
	}
}

module.exports = MFL;
