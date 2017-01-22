#!/usr/bin/env node

var MFL = function() {
	// Exposed data
	this.parse_out = parse_out;

	// Parse data sent from MFL module
	function parse_out(data) {
		// Init variables
		var src      = data.src.id;
		var dst      = data.dst;
		var message  = data.msg;

		var action;
		var button;
		var command;
		var value;

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
				if      (bitmask.bit_test(message[1], bitmask.bit[0])) { button = 'right';    }
				else if (bitmask.bit_test(message[1], bitmask.bit[3])) { button = 'left';     }
				else if (bitmask.bit_test(message[1], bitmask.bit[7])) { button = 'send/end'; }
				else                                  { button = 'unknown';  }

				// Detect action
				if      (bitmask.bit_test(message[1], bitmask.bit[4])) { action = 'long depress'; }
				else if (bitmask.bit_test(message[1], bitmask.bit[5])) { action = 'release';      }
				else                                  { action = 'depress';      }

				// Perform media control based on pressed key

				// BT control version
				// if      (button == 'left'     && action == 'depress')      { omnibus.BT.command('previous'); }
				// else if (button == 'right'    && action == 'depress')      { omnibus.BT.command('next');     }
				// else if (button == 'send/end' && action == 'depress')      { omnibus.BT.command('pause');    } // Think about it...
				// else if (button == 'send/end' && action == 'long depress') { omnibus.BT.command('play');     }

				// Kodi version
				if      (button == 'left'     && action == 'depress')      { omnibus.kodi.command('previous'); }
				else if (button == 'right'    && action == 'depress')      { omnibus.kodi.command('next');     }
				else if (button == 'send/end' && action == 'depress')      { omnibus.kodi.command('pause');    }
				//else if (button == 'send/end' && action == 'long depress') { omnibus.kodi.command('play');     }
				break;

			case 0x5d:
				command = 'request';
				button  = 'light dimmer';
				action  = '';
				break;

			default:
				command = 'unknown';
				button  = 'unknown';
				action  = Buffer.from(message);
				break;
		}

		value = button+' '+action;

		console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
	}
}

module.exports = MFL;
