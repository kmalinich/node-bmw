#!/usr/bin/env node

// npm libraries
var clc  = require('cli-color');
var wait = require('wait.for');

// Bitmasks in hex
var bit_0 = 0x01;
var bit_1 = 0x02;
var bit_2 = 0x04;
var bit_3 = 0x08;
var bit_4 = 0x10;
var bit_5 = 0x20;
var bit_6 = 0x40;
var bit_7 = 0x80;


var GM = function(omnibus) {
	// self reference
	var _self = this;

	// exposed data
	this.gm_send           = gm_send;
	this.gm_data           = gm_data;
	this.gm_central_unlock = gm_central_unlock;
	this.gm_central_lock   = gm_central_lock;

	// Handle incoming commands
	function gm_data(data) {
		console.log('[GM] gm_data()');

		if (typeof data['gm-interior-light'] !== 'undefined') {
			console.log('[GM] Interior light: \'%s\'', data['gm-interior-light']);
			gm_interior_light(data['gm-interior-light']);
		}

		else if (typeof data['gm-command'] !== 'undefined') {
			console.log('[GM] command: \'%s\'', data['gm-command']);
			if (data['gm-command'] == 'gm_central_unlock') {
				gm_central_unlock();
			}

			else if (data['gm-command'] == 'gm_central_lock') {
				gm_central_lock();
			}

			else if (data['gm-command'] == 'gm_central_toggle') {
				gm_central_toggle();
			}
		}
		else if (typeof data['gm-window'] !== 'undefined') {
			console.log('gm_windows(\'%s\', \'%s\');', data['gm-window'], data['gm-window-action']);
			gm_windows(data['gm-window'], data['gm-window-action']);
		}

		else {
			console.log('[GM] Unknown command');
		}
	}

	// GM window control
	function gm_windows(window, action) {
		console.log('[GM] Window control: \'%s\', \'%s\'', window, action);
		if (window == 'roof') {
			if (action == 'up') {
				var msg = [0x7F, 0x01];
			}
			else if (action == 'down') {
				var msg = [0x7E, 0x01];
			}
		}

		else if (window == 'lf') {
			if (action == 'up') {
				var msg = [0x53, 0x01];
			}
			else if (action == 'down') {
				var msg = [0x52, 0x01];
			}
		}

		else if (window == 'rf') {
			if (action == 'up') {
				var msg = [0x02, 0x22, 0x01];
			}
			else if (action == 'down') {
				var msg = [0x02, 0x36, 0x01];
			}
		}

		else if (window == 'lr') {
			if (action == 'up') {
				var msg = [0x42, 0x01];
			}
			else if (action == 'down') {
				var msg = [0x00, 0x00, 0x01];
			}
		}

		else if (window == 'rr') {
			if (action == 'up') {
				var msg = [0x43, 0x01];
			}
			else if (action == 'down') {
				var msg = [0x00, 0x03, 0x01];
			}
		}

		var msg = [0x03, 0x01];
		omnibus.GM.gm_send(msg);
	}

	// Cluster/interior backlight 
	function gm_interior_light(value) {
		console.log('[GM] Setting interior light to %s', value);

		// Convert the value to hex
		value = value.toString(16);

		// Will need to concat and push array for value
		var msg = [0x10, 0x05, value];
		omnibus.GM.gm_send(msg);
	}	

	// Central locking - unlock
	function gm_central_unlock() {
		console.log('[GM] Central locking: unlock');
		var msg = [0x03, 0x01];
		omnibus.GM.gm_send(msg);
	}

	// Central toggleing - toggle
	function gm_central_toggle() {
		console.log('[GM] Central locking: toggle');
		var msg = [0x97, 0x01];
		omnibus.GM.gm_send(msg);
	}

	// Central locking - lock
	function gm_central_lock() {
		console.log('[GM] Central locking: lock');
		var msg = [0x00, 0x0B];
		omnibus.GM.gm_send(msg);
	}

	// Send message to GM
	function gm_send(packet) {
		var src = 0x3F; // DIA
		var dst = 0x00; // GM
		var cmd = 0x0C; // Set IO status 

		// Add the command code (cmd) to the beginning of the message hex array
		packet.unshift(cmd);

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(packet),
		}

		// Send the message
		console.log('Sending GM packet');
		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// Test if a bit in a bitmask is set
	function bit_test(num, bit) {
		if ((num & bit) != 0) {
			return true;
		}
		else {
			return false;
		}
	}

	// Set a bit in a bitmask
	function bit_set(num, bit) {
		num |= bit;
		return num;
	}

	// Encode the GM bitmask string from an input of true/false values
	function gm_bitmask_encode(array) {
		// Initialize bitmask variables
		var bitmask_0  = 0x00;
		var bitmask_1  = 0x00;
		var bitmask_2  = 0x00;
		var bitmask_3  = 0x00;

		// Set the various bitmask values according to the input array
		if(array.clamp_30a                       ) { bitmask_0 = bit_set(bitmask_0, bit_0) ; }

		// Assemble the output array
		var output = [
			bitmask_0,
			bitmask_1,
			bitmask_2,
			bitmask_3,
		];

		console.log('gm_bitmask_encode() output: %s', output);
		gm_send(output);

		//return output;
	}

	// Decode the GM bitmask string and output an array of true/false values
	function gm_bitmask_decode(array) {
		var bitmask_0 = array[0];
		var bitmask_1 = array[1];
		var bitmask_2 = array[2];
		var bitmask_3 = array[3];

		var light_alarm                   = bit_test(bitmask_0, bit_0);
		var light_interior                = bit_test(bitmask_0, bit_0);
		var locks_lock                    = bit_test(bitmask_0, bit_0);
		var locks_toggle                  = bit_test(bitmask_0, bit_0);
		var locks_trunk                   = bit_test(bitmask_0, bit_0);
		var locks_unlock                  = bit_test(bitmask_0, bit_0);
		var seat_driver_backrest_backward = bit_test(bitmask_0, bit_0);
		var seat_driver_backrest_forward  = bit_test(bitmask_0, bit_0);
		var seat_driver_backward          = bit_test(bitmask_0, bit_0);
		var seat_driver_down              = bit_test(bitmask_0, bit_0);
		var seat_driver_forward           = bit_test(bitmask_0, bit_0);
		var seat_driver_headrest_down     = bit_test(bitmask_0, bit_0);
		var seat_driver_headrest_up       = bit_test(bitmask_0, bit_0);
		var seat_driver_tilt_backward     = bit_test(bitmask_0, bit_0);
		var seat_driver_tilt_forward      = bit_test(bitmask_0, bit_0);
		var seat_driver_up                = bit_test(bitmask_0, bit_0);
		var seat_driver_upper_backwards   = bit_test(bitmask_0, bit_0);
		var seat_driver_upper_forwards    = bit_test(bitmask_0, bit_0);
		var wheel_backward                = bit_test(bitmask_0, bit_0);
		var wheel_down                    = bit_test(bitmask_0, bit_0);
		var wheel_forward                 = bit_test(bitmask_0, bit_0);
		var wheel_up                      = bit_test(bitmask_0, bit_0);
		var window_front_left_down        = bit_test(bitmask_0, bit_0);
		var window_front_left_up          = bit_test(bitmask_0, bit_0);
		var window_front_right_down       = bit_test(bitmask_0, bit_0);
		var window_front_right_up         = bit_test(bitmask_0, bit_0);
		var window_rear_left_down         = bit_test(bitmask_0, bit_0);
		var window_rear_left_up           = bit_test(bitmask_0, bit_0);
		var window_rear_right_down        = bit_test(bitmask_0, bit_0);
		var window_rear_right_up          = bit_test(bitmask_0, bit_0);
		var window_sunroof_down           = bit_test(bitmask_0, bit_0);
		var window_sunroof_up             = bit_test(bitmask_0, bit_0);
		var wipers_auto                   = bit_test(bitmask_0, bit_0);
		var wipers_maintenance            = bit_test(bitmask_0, bit_0);
		var wipers_once                   = bit_test(bitmask_0, bit_0);
		var wipers_spray                  = bit_test(bitmask_0, bit_0);

		var output = {
			light_alarm                   : light_alarm,
			light_interior                : light_interior,
			locks_lock                    : locks_lock,
			locks_toggle                  : locks_toggle,
			locks_trunk                   : locks_trunk,
			locks_unlock                  : locks_unlock,
			seat_driver_backrest_backward : seat_driver_backrest_backward,
			seat_driver_backrest_forward  : seat_driver_backrest_forward,
			seat_driver_backward          : seat_driver_backward,
			seat_driver_down              : seat_driver_down,
			seat_driver_forward           : seat_driver_forward,
			seat_driver_headrest_down     : seat_driver_headrest_down,
			seat_driver_headrest_up       : seat_driver_headrest_up,
			seat_driver_tilt_backward     : seat_driver_tilt_backward,
			seat_driver_tilt_forward      : seat_driver_tilt_forward,
			seat_driver_up                : seat_driver_up,
			seat_driver_upper_backwards   : seat_driver_upper_backwards,
			seat_driver_upper_forwards    : seat_driver_upper_forwards,
			wheel_backward                : wheel_backward,
			wheel_down                    : wheel_down,
			wheel_forward                 : wheel_forward,
			wheel_up                      : wheel_up,
			window_front_left_down        : window_front_left_down,
			window_front_left_up          : window_front_left_up,
			window_front_right_down       : window_front_right_down,
			window_front_right_up         : window_front_right_up,
			window_rear_left_down         : window_rear_left_down,
			window_rear_left_up           : window_rear_left_up,
			window_rear_right_down        : window_rear_right_down,
			window_rear_right_up          : window_rear_right_up,
			window_sunroof_down           : window_sunroof_down,
			window_sunroof_up             : window_sunroof_up,
			wipers_auto                   : wipers_auto,
			wipers_maintenance            : wipers_maintenance,
			wipers_once                   : wipers_once,
			wipers_spray                  : wipers_spray,
		}

		return output;
	}

	// All the possible values to send to the GM
	var array_of_possible_values = {
		light_alarm                   : true,
		light_interior                : true,
		locks_lock                    : true,
		locks_toggle                  : true,
		locks_trunk                   : true,
		locks_unlock                  : true,
		seat_driver_backrest_backward : true,
		seat_driver_backrest_forward  : true,
		seat_driver_backward          : true,
		seat_driver_down              : true,
		seat_driver_forward           : true,
		seat_driver_headrest_down     : true,
		seat_driver_headrest_up       : true,
		seat_driver_tilt_backward     : true,
		seat_driver_tilt_forward      : true,
		seat_driver_up                : true,
		seat_driver_upper_backwards   : true,
		seat_driver_upper_forwards    : true,
		wheel_backward                : true,
		wheel_down                    : true,
		wheel_forward                 : true,
		wheel_up                      : true,
		window_front_left_down        : true,
		window_front_left_up          : true,
		window_front_right_down       : true,
		window_front_right_up         : true,
		window_rear_left_down         : true,
		window_rear_left_up           : true,
		window_rear_right_down        : true,
		window_rear_right_up          : true,
		window_sunroof_down           : true,
		window_sunroof_up             : true,
		wipers_auto                   : true,
		wipers_maintenance            : true,
		wipers_once                   : true,
		wipers_spray                  : true,
	}
}

module.exports = GM;
