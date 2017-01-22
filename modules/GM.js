#!/usr/bin/env node

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
};

// [0x72] Decode a key fob message from the GM and act upon the results
function decode_status_keyfob(message) {
	// Init variables
	var button;

	if (message[1] == 0x10) {
		button = 'lock button depressed';
		omnibus.LCM.welcome_lights('on');
	}

	else if (bitmask.bit_test(message[1], 0x20)) {
		button = 'unlock button depressed';
		omnibus.LCM.welcome_lights('on');
	}

	else if (bitmask.bit_test(message[1], 0x40)) {
		button = 'trunk button depressed';
		omnibus.LCM.welcome_lights('on');
	}

	else if (message[1] == 0x00) {
		button = 'no button pressed';
	}

	console.log('[node:::GM] key fob status: %s', button);
}

// [0x7A] Decode a door/flap status message from the GM and act upon the results
function decode_status_open(message) {
	// Set status from message by decrypting bitmask
	if (bitmask.bit_test(message[1], 0x01)) { status.flaps.front_left    = true; } else { status.flaps.front_left    = false; }
	if (bitmask.bit_test(message[1], 0x02)) { status.flaps.front_right   = true; } else { status.flaps.front_right   = false; }
	if (bitmask.bit_test(message[1], 0x04)) { status.flaps.rear_left     = true; } else { status.flaps.rear_left     = false; }
	if (bitmask.bit_test(message[1], 0x08)) { status.flaps.rear_right    = true; } else { status.flaps.rear_right    = false; }
	if (bitmask.bit_test(message[1], 0x40)) { status.lights.interior     = true; } else { status.lights.interior     = false; }

	// This is correct, in a sense... Not a good sense, but in a sense.
	if (bitmask.bit_test(message[1], 0x20)) { status.vehicle.locked      = true; } else { status.vehicle.locked      = false; }

	if (bitmask.bit_test(message[2], 0x01)) { status.windows.front_left  = true; } else { status.windows.front_left  = false; }
	if (bitmask.bit_test(message[2], 0x02)) { status.windows.front_right = true; } else { status.windows.front_right = false; }
	if (bitmask.bit_test(message[2], 0x04)) { status.windows.rear_left   = true; } else { status.windows.rear_left   = false; }
	if (bitmask.bit_test(message[2], 0x08)) { status.windows.rear_right  = true; } else { status.windows.rear_right  = false; }
	if (bitmask.bit_test(message[2], 0x10)) { status.windows.roof        = true; } else { status.windows.roof        = false; }
	if (bitmask.bit_test(message[2], 0x20)) { status.flaps.trunk         = true; } else { status.flaps.trunk         = false; }
	if (bitmask.bit_test(message[2], 0x40)) { status.flaps.hood          = true; } else { status.flaps.hood          = false; }

	console.log('[node:::GM] decoded door/flap status message');
}

// Send message to GM
function gm_send(packet) {
	// console.log('[node:::GM] Sending \'Set IO status\' packet');
	packet.unshift(0x0C);
	omnibus.ibus.send({
		src: 'DIA',
		dst: 'GM',
		msg: packet, // Set IO status
	});
}

