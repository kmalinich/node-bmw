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


var MFL = function(omnibus) {

	// Self reference
	var _self = this;

	// Exposed data
	this.parse_data = parse_data;

	// Parse data sent from MFL module
	function parse_data(message) {
		// Init variables
		var action;
		var button;
		var command;

		// 50 B0 01,MFL --> SES: Device status request
		// 50 C8 01,MFL --> TEL: Device status request

		switch (message[0]) {
			case 0x01: // Device status request
				command = 'request';
				button  = 'device status';
				action  = '';
				break;

			case 0x32: // Volume buttons
				command = 'button action';
				button  = 'volume';

				switch (message[1]) {
					case 0x10:
						action = 'decrease 1 step';
						break;
					case 0x11:
						action = 'increase 1 step';
						break;
				}
				break;

			case 0x3a: // Recirculation buton
				command = 'button action';
				button  = 'recirculation';

				switch (message[1]) {
					case 0x00:
						action = 'released';
						break;
					case 0x08:
						action = 'depressed';
						break;
				}

				break;

			case 0x3b: // Media control buttons
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
				else                                  { button = 'unknown';  }

				// Detect action
				if      (bit_test(message[1], bit_4)) { action = 'long depress'; }
				else if (bit_test(message[1], bit_5)) { action = 'release';      }
				else                                  { action = 'depress';      }

				// Perform media control based on pressed key
				// if      (button == 'left'     && action == 'depress')      { omnibus.BT.command('previous'); }
				// else if (button == 'right'    && action == 'depress')      { omnibus.BT.command('next');     }
				// else if (button == 'send/end' && action == 'depress')      { omnibus.BT.command('pause');    } // Think about it...
				// else if (button == 'send/end' && action == 'long depress') { omnibus.BT.command('play');     }
				break;

			case 0x5d:
				command = 'request';
				button  = 'light dimmer';
				action  = '';
				break;

			default:
				command = 'unknown';
				button  = 'unknown';
				action  = new Buffer(message);
				break;
		}

		console.log('[MFL]  Sent %s: %s', command, button, action);
	}
}

module.exports = MFL;
