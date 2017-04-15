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
function decode_status_keyfob(data) {
	data.command = 'bro';
	switch(data.msg[1]) {
		case 0x00:
			data.value = 'none';
			break;

		case 0x10:
			data.value = 'lock';
			omnibus.LCM.welcome_lights(false);
			break;

		case 0x20:
			data.value = 'unlock';
			omnibus.LCM.welcome_lights(true);
			break;

		case 0x40:
			data.value = 'trunk';
			break;

		default:
			data.value = 'unknown: '+data.msg[1];
			break;
	}

	data.value = 'key fob button: '+data.value;
	log.out(data);
}

// [0x7A] Decode a door/flap status message from the GM and act upon the results
function decode_status_open(message) {
	// Set status from message by decrypting bitmask
	status.flaps.front_left    = bitmask.bit_test(message[1], 0x01);
	status.flaps.front_right   = bitmask.bit_test(message[1], 0x02);
	status.flaps.rear_left     = bitmask.bit_test(message[1], 0x04);
	status.flaps.rear_right    = bitmask.bit_test(message[1], 0x08);
	status.lights.interior     = bitmask.bit_test(message[1], 0x40);
	status.windows.front_left  = bitmask.bit_test(message[2], 0x01);
	status.windows.front_right = bitmask.bit_test(message[2], 0x02);
	status.windows.rear_left   = bitmask.bit_test(message[2], 0x04);
	status.windows.rear_right  = bitmask.bit_test(message[2], 0x08);
	status.windows.roof        = bitmask.bit_test(message[2], 0x10);
	status.flaps.trunk         = bitmask.bit_test(message[2], 0x20);
	status.flaps.hood          = bitmask.bit_test(message[2], 0x40);

	// This is correct, in a sense... Not a good sense, but in a sense.
	status.vehicle.locked = bitmask.bit_test(message[1], 0x20);

	console.log('[node:::GM] decoded status');
}

// Send message to GM
function io_set(packet) {
	// console.log('[node:::GM] Sending \'Set IO status\' packet');
	packet.unshift(0x0C);

	// Set IO status
	omnibus.kbus.interface.send({
		src: 'DIA',
		dst: 'GM',
		msg: packet,
	});
}