module.exports = {
	// Parse data sent from GM module
	parse_out : (data) => {
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x02: // device status
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

			case 0x10: // Ignition status
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x12: // IKE sensor status
				command = 'request';
				value   = 'IKE sensor status';
				break;

			case 0x14: // Coding
				command = 'request';
				value   = 'country coding data';
				break;

			case 0x16: // Odometer
				command = 'request';
				value   = 'odometer';
				break;

			case 0x1D: // Temperature status
				command = 'request';
				value   = 'current temperature';
				break;

			case 0x72: // Key fob status
				command = 'broadcast';
				value   = 'key fob status';
				decode_status_keyfob(data.msg);
				break;

			case 0x76: // 'Crash alarm' ..
				command = 'crash alarm';
				switch (data.msg[1]) {
					case 0x00:
						value = 'no crash';
						break;
					case 0x02: // A guess
						value = 'armed';
						break;
					default:
						value = Buffer.from(data.msg[1]);
						break;
				}
				break;

			case 0x77: // Wiper status
				command = 'wiper status';
				switch (data.msg[1]) {
					case 0x0C:
						value = 'off';
						break;
					case 0x0D:
						value = 'low/auto';
						break;
					case 0x0E:
						value = 'medium';
						break;
					case 0x0F:
						value = 'high';
						break;
				}

				status.gm.wiper_status = value;
				break;

			case 0x78: // seat memory data
				command = 'broadcast';
				value   = 'seat memory data';
				break;

			case 0x7A: // door/flap status
				command = 'broadcast';
				value   = 'door/flap status';
				decode_status_open(data.msg);
				break;

			case 0xA0: // diagnostic command acknowledged
				command = 'diagnostic command';
				value   = Buffer.from(data.msg);
				break;

			case 0xA2: // diagnostic command rejected
				command = 'diagnostic command';
				value   = 'rejected';
				break;

			case 0xFF: // diagnostic command not acknowledged
				command = 'diagnostic command';
				value   = 'not acknowledged';
				break;

			default:
				command = 'unknown';
				value   = Buffer.from(data.msg);
				break;
		}

		console.log('[%s::%s] %s:', data.src.name, data.dst.name, command, value);
	},

	// Handle incoming commands from API
	gm_data : (data) => {
		if (typeof data['gm-interior-light'] !== 'undefined') {
			gm_interior_light(data['gm-interior-light']);
		}

		// Sort-of.. future-mode.. JSON command.. object? maybe..
		else if (typeof data['gm-command'] !== 'undefined') {
			switch (data['gm-command']) {
				case 'gm-get' : request('io-status');                      break; // Get IO status
				case 'gm-cl'  : gm_cl(data['gm-command-action']);          break; // Central locking
				default       : console.log('[node:::GM] Unknown command'); break; // Dunno what I sent
			}
		}

		// Window control
		else if (typeof data['gm-window'] !== 'undefined') {
			gm_windows(data['gm-window'], data['gm-window-action']);
		}

		else {
			console.log('[node:::GM] Unknown data: \'%s\'', data);
		}
	},

	// GM window control
	gm_windows : (window, action) => {
		console.log('[node:::GM] Window control: \'%s\', \'%s\'', window, action);

		// Init message variable
		var msg;

		// Switch for window and action
		// Moonroof
		// Left front
		// Right front
		// Left rear
		// Right rear
		switch (window) {
			case 'roof':
				switch (action) {
					case 'dn' : msg = [0x03, 0x01, 0x01]; break;
					case 'up' : msg = [0x03, 0x02, 0x01]; break;
					case 'tt' : msg = [0x03, 0x00, 0x01]; break;
				}
				break;

			case 'lf' :
				switch (action) {
					case 'dn' : msg = [0x01, 0x36, 0x01]; break;
					case 'up' : msg = [0x01, 0x1A, 0x01]; break;
				}
				break;

			case 'rf' :
				switch (action) {
					case 'dn' : msg = [0x02, 0x20, 0x01]; break;
					case 'up' : msg = [0x02, 0x22, 0x01]; break;
				}
				break;

			case 'lr' :
				switch (action) {
					case 'dn' : msg = [0x00, 0x00, 0x01]; break;
					case 'up' : msg = [0x42, 0x01];       break;
				}
				break;

			case 'rr' :
				switch (action) {
					case 'dn' : msg = [0x00, 0x03, 0x01]; break;
					case 'up' : msg = [0x43, 0x01];       break;
				}
				break;
		}

		gm_send(msg);
	},

	// Cluster/interior backlight
	gm_interior_light : (value) => {
		console.log('[node:::GM] Set interior light to %s', value);

		// Convert the value to hex
		value = value.toString(16);

		// Will need to concat and push array for value
		var msg = [0x10, 0x05, value];
		gm_send(msg);
	},

	// Central locking
	gm_cl : () => {
		var action = 'toggle';
		console.log('[node:::GM] Central locking: \'%s\'', action);
		// Hex:
		// 01 3A 01 : LF unlock (CL)
		// 01 39 01 : LF lock (CL)
		// 02 3A 01 : RF unlock (CL)
		// 02 39 01 : RF lock (CL)
		//
		// 01 41 01 : Rear lock
		// 01 42 02 : Rear unlock

		// Init message variable
		var msg = [0x00, 0x0B];

		gm_send(msg);

		// Send the cluster and Kodi a notification
		var notify_message = 'Toggling door locks';
		omnibus.kodi.notify('GM', notify_message);
		omnibus.IKE.text_urgent(notify_message)
	},

	// Request various things from GM
	request : (value) => {
		console.log('[node:::GM] Requesting \'%s\'', value);

		// Init variables
		var src;
		var cmd;

		switch (value) {
			case 'io-status':
				src = 'DIA';
				cmd = [0x08, 0x00]; // Get IO status
				break;
			case 'door-flap-status':
				src = 'BMBT';
				cmd = [0x79];
				break;
		}

		omnibus.ibus.send({
			src : src,
			dst : 'GM',
			msg : cmd,
		});
	},

	// Encode the GM bitmask string from an input of true/false values
	gm_bitmask_encode : (array) => {
		// Initialize bitmask variables
		var bitmask_0  = 0x00;
		var bitmask_1  = 0x00;
		var bitmask_2  = 0x00;
		var bitmask_3  = 0x00;

		// Set the various bitmask values according to the input array
		if(array.clamp_30a) { bitmask_0 = bitmask.bit_set(bitmask_0, bitmask.bit[0]) ; }

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
	},

	// Decode the GM bitmask string and output an array of true/false values
	gm_bitmask_decode : (array) => {
		var bitmask_0 = array[0];
		var bitmask_1 = array[1];
		var bitmask_2 = array[2];
		var bitmask_3 = array[3];

		var light_alarm                   = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var light_interior                = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var locks_lock                    = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var locks_toggle                  = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var locks_trunk                   = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var locks_unlock                  = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_backrest_backward = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_backrest_forward  = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_backward          = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_down              = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_forward           = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_headrest_down     = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_headrest_up       = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_tilt_backward     = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_tilt_forward      = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_up                = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_upper_backwards   = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var seat_driver_upper_forwards    = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var wheel_backward                = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var wheel_down                    = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var wheel_forward                 = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var wheel_up                      = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var window_front_left_down        = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var window_front_left_up          = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var window_front_right_down       = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var window_front_right_up         = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var window_rear_left_down         = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var window_rear_left_up           = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var window_rear_right_down        = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var window_rear_right_up          = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var window_sunroof_down           = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var window_sunroof_up             = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var wipers_auto                   = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var wipers_maintenance            = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var wipers_once                   = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
		var wipers_spray                  = bitmask.bit_test(bitmask_0, bitmask.bit[0]);

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
	},
};
