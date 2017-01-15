#!/usr/bin/env node

// npm libraries
var suncalc = require('suncalc');

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

// Convert hex to ascii
function hex2a(hexx) {
	var hex = hexx.toString();
	var str = '';
	for (var i = 0; i < hex.length; i += 2)
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	return str;
}

var LCM = function(omnibus) {
	// Exposed data
	this.auto_lights         = auto_lights;
	this.auto_lights_process = auto_lights_process;
	this.comfort_turn        = comfort_turn;
	this.io_status_decode    = io_status_decode;
	this.io_status_encode    = io_status_encode;
	this.lcm_data            = lcm_data;
	this.lcm_set             = lcm_set;
	this.light_status_decode = light_status_decode;
	this.parse_out           = parse_out;
	this.request             = request;
	this.reset               = reset;
	this.welcome_lights      = welcome_lights;

	// Request various things from LCM
	function request(value) {
		var src;
		var cmd;

		console.log('[node::LCM] Requesting \'%s\'', value);

		switch (value) {
			case 'io-status':
				src = 'DIA';
				cmd = [0x0B, 0x00]; // Get IO status
				break;
			case 'vehicledata':
				src = 'IKE';
				cmd = [0x53];
				break;
			case 'lampstatus':
				src = 'GT';
				cmd = [0x5A];
				break;
			case 'dimmer':
				src = 'BMBT';
				cmd = [0x5D];
				break;
		}

		omnibus.ibus.send({
			src: src,
			dst: 'LCM',
			msg: cmd,
		});
	}

	// Parse data sent from LCM module
	function parse_out(data) {
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x02: // Broadcast: device status
				command = 'device status';

				switch (data.msg[1]) {
					case 0x00:
						value = 'ready';
						break;

					case 0x01:
						value = 'ready after reset';
						break;

					default:
						value = 'unknown';
						break;
				}
				break;

			case 0x10: // Request: ignition status
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x54: // Broadcast: vehicle data
				command = 'broadcast';
				value   = 'vehicle data';
				vehicle_data_decode(data.msg);
				break;

			case 0x5B: // Broadcast: light status
				command = 'broadcast';
				value   = 'light status';
				light_status_decode(data.msg);
				break;

			case 0x5C: // Broadcast: light dimmer status
				command = 'broadcast';
				value   = 'light dimmer status';
				omnibus.status.lights.dimmer_value_3 = data.msg[1];
				break;

			case 0x79: // Request: door/flap status
				command = 'request';
				value   = 'door/flap status';
				break;

			case 0xA0: // Reply to DIA: success
				command = 'diagnostic reply ';
				if (data.msg.length === 33 || data.msg.length === 13) {
					value = 'IO status';
					io_status_decode(data.msg);
				}
				else if (data.msg.length == 1) {
					value = 'ACK';
				}
				else {
					value = Buffer.from(data.msg);
				}
				break;

			case 0xA2: // diagnostic command rejected
				command = 'diagnostic command';
				value   = 'rejected';
				break;

			default:
				command = 'unknown';
				value   = Buffer.from(data.msg);
				break;
		}

		// Dynamic logging output
		var data_dst_name;
		switch (data.dst.name.length) {
			case 1:
				data_dst_name = data.dst.name+'   ';
				break;
			case 2:
				data_dst_name = data.dst.name+'  ';
				break;
			case 3:
				data_dst_name = data.dst.name+' ';
				break;
			default:
				data_dst_name = data.dst.name;
				break;
		}

		var data_src_name;
		switch (data.src.name.length) {
			case 1:
				data_src_name = '   '+data.src.name;
				break;
			case 2:
				data_src_name = '  '+data.src.name;
				break;
			case 3:
				data_src_name = ' '+data.src.name;
				break;
			default:
				data_src_name = data.src.name;
				break;
		}

		console.log('[%s>%s] %s:', data_src_name, data_dst_name, command, value);
	}

	// This message also has days since service and total kms, but, baby steps...
	function vehicle_data_decode(message) {
		var vin_string             = hex2a(message[1].toString(16))+hex2a(message[2].toString(16))+message[3].toString(16)+message[4].toString(16)+message[5].toString(16)[0];
		omnibus.status.vehicle.vin = vin_string;
		console.log('[node::LCM] Decoded VIN string: \'%s\'', vin_string);
	}

	// [0x5B] Decode a light status message from the LCM and act upon the results
	function light_status_decode(message) {
		// Could be done better/cleaner, like setting all values (except turn) to false first.. or something

		// Lights on
		if (message[1] == 0x00)          { omnibus.status.lights.all_off        = true; } else { omnibus.status.lights.all_off        = false; }
		if (bit_test(message[1], bit_0)) { omnibus.status.lights.standing_front = true; } else { omnibus.status.lights.standing_front = false; }
		if (bit_test(message[1], bit_1)) { omnibus.status.lights.lowbeam        = true; } else { omnibus.status.lights.lowbeam        = false; }
		if (bit_test(message[1], bit_2)) { omnibus.status.lights.highbeam       = true; } else { omnibus.status.lights.highbeam       = false; }
		if (bit_test(message[1], bit_3)) { omnibus.status.lights.fog_front      = true; } else { omnibus.status.lights.fog_front      = false; }
		if (bit_test(message[1], bit_4)) { omnibus.status.lights.fog_rear       = true; } else { omnibus.status.lights.fog_rear       = false; }
		if (bit_test(message[1], bit_7)) { omnibus.status.lights.turn_fast      = true; } else { omnibus.status.lights.turn_fast      = false; }

		// Faulty
		if (message[2] == 0x00)          { omnibus.status.lights.faulty.all_ok         = true; } else { omnibus.status.lights.faulty.all_ok         = false; }
		if (bit_test(message[2], bit_0)) { omnibus.status.lights.faulty.standing.front = true; } else { omnibus.status.lights.faulty.standing.front = false; }
		if (bit_test(message[2], bit_1)) { omnibus.status.lights.faulty.lowbeam        = true; } else { omnibus.status.lights.faulty.lowbeam        = false; }
		if (bit_test(message[2], bit_2)) { omnibus.status.lights.faulty.highbeam       = true; } else { omnibus.status.lights.faulty.highbeam       = false; }
		if (bit_test(message[2], bit_3)) { omnibus.status.lights.faulty.fog.front      = true; } else { omnibus.status.lights.faulty.fog.front      = false; }
		if (bit_test(message[2], bit_4)) { omnibus.status.lights.faulty.fog.rear       = true; } else { omnibus.status.lights.faulty.fog.rear       = false; }
		if (bit_test(message[2], bit_5)) { omnibus.status.lights.faulty.turn.left      = true; } else { omnibus.status.lights.faulty.turn.left      = false; }
		if (bit_test(message[2], bit_6)) { omnibus.status.lights.faulty.turn.right     = true; } else { omnibus.status.lights.faulty.turn.right     = false; }
		if (bit_test(message[2], bit_7)) { omnibus.status.lights.faulty.license_plate  = true; } else { omnibus.status.lights.faulty.license_plate  = false; }

		// Lights on
		if (bit_test(message[3], bit_1)) { omnibus.status.lights.brake           = true; } else { omnibus.status.lights.brake           = false; }
		if (bit_test(message[3], bit_2)) { omnibus.status.lights.turn_sync       = true; } else { omnibus.status.lights.turn_sync       = false; }
		if (bit_test(message[3], bit_3)) { omnibus.status.lights.standing_rear   = true; } else { omnibus.status.lights.standing_rear   = false; }
		if (bit_test(message[3], bit_4)) { omnibus.status.lights.trailer         = true; } else { omnibus.status.lights.trailer         = false; }
		if (bit_test(message[3], bit_5)) { omnibus.status.lights.reverse         = true; } else { omnibus.status.lights.reverse         = false; }
		if (bit_test(message[3], bit_6)) { omnibus.status.lights.trailer_reverse = true; } else { omnibus.status.lights.trailer_reverse = false; }
		if (bit_test(message[3], bit_7)) { omnibus.status.lights.hazard          = true; } else { omnibus.status.lights.hazard          = false; }

		// Faulty
		if (bit_test(message[4], bit_0)) { omnibus.status.lights.faulty.brake.right         = true; } else { omnibus.status.lights.faulty.brake.right         = false; }
		if (bit_test(message[4], bit_1)) { omnibus.status.lights.faulty.brake.left          = true; } else { omnibus.status.lights.faulty.brake.left          = false; }
		if (bit_test(message[4], bit_2)) { omnibus.status.lights.faulty.standing.rear_right = true; } else { omnibus.status.lights.faulty.standing.rear_right = false; }
		if (bit_test(message[4], bit_3)) { omnibus.status.lights.faulty.standing.rear_left  = true; } else { omnibus.status.lights.faulty.standing.rear_left  = false; }
		if (bit_test(message[4], bit_4)) { omnibus.status.lights.faulty.lowbeam.right       = true; } else { omnibus.status.lights.faulty.lowbeam.right       = false; }
		if (bit_test(message[4], bit_5)) { omnibus.status.lights.faulty.lowbeam.left        = true; } else { omnibus.status.lights.faulty.lowbeam.left        = false; }

		/*
		 * Comfort turn signal handling
		 */

		// Store status in temporary variables
		var turn_left_on  = bit_test(message[1], bit_5);
		var turn_right_on = bit_test(message[1], bit_6);

		// If comfort turn is not currently engaged
		if (omnibus.status.lights.turn_comfort_left == true || omnibus.status.lights.turn_comfort_right == true) {
			console.log('[node::LCM] Comfort turn signal currently engaged');
		}
		else {
			/*
			 * If:
			 *
			 * left signal is now on, and
			 * right signal is now off, and
			 * left signal was previously off:
			 *
			 * Set turn_left_depress_time timestamp
			 */
			if (turn_left_on && !turn_right_on && omnibus.status.lights.turn_left == false) {
				omnibus.status.lights.turn_left_depress_time = Date.now();
			}

			/*
			 * If
			 *
			 * left signal is now off, and
			 * right signal is now on, and
			 * right signal was previously off:
			 *
			 * Set turn_right_depress_time timestamp
			 */
			if (!turn_left_on && turn_right_on && omnibus.status.lights.turn_right == false) {
				omnibus.status.lights.turn_right_depress_time = Date.now();
			}

			// If left signal is now off and right signal is now off
			if (!turn_left_on && !turn_right_on) {

				// If left signal was previously on
				if (omnibus.status.lights.turn_left == true) {
					// Set turn_left_release_time timestamp
					omnibus.status.lights.turn_left_release_time = Date.now();

					// Calculate time difference between initial on and off
					var turn_left_depress_elapsed = omnibus.status.lights.turn_left_release_time-omnibus.status.lights.turn_left_depress_time;

					// If the time difference is less than 1000ms, fire comfort turn signal
					if (turn_left_depress_elapsed < 1000) {
						console.log('[node::LCM] Left turn signal depress elapsed time: %s ms. Firing left comfort turn signal', turn_left_depress_elapsed);
						comfort_turn('left');
					}
				}

				// If right signal was previously on
				if (omnibus.status.lights.turn_right == true) {
					// Set turn_right_release_time timestamp
					omnibus.status.lights.turn_right_release_time = Date.now();

					// Calculate time difference between initial on and off
					var turn_right_depress_elapsed = omnibus.status.lights.turn_right_release_time-omnibus.status.lights.turn_right_depress_time;

					// If the time difference is less than 1000ms, fire comfort turn signal
					if (turn_right_depress_elapsed < 1000) {
						console.log('[node::LCM] Right turn signal depress elapsed time: %s ms. Firing right comfort turn signal', turn_right_depress_elapsed);
						comfort_turn('right');
					}
				}
			}
		}

		// Afterwards, set the status in omnibus.status.lights as usual
		if (turn_right_on) { omnibus.status.lights.turn_right = true; } else { omnibus.status.lights.turn_right = false; }
		if (turn_left_on)  { omnibus.status.lights.turn_left  = true; } else { omnibus.status.lights.turn_left  = false; }

		// console.log('[node::LCM] Decoded light status');
	}

	// Handle incoming commands
	function lcm_data(data) {
		if (typeof data['lcm-get'] !== 'undefined') {
			request('io-status');
		}
		else {
			// Dirty assumption
			io_status_encode(data);
		}
	}

	// Automatic lights handling
	function auto_lights(light_switch) {
		console.log('[node::LCM] Trying to set auto lights to \'%s\'; current status \'%s\'', light_switch, omnibus.status.lights.auto.active);

		switch (light_switch) {
			case 'off':
				if (omnibus.status.lights.auto.active === true) {
					auto_lights_off();
				}
				break;
			case 'on':
				if (omnibus.status.lights.auto.active === false) {
					// Set status variable
					omnibus.status.lights.auto.active = true;

					// Send one through to prime the pumps
					auto_lights_process();

					// Process/send LCM data on 5 second interval
					// LCM diag command timeout is 15 seconds
					omnibus.LCM.auto_lights_interval = setInterval(() => {
						// Process auto lights
						auto_lights_process();
					}, 5000);
				}
				break;
		}
	}

	// Quick reset auto lights
	function auto_lights_off() {
		clearInterval(omnibus.LCM.auto_lights_interval);

		// Set status variables
		omnibus.status.lights.auto.reason   = null;
		omnibus.status.lights.auto.active   = false;
		omnibus.status.lights.auto.standing = false;
		omnibus.status.lights.auto.lowbeam  = false;
		reset();
	}

	// Logic based on location and time of day, determine if the low beams should be on
	function auto_lights_process() {
		// Init variables
		var current_time = new Date();
		var sun_times    = suncalc.getTimes(current_time, 39.333581, -84.327600);
		var lights_on    = new Date(sun_times.sunsetStart.getTime());
		var lights_off   = new Date(sun_times.sunriseEnd.getTime());
		var handbrake    = omnibus.status.vehicle.handbrake;
		var ignition     = omnibus.status.vehicle.ignition;

		// Debug logging
		// console.log('current_time : %s', current_time);
		// console.log('lights_on    : %s', lights_on);
		// console.log('lights_off   : %s', lights_off);

		// Check ignition
		if (ignition != 'run') {
			console.log('[      LCM] auto_lights_process(): ignition not in run (it\'s in \'%s\'); disabling auto lights', ignition);
			// Not in run: turn off auto lights
			auto_lights('off');
			return;
		}
		else {
			auto_lights('on');
		}

		// Check handbrake
		// if (handbrake === true && ignition == 'run') {
		// 	// Handbrake is set: disable auto lowbeams
		// 	console.log('[node::LCM] Auto lights: Handbrake on');

		// 	omnibus.status.lights.auto.reason   = 'handbrake on';
		// 	omnibus.status.lights.auto.lowbeam  = false;
		// 	omnibus.status.lights.auto.standing = true;
		// 	reset();
		// 	return;
		// }

		// Check time of day
		if (current_time < lights_off) {
			omnibus.status.lights.auto.reason    = 'before lights off';
			omnibus.status.lights.auto.lowbeam   = true;
			omnibus.status.lights.auto.standing  = false;
			omnibus.status.lights.auto.dimmer_value_1 = 0x80;
		}
		else if (current_time > lights_off && current_time < lights_on) {
			omnibus.status.lights.auto.reason    = 'after lights off, before lights on';
			omnibus.status.lights.auto.lowbeam   = false;
			omnibus.status.lights.auto.standing  = true;
			omnibus.status.lights.auto.dimmer_value_1 = 0xFE;
		}
		else if (current_time > lights_on) {
			omnibus.status.lights.auto.reason    = 'after lights on';
			omnibus.status.lights.auto.lowbeam   = true;
			omnibus.status.lights.auto.standing  = false;
			omnibus.status.lights.auto.dimmer_value_1 = 0x80;
		}
		else {
			omnibus.status.lights.auto.reason    = 'unknown time of day, engaging failsafe';
			omnibus.status.lights.auto.lowbeam   = true;
			omnibus.status.lights.auto.standing  = false;
			omnibus.status.lights.auto.dimmer_value_1 = 0xFE;
		}

		console.log('[node::LCM] auto_lights_process(): standing: %s, lowbeam: %s, reason: %s', omnibus.status.lights.auto.standing, omnibus.status.lights.auto.lowbeam, omnibus.status.lights.auto.reason);
		reset();
	}

	// Comfort turn signal handling
	function comfort_turn(action) {
		// Init variable
		var cluster_msg_1;
		var cluster_msg_2 = ' turn ';
		var cluster_msg_3;

		console.log('[node::LCM] comfort turn signal - \'%s\'', action);

		switch (action) {
			case 'left':
				// Set status variables
				omnibus.status.lights.turn_comfort_left  = true;
				omnibus.status.lights.turn_comfort_right = false;
				cluster_msg_1 = '<------';
				cluster_msg_3 = '       ';
				break;
			case 'right':
				// Set status variables
				omnibus.status.lights.turn_comfort_left  = false;
				omnibus.status.lights.turn_comfort_right = true;
				cluster_msg_1 = '       ';
				cluster_msg_3 = '------>';
				break;
		}

		// Concat message string
		cluster_msg = cluster_msg_1+cluster_msg_2+cluster_msg_3;

		reset();
		omnibus.IKE.text(cluster_msg);

		// Turn off comfort turn signal - 1 blink is 500ms, so 5x blink is 2500ms
		setTimeout(() => {
			console.log('[node::LCM] comfort turn signal - off');
			// Set status variables
			omnibus.status.lights.turn_comfort_left  = false;
			omnibus.status.lights.turn_comfort_right = false;
			reset();
			omnibus.IKE.hud_refresh();
		}, 2000);

	}

	// Welcome lights on unlocking/locking
	function welcome_lights(action) {
		var lcm_object;
		console.log('[node::LCM] Welcome lights level \'%s\'', omnibus.status.lights.welcome_lights_level);

		switch (action) {
			case 'on' :
				omnibus.status.lights.welcome_lights = true;

				// This below could be done about 5000x better, but it is late, I'm tired, and I wanted to write working POC code before I hung it up.
				if (omnibus.status.lights.welcome_lights_level == 0) {
					omnibus.status.lights.welcome_lights_level = 1;
					lcm_object = {
						output_license_rear_right        : true,
						output_standing_front_left       : true,
						output_standing_front_right      : true,
						output_standing_inner_rear_left  : true,
						output_standing_inner_rear_right : true,
						output_standing_rear_left        : true,
						output_standing_rear_right       : true,
					};
				}
				else if (omnibus.status.lights.welcome_lights_level == 1) {
					omnibus.status.lights.welcome_lights_level = 2;
					lcm_object = {
						output_license_rear_right        : true,
						output_standing_front_left       : true,
						output_standing_front_right      : true,
						output_standing_inner_rear_left  : true,
						output_standing_inner_rear_right : true,
						output_standing_rear_left        : true,
						output_standing_rear_right       : true,
						output_turn_front_left           : true,
						output_turn_front_right          : true,
					};
				}
				else if (omnibus.status.lights.welcome_lights_level == 2) {
					omnibus.status.lights.welcome_lights_level = 3;
					lcm_object = {
						output_fog_front_left            : true,
						output_fog_front_right           : true,
						output_license_rear_right        : true,
						output_standing_front_left       : true,
						output_standing_front_right      : true,
						output_standing_inner_rear_left  : true,
						output_standing_inner_rear_right : true,
						output_standing_rear_left        : true,
						output_standing_rear_right       : true,
						output_turn_front_left           : true,
						output_turn_front_right          : true,
					};
				}
				else if (omnibus.status.lights.welcome_lights_level == 3) {
					omnibus.status.lights.welcome_lights_level = 4;
					lcm_object = {
						output_fog_front_left            : true,
						output_fog_front_right           : true,
						output_license_rear_right        : true,
						output_lowbeam_front_left        : true,
						output_lowbeam_front_right       : true,
						output_reverse_rear_left         : true,
						output_reverse_rear_right        : true,
						output_standing_front_left       : true,
						output_standing_front_right      : true,
						output_standing_inner_rear_left  : true,
						output_standing_inner_rear_right : true,
						output_standing_rear_left        : true,
						output_standing_rear_right       : true,
						output_turn_front_left           : true,
						output_turn_front_right          : true,
					};
				}
				else if (omnibus.status.lights.welcome_lights_level == 4) {
					omnibus.status.lights.welcome_lights_level = 5;
					lcm_object = {
						output_fog_front_left            : true,
						output_fog_front_right           : true,
						output_highbeam_front_left       : true,
						output_highbeam_front_right      : true,
						output_license_rear_right        : true,
						output_reverse_rear_left         : true,
						output_reverse_rear_right        : true,
						output_standing_front_left       : true,
						output_standing_front_right      : true,
						output_standing_inner_rear_left  : true,
						output_standing_inner_rear_right : true,
						output_standing_rear_left        : true,
						output_standing_rear_right       : true,
						output_turn_front_left           : true,
						output_turn_front_right          : true,
					};
				}
				else if (omnibus.status.lights.welcome_lights_level == 5) {
					omnibus.status.lights.welcome_lights_level = 6;
					lcm_object = {
						output_fog_front_left            : true,
						output_fog_front_right           : true,
						output_highbeam_front_left       : true,
						output_highbeam_front_right      : true,
						output_license_rear_right        : true,
						output_lowbeam_front_left        : true,
						output_lowbeam_front_right       : true,
						output_reverse_rear_left         : true,
						output_reverse_rear_right        : true,
						output_standing_front_left       : true,
						output_standing_front_right      : true,
						output_standing_inner_rear_left  : true,
						output_standing_inner_rear_right : true,
						output_standing_rear_left        : true,
						output_standing_rear_right       : true,
						output_turn_front_left           : true,
						output_turn_front_right          : true,
					};
				}
				else if (omnibus.status.lights.welcome_lights_level == 6) {
					omnibus.status.lights.welcome_lights_level = 0;
					lcm_object = {
						output_brake_rear_left           : true,
						output_brake_rear_middle         : true,
						output_brake_rear_right          : true,
						output_fog_front_left            : true,
						output_fog_front_right           : true,
						output_highbeam_front_left       : true,
						output_highbeam_front_right      : true,
						output_license_rear_right        : true,
						output_lowbeam_front_left        : true,
						output_lowbeam_front_right       : true,
						output_reverse_rear_left         : true,
						output_reverse_rear_right        : true,
						output_standing_front_left       : true,
						output_standing_front_right      : true,
						output_standing_inner_rear_left  : true,
						output_standing_inner_rear_right : true,
						output_standing_rear_left        : true,
						output_standing_rear_right       : true,
						output_turn_front_left           : true,
						output_turn_front_right          : true,
						output_turn_rear_left            : true,
						output_turn_rear_right           : true,
					};
				}

				io_status_encode(lcm_object);
				break;
			case 'off':
				omnibus.status.lights.welcome_lights       = false;
				omnibus.status.lights.welcome_lights_level = 0;
				reset();
				break;
		}

		// Clear welcome lights variables after 15 seconds
		if (omnibus.status.lights.welcome_lights == true) {
			setTimeout(() => {
				omnibus.status.lights.welcome_lights       = false;
				omnibus.status.lights.welcome_lights_level = 0;
			}, 15000);
		}
	}

	function reset() {
		console.log('[node::LCM] reset()');
		var lcm_object = {
			dimmer_value_1    : omnibus.status.lights.auto.dimmer_value_1,
			// dimmer_value_2    : omnibus.status.lights.dimmer_value_2,
			switch_fog_rear   : true, // To leverage the IKE LED as a status indicator
			switch_lowbeam_1  : omnibus.status.lights.auto.lowbeam,
			switch_standing   : omnibus.status.lights.auto.standing,
			switch_turn_left  : omnibus.status.lights.turn_comfort_left,
			switch_turn_right : omnibus.status.lights.turn_comfort_right,
		};

		io_status_encode(lcm_object);
	}

	// Send message to LCM
	function lcm_set(packet) {
		// console.log('[node::LCM] Sending \'Set IO status\' packet');
		packet.unshift(0x0C);
		omnibus.ibus.send({
			src: 'DIA',
			dst: 'LCM',
			msg: packet, // Set IO status
		});
	}

	// Encode the LCM bitmask string from an input of true/false values
	function io_status_encode(array) {
		// Initialize bitmask variables
		var bitmask_0  = 0x00;
		var bitmask_1  = 0x00;
		var bitmask_2  = 0x00;
		var bitmask_3  = 0x00;
		var bitmask_4  = 0x00;
		var bitmask_5  = 0x00;
		var bitmask_6  = 0x00;
		var bitmask_7  = 0x00;
		var bitmask_8  = 0x00;
		var bitmask_9  = 0x00;
		var bitmask_10 = 0x00;
		var bitmask_11 = 0x00;

		// dimmer_value_2
		var bitmask_15 = 0x00;

		// These we kinda don't fool with, so just populate them from the present values
		var bitmask_12 = 0x00;
		var bitmask_13 = 0x00;
		var bitmask_14 = 0x00;
		var bitmask_16 = 0x00;
		var bitmask_17 = 0x00;
		var bitmask_18 = 0x00;
		var bitmask_19 = 0x00;
		var bitmask_20 = 0x00;
		var bitmask_21 = 0x00;
		var bitmask_22 = 0x00;
		var bitmask_23 = 0x00;
		var bitmask_24 = 0x00;
		var bitmask_25 = 0x00;
		var bitmask_26 = 0x00;
		var bitmask_27 = 0x00;
		var bitmask_28 = 0x00;
		var bitmask_29 = 0x00;
		var bitmask_30 = 0x00;
		var bitmask_31 = 0x00;

		// Set the various bitmask values according to the input array
		if(array.clamp_30a                       ) { bitmask_0 = bit_set(bitmask_0, bit_0); }
		if(array.input_fire_extinguisher         ) { bitmask_0 = bit_set(bitmask_0, bit_1); }
		if(array.input_preheating_fuel_injection ) { bitmask_0 = bit_set(bitmask_0, bit_2); }
		if(array.input_carb                      ) { bitmask_0 = bit_set(bitmask_0, bit_4); }
		if(array.clamp_r                         ) { bitmask_0 = bit_set(bitmask_0, bit_6); }
		if(array.clamp_30b                       ) { bitmask_0 = bit_set(bitmask_0, bit_7); }
		if(array.input_key_in_ignition           ) { bitmask_1 = bit_set(bitmask_1, bit_0); }
		if(array.input_seat_belts_lock           ) { bitmask_1 = bit_set(bitmask_1, bit_1); }
		if(array.switch_highbeam_flash           ) { bitmask_1 = bit_set(bitmask_1, bit_2); }
		if(array.switch_hazard                   ) { bitmask_1 = bit_set(bitmask_1, bit_4); }
		if(array.input_kfn                       ) { bitmask_1 = bit_set(bitmask_1, bit_5); }
		if(array.input_armoured_door             ) { bitmask_1 = bit_set(bitmask_1, bit_6); }
		if(array.input_brake_fluid_level         ) { bitmask_1 = bit_set(bitmask_1, bit_7); }

		if(array.switch_brake                    ) { bitmask_2 = bit_set(bitmask_2, bit_0); }
		if(array.switch_highbeam                 ) { bitmask_2 = bit_set(bitmask_2, bit_1); }
		if(array.switch_fog_front                ) { bitmask_2 = bit_set(bitmask_2, bit_2); }
		if(array.switch_fog_rear                 ) { bitmask_2 = bit_set(bitmask_2, bit_4); }
		if(array.switch_standing                 ) { bitmask_2 = bit_set(bitmask_2, bit_5); }
		if(array.switch_turn_right               ) { bitmask_2 = bit_set(bitmask_2, bit_6); }
		if(array.switch_turn_left                ) { bitmask_2 = bit_set(bitmask_2, bit_7); }

		if(array.input_air_suspension            ) { bitmask_3 = bit_set(bitmask_3, bit_0); }
		if(array.input_hold_up_alarm             ) { bitmask_3 = bit_set(bitmask_3, bit_1); }
		if(array.input_washer_fluid_level        ) { bitmask_3 = bit_set(bitmask_3, bit_2); }
		if(array.switch_lowbeam_2                ) { bitmask_3 = bit_set(bitmask_3, bit_3); }
		if(array.switch_lowbeam_1                ) { bitmask_3 = bit_set(bitmask_3, bit_4); }
		if(array.clamp_15                        ) { bitmask_3 = bit_set(bitmask_3, bit_5); }
		if(array.input_engine_failsafe           ) { bitmask_3 = bit_set(bitmask_3, bit_6); }
		if(array.input_tire_defect               ) { bitmask_3 = bit_set(bitmask_3, bit_7); }

		if(array.output_license_rear_left        ) { bitmask_4 = bit_set(bitmask_4, bit_2); }
		if(array.output_brake_rear_left          ) { bitmask_4 = bit_set(bitmask_4, bit_3); }
		if(array.output_brake_rear_right         ) { bitmask_4 = bit_set(bitmask_4, bit_4); }
		if(array.output_highbeam_front_right     ) { bitmask_4 = bit_set(bitmask_4, bit_5); }
		if(array.output_highbeam_front_left      ) { bitmask_4 = bit_set(bitmask_4, bit_6); }

		if(array.output_standing_front_left      ) { bitmask_5 = bit_set(bitmask_5, bit_0); }
		if(array.output_standing_inner_rear_left ) { bitmask_5 = bit_set(bitmask_5, bit_1); }
		if(array.output_fog_front_left           ) { bitmask_5 = bit_set(bitmask_5, bit_2); }
		if(array.output_reverse_rear_left        ) { bitmask_5 = bit_set(bitmask_5, bit_3); }
		if(array.output_lowbeam_front_left       ) { bitmask_5 = bit_set(bitmask_5, bit_4); }
		if(array.output_lowbeam_front_right      ) { bitmask_5 = bit_set(bitmask_5, bit_5); }
		if(array.output_fog_front_right          ) { bitmask_5 = bit_set(bitmask_5, bit_6); }

		if(array.input_vertical_aim              ) { bitmask_6 = bit_set(bitmask_6, bit_1); }
		if(array.output_license_rear_right       ) { bitmask_6 = bit_set(bitmask_6, bit_2); }
		if(array.output_standing_rear_left       ) { bitmask_6 = bit_set(bitmask_6, bit_3); }
		if(array.output_brake_rear_middle        ) { bitmask_6 = bit_set(bitmask_6, bit_4); }
		if(array.output_standing_front_right     ) { bitmask_6 = bit_set(bitmask_6, bit_5); }
		if(array.output_turn_front_right         ) { bitmask_6 = bit_set(bitmask_6, bit_6); }
		if(array.output_turn_rear_left           ) { bitmask_6 = bit_set(bitmask_6, bit_7); }

		if(array.output_turn_rear_right          ) { bitmask_7 = bit_set(bitmask_7, bit_1); }
		if(array.output_fog_rear_left            ) { bitmask_7 = bit_set(bitmask_7, bit_2); }
		if(array.output_standing_inner_rear_right) { bitmask_7 = bit_set(bitmask_7, bit_3); }
		if(array.output_standing_rear_right      ) { bitmask_7 = bit_set(bitmask_7, bit_4); }
		if(array.output_turn_front_left          ) { bitmask_7 = bit_set(bitmask_7, bit_6); }
		if(array.output_reverse_rear_right       ) { bitmask_7 = bit_set(bitmask_7, bit_7); }

		if(array.mode_failsafe                   ) { bitmask_8 = bit_set(bitmask_8, bit_0); }
		if(array.output_led_switch_hazard        ) { bitmask_8 = bit_set(bitmask_8, bit_2); }
		if(array.output_led_switch_light         ) { bitmask_8 = bit_set(bitmask_8, bit_3); }
		if(array.output_reverse_rear_trailer     ) { bitmask_8 = bit_set(bitmask_8, bit_5); }
		if(array.mode_sleep                      ) { bitmask_8 = bit_set(bitmask_8, bit_6); }

		// LCM dimmer
		if(array.dimmer_value_1) { bitmask_9  = parseInt(array.dimmer_value_1); }
		// if(array.dimmer_value_2) { bitmask_15 = parseInt(array.dimmer_value_2); }

		// Suspect
		// array.clamp_58g
		// array.output_fog_rear_right
		// array.output_fog_rear_trailer

		// ??
		// if(array.) { bitmask_0 = bit_set(bitmask_0, bit_3) ; }
		// if(array.) { bitmask_0 = bit_set(bitmask_0, bit_5) ; }
		// if(array.) { bitmask_1 = bit_set(bitmask_1, bit_3) ; }
		// if(array.) { bitmask_2 = bit_set(bitmask_2, bit_3) ; }
		// if(array.) { bitmask_4 = bit_set(bitmask_4, bit_0) ; }
		// if(array.) { bitmask_4 = bit_set(bitmask_4, bit_1) ; }
		// if(array.) { bitmask_4 = bit_set(bitmask_4, bit_7) ; }
		// if(array.) { bitmask_4 = bit_set(bitmask_5, bit_7) ; }
		// if(array.) { bitmask_6 = bit_set(bitmask_6, bit_0) ; }
		// if(array.) { bitmask_7 = bit_set(bitmask_7, bit_0) ; }
		// if(array.) { bitmask_7 = bit_set(bitmask_7, bit_5) ; }
		// if(array.) { bitmask_8 = bit_set(bitmask_8, bit_1) ; }
		// if(array.) { bitmask_8 = bit_set(bitmask_8, bit_4) ; }
		// if(array.) { bitmask_8 = bit_set(bitmask_8, bit_7) ; }

		// Assemble the output array
		var output = [
			bitmask_0,
			bitmask_1,
			bitmask_2,
			bitmask_3,
			bitmask_4,
			bitmask_5,
			bitmask_6,
			bitmask_7,
			bitmask_8,
			bitmask_9,
			bitmask_10,
			bitmask_11,
			bitmask_12,
			bitmask_13,
			bitmask_14,
			bitmask_15,
			bitmask_16,
			bitmask_17,
			bitmask_18,
			bitmask_19,
			bitmask_20,
			bitmask_21,
			bitmask_22,
			bitmask_23,
			bitmask_24,
			bitmask_25,
			bitmask_26,
			bitmask_27,
			bitmask_28,
			bitmask_29,
			bitmask_30,
			bitmask_31,
		];

		lcm_set(output);
	}

	// Decode the LCM bitmask string and output an array of true/false values
	function io_status_decode(array) {
		var bitmask_0  = array[1];
		var bitmask_1  = array[2];
		var bitmask_2  = array[3];
		var bitmask_3  = array[4];
		var bitmask_4  = array[5];
		var bitmask_5  = array[6];
		var bitmask_6  = array[7];
		var bitmask_7  = array[8];
		var bitmask_8  = array[9];
		var bitmask_9  = array[10]; // dimmer.value_1 0x00-0xFF
		var bitmask_10 = array[11];
		var bitmask_11 = array[12];
		var bitmask_12 = array[13];
		var bitmask_13 = array[14];
		var bitmask_14 = array[15];
		var bitmask_15 = array[16]; // dimmer.value_2 0x00-0xFF
		var bitmask_16 = array[17];
		var bitmask_17 = array[18];
		var bitmask_18 = array[19]; // Something
		var bitmask_19 = array[20];
		var bitmask_20 = array[21];
		var bitmask_21 = array[22];
		var bitmask_22 = array[23];
		var bitmask_23 = array[24];
		var bitmask_24 = array[25];
		var bitmask_25 = array[26];
		var bitmask_26 = array[27];
		var bitmask_27 = array[28];
		var bitmask_28 = array[29];
		var bitmask_29 = array[30]; // Something autolevel related
		var bitmask_30 = array[31]; // Something autolevel related
		var bitmask_31 = array[32];

		// Raw IO status bitmasks
		omnibus.status.lcm.io.bitmask_0  = bitmask_0;
		omnibus.status.lcm.io.bitmask_1  = bitmask_1;
		omnibus.status.lcm.io.bitmask_2  = bitmask_2;
		omnibus.status.lcm.io.bitmask_2  = bitmask_2;
		omnibus.status.lcm.io.bitmask_3  = bitmask_3;
		omnibus.status.lcm.io.bitmask_4  = bitmask_4;
		omnibus.status.lcm.io.bitmask_5  = bitmask_5;
		omnibus.status.lcm.io.bitmask_6  = bitmask_6;
		omnibus.status.lcm.io.bitmask_7  = bitmask_7;
		omnibus.status.lcm.io.bitmask_8  = bitmask_8;
		omnibus.status.lcm.io.bitmask_9  = bitmask_9;
		omnibus.status.lcm.io.bitmask_10 = bitmask_10;
		omnibus.status.lcm.io.bitmask_11 = bitmask_11;
		omnibus.status.lcm.io.bitmask_12 = bitmask_12;
		omnibus.status.lcm.io.bitmask_13 = bitmask_13;
		omnibus.status.lcm.io.bitmask_14 = bitmask_14;
		omnibus.status.lcm.io.bitmask_15 = bitmask_15;
		omnibus.status.lcm.io.bitmask_16 = bitmask_16;
		omnibus.status.lcm.io.bitmask_17 = bitmask_17;
		omnibus.status.lcm.io.bitmask_18 = bitmask_18;
		omnibus.status.lcm.io.bitmask_19 = bitmask_19;
		omnibus.status.lcm.io.bitmask_20 = bitmask_20;
		omnibus.status.lcm.io.bitmask_21 = bitmask_21;
		omnibus.status.lcm.io.bitmask_22 = bitmask_22;
		omnibus.status.lcm.io.bitmask_23 = bitmask_23;
		omnibus.status.lcm.io.bitmask_24 = bitmask_24;
		omnibus.status.lcm.io.bitmask_25 = bitmask_25;
		omnibus.status.lcm.io.bitmask_26 = bitmask_26;
		omnibus.status.lcm.io.bitmask_27 = bitmask_27;
		omnibus.status.lcm.io.bitmask_28 = bitmask_28;
		omnibus.status.lcm.io.bitmask_29 = bitmask_29;
		omnibus.status.lcm.io.bitmask_30 = bitmask_30;
		omnibus.status.lcm.io.bitmask_31 = bitmask_31;

		omnibus.status.lcm.clamp.c_15                       = bit_test(bitmask_3, bit_5);
		omnibus.status.lcm.clamp.c_30a                      = bit_test(bitmask_0, bit_0);
		omnibus.status.lcm.clamp.c_30b                      = bit_test(bitmask_0, bit_7);
		omnibus.status.lcm.clamp.c_r                        = bit_test(bitmask_0, bit_6);
		omnibus.status.lcm.dimmer.value_1                   = bitmask_9;
		omnibus.status.lcm.dimmer.value_2                   = bitmask_15;
		omnibus.status.lcm.input.air_suspension             = bit_test(bitmask_3, bit_0);
		omnibus.status.lcm.input.armoured_door              = bit_test(bitmask_1, bit_6);
		omnibus.status.lcm.input.brake_fluid_level          = bit_test(bitmask_1, bit_7);
		omnibus.status.lcm.input.carb                       = bit_test(bitmask_0, bit_4);
		omnibus.status.lcm.input.engine_failsafe            = bit_test(bitmask_3, bit_6);
		omnibus.status.lcm.input.fire_extinguisher          = bit_test(bitmask_0, bit_1);
		omnibus.status.lcm.input.hold_up_alarm              = bit_test(bitmask_3, bit_1);
		omnibus.status.lcm.input.key_in_ignition            = bit_test(bitmask_1, bit_0);
		omnibus.status.lcm.input.kfn                        = bit_test(bitmask_1, bit_5);
		omnibus.status.lcm.input.preheating_fuel_injection  = bit_test(bitmask_0, bit_2);
		omnibus.status.lcm.input.seat_belts_lock            = bit_test(bitmask_1, bit_1);
		omnibus.status.lcm.input.tire_defect                = bit_test(bitmask_3, bit_7);
		omnibus.status.lcm.input.vertical_aim               = bit_test(bitmask_6, bit_1);
		omnibus.status.lcm.input.washer_fluid_level         = bit_test(bitmask_3, bit_2);
		omnibus.status.lcm.mode.failsafe                    = bit_test(bitmask_8, bit_0);
		omnibus.status.lcm.mode.sleep                       = bit_test(bitmask_8, bit_6);
		omnibus.status.lcm.output.brake.rear_left           = bit_test(bitmask_4, bit_3);
		omnibus.status.lcm.output.brake.rear_middle         = bit_test(bitmask_6, bit_4);
		omnibus.status.lcm.output.brake.rear_right          = bit_test(bitmask_4, bit_4);
		omnibus.status.lcm.output.fog.front_left            = bit_test(bitmask_5, bit_2);
		omnibus.status.lcm.output.fog.front_right           = bit_test(bitmask_5, bit_6);
		omnibus.status.lcm.output.fog.rear_left             = bit_test(bitmask_7, bit_2);
		omnibus.status.lcm.output.highbeam.front_left       = bit_test(bitmask_4, bit_6);
		omnibus.status.lcm.output.highbeam.front_right      = bit_test(bitmask_4, bit_5);
		omnibus.status.lcm.output.led.switch_hazard         = bit_test(bitmask_8, bit_2);
		omnibus.status.lcm.output.led.switch_light          = bit_test(bitmask_8, bit_3);
		omnibus.status.lcm.output.license.rear_left         = bit_test(bitmask_4, bit_2);
		omnibus.status.lcm.output.license.rear_right        = bit_test(bitmask_6, bit_2);
		omnibus.status.lcm.output.lowbeam.front_left        = bit_test(bitmask_5, bit_4);
		omnibus.status.lcm.output.lowbeam.front_right       = bit_test(bitmask_5, bit_5);
		omnibus.status.lcm.output.reverse.rear_left         = bit_test(bitmask_5, bit_3);
		omnibus.status.lcm.output.reverse.rear_right        = bit_test(bitmask_7, bit_7);
		omnibus.status.lcm.output.reverse.rear_trailer      = bit_test(bitmask_8, bit_5);
		omnibus.status.lcm.output.standing.front_left       = bit_test(bitmask_5, bit_0);
		omnibus.status.lcm.output.standing.front_right      = bit_test(bitmask_6, bit_5);
		omnibus.status.lcm.output.standing.inner_rear_left  = bit_test(bitmask_5, bit_1);
		omnibus.status.lcm.output.standing.inner_rear_right = bit_test(bitmask_7, bit_3);
		omnibus.status.lcm.output.standing.rear_left        = bit_test(bitmask_6, bit_3);
		omnibus.status.lcm.output.standing.rear_right       = bit_test(bitmask_7, bit_4);
		omnibus.status.lcm.output.turn.front_left           = bit_test(bitmask_7, bit_6);
		omnibus.status.lcm.output.turn.front_right          = bit_test(bitmask_6, bit_6);
		omnibus.status.lcm.output.turn.rear_left            = bit_test(bitmask_6, bit_7);
		omnibus.status.lcm.output.turn.rear_right           = bit_test(bitmask_7, bit_1);
		omnibus.status.lcm.switch.brake                     = bit_test(bitmask_2, bit_0);
		omnibus.status.lcm.switch.fog_front                 = bit_test(bitmask_2, bit_2);
		omnibus.status.lcm.switch.fog_rear                  = bit_test(bitmask_2, bit_4);
		omnibus.status.lcm.switch.hazard                    = bit_test(bitmask_1, bit_4);
		omnibus.status.lcm.switch.highbeam                  = bit_test(bitmask_2, bit_1);
		omnibus.status.lcm.switch.highbeam_flash            = bit_test(bitmask_1, bit_2);
		omnibus.status.lcm.switch.lowbeam_1                 = bit_test(bitmask_3, bit_4);
		omnibus.status.lcm.switch.lowbeam_2                 = bit_test(bitmask_3, bit_3);
		omnibus.status.lcm.switch.standing                  = bit_test(bitmask_2, bit_5);
		omnibus.status.lcm.switch.turn_left                 = bit_test(bitmask_2, bit_7);
		omnibus.status.lcm.switch.turn_right                = bit_test(bitmask_2, bit_6);

		// console.log('[node::LCM] Decoded IO status');
	}
}

module.exports = LCM;