module.exports = {
	// Parse data sent from GM module
	parse_out : (data) => {
		switch (data.msg[0]) {
			case 0x02: // Broadcast: device status
				data.command     = 'bro';
				status.lcm.ready = true;

				switch (data.msg[1]) {
					case 0x00:
						data.value = 'status: ready';
						break;
					case 0x01:
						status.lcm.reset = false;
						data.value = 'status: ready after reset';
						break;
					default:
						data.value = 'status: unknown';
				}
				break;

			case 0x10: // Ignition status
				data.command = 'req';
				data.value   = 'ignition status';
				break;

			case 0x12: // IKE sensor status
				data.command = 'req';
				data.value   = 'IKE sensor status';
				break;

			case 0x14: // Coding
				data.command = 'req';
				data.value   = 'country coding data';
				break;

			case 0x16: // Odometer
				data.command = 'req';
				data.value   = 'odometer';
				break;

			case 0x1D: // Temperature status
				data.command = 'req';
				data.value   = 'current temperature';
				break;

			case 0x72: // Key fob status
				data.command = 'bro';
				data.value   = 'key fob status';
				decode_status_keyfob(data);
				break;

			case 0x76: // 'Crash alarm' ..
				data.command = 'bro';
				switch (data.msg[1]) {
					case 0x00:
						data.value = 'crash alarm: no crash';
						break;
					case 0x02: // A guess
						data.value = 'crash alarm: armed';
						break;
					default:
						data.value = Buffer.from(data.msg[1]);
						break;
				}
				break;

			case 0x77: // Wiper status
				data.command = 'bro';
				switch (data.msg[1]) {
					case 0x0C:
						data.value = 'off';
						break;
					case 0x0D:
						data.value = 'low/auto';
						break;
					case 0x0E:
						data.value = 'medium';
						break;
					case 0x0F:
						data.value = 'high';
						break;
				}
				data.value = 'wiper status: '+data.value;

				status.gm.wiper_status = data.value;
				break;

			case 0x78: // seat memory data
				data.command = 'bro';
				data.value   = 'seat memory data';
				break;

			case 0x7A: // door/flap status
				data.command = 'bro';
				data.value   = 'door/flap status';
				decode_status_open(data.msg);
				break;

			case 0xA0: // diagnostic command acknowledged
				data.command = 'rep';
				data.value   = Buffer.from(data.msg);
				break;

			case 0xA2: // diagnostic command rejected
				data.command = 'rep';
				data.value   = 'diagnostic command rejected';
				break;

			case 0xFF: // diagnostic command not acknowledged
				data.command = 'rep';
				data.value   = 'diagnostic command not acknowledged';
				break;

			default:
				data.command = 'unk';
				data.value   = Buffer.from(data.msg);
				break;
		}

		log.out(data);
	},

	// Handle incoming commands from API
	api_command : (data) => {
		if (typeof data['gm-interior-light'] !== 'undefined') {
			interior_light(data['gm-interior-light']);
		}

		// Sort-of.. future-mode.. JSON command.. object? maybe..
		else if (typeof data['gm-command'] !== 'undefined') {
			switch (data['gm-command']) {
				case 'gm-get' : request('io-status'); break; // Get IO status
				case 'lock'   : lock();               break; // Central locking
				default       : console.log('[node:::GM] Unknown command'); break; // Dunno what I sent
			}
		}

		// Window control
		else if (typeof data['gm-window'] !== 'undefined') {
			windows(data['gm-window'], data['gm-window-action']);
		}

		else {
			console.log('[node:::GM] Unknown data: \'%s\'', data);
		}
	},

	// GM window control
	windows : (window, action) => {
		console.log('[node:::GM] Window control: \'%s\', \'%s\'', window, action);

		// Init message variable
		var msg;

		// Switch for window and action
		switch (window) {
			case 'roof': // Moonroof
				switch (action) {
					case 'dn' : msg = [0x03, 0x01, 0x01]; break;
					case 'up' : msg = [0x03, 0x02, 0x01]; break;
					case 'tt' : msg = [0x03, 0x00, 0x01]; break;
				}
				break;
			case 'lf' : // Left front
				switch (action) {
					case 'dn' : msg = [0x01, 0x36, 0x01]; break;
					case 'up' : msg = [0x01, 0x1A, 0x01]; break;
				}
				break;
			case 'rf' : // Right front
				switch (action) {
					case 'dn' : msg = [0x02, 0x20, 0x01]; break;
					case 'up' : msg = [0x02, 0x22, 0x01]; break;
				}
				break;
			case 'lr' : // Left rear
				switch (action) {
					case 'dn' : msg = [0x00, 0x00, 0x01]; break;
					case 'up' : msg = [0x42, 0x01];       break;
				}
				break;
			case 'rr' : // Right rear
				switch (action) {
					case 'dn' : msg = [0x00, 0x03, 0x01]; break;
					case 'up' : msg = [0x43, 0x01];       break;
				}
		}
		io_set(msg);
	},

	// Cluster/interior backlight
	interior_light : (value) => {
		console.log('[node:::GM] Set interior light to %s', value);
		io_set([0x10, 0x05, value.toString(16)]);
	},

	// Central locking
	locks : () => {
		var action = 'toggle';
		console.log('[node:::GM] Toggle central locking');
		// Hex:
		// 01 3A 01 : LF unlock (CL)
		// 01 39 01 : LF lock   (CL)
		// 02 3A 01 : RF unlock (CL)
		// 02 39 01 : RF lock   (CL)

		// 01 41 01 : Rear lock
		// 01 42 02 : Rear unlock

		// Init message variable
		io_set([0x00, 0x0B]);

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

		omnibus.kbus.interface.send({
			src : src,
			dst : 'GM',
			msg : cmd,
		});
	},

	// Encode the GM bitmask string from an input of true/false values
	io_encode : (object) => {
		// Initialize bitmask variables
		var bitmask_0  = 0x00;
		var bitmask_1  = 0x00;
		var bitmask_2  = 0x00;
		var bitmask_3  = 0x00;

		// Set the various bitmask values according to the input object
		if(object.clamp_30a) { bitmask_0 = bitmask.bit_set(bitmask_0, bitmask.bit[0]) ; }

		// Assemble the output object
		var output = [
			bitmask_0,
			bitmask_1,
			bitmask_2,
			bitmask_3,
		];

		console.log('[node:::GM] io_encode() output: %s', output);
		io_set(output);
	},

	// Decode the GM bitmask string and output an array of true/false values
	io_decode : (array) => {
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
