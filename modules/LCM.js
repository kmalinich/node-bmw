#!/usr/bin/env node

// npm libraries
var dbus    = require('dbus-native');
var suncalc = require('suncalc');
var wait    = require('wait.for');

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

var LCM = function(omnibus) {
	// Self reference
	var _self = this;

	// Auto lights interval
	var auto_lights_interval;

	// Exposed data
	this.auto_lights         = auto_lights;
	this.comfort_turn        = comfort_turn;
	this.io_status_decode    = io_status_decode;
	this.io_status_encode    = io_status_encode;
	this.lcm_data            = lcm_data;
	this.lcm_get             = lcm_get;
	this.lcm_set             = lcm_set;
	this.light_status_decode = light_status_decode;
	this.parse_out           = parse_out;
	this.reset               = reset;
	this.welcome_lights      = welcome_lights;

	// Parse data sent from LCM module
	function parse_out(data) {
		// Init variables
		var src      = data.src;
		var dst      = data.dst;
		var message  = data.msg;

		var command;
		var value;

		switch (message[0]) {
			case 0x02: // Broadcast: device status
				command = 'device status';

				switch (message[1]) {
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
				// vehicle_data_decode(message);
				break;

			case 0x5B: // Broadcast: light status
				command = 'broadcast';
				value   = 'light status';
				light_status_decode(message);
				break;

			case 0x5C: // Broadcast: light dimmer status
				command = 'broadcast';
				value   = 'light dimmer status';
				omnibus.status.lights.dimmer = message[1];
				break;

			case 0x79: // Request: door/flap status
				command = 'request';
				value   = 'door/flap status';
				break;

			case 0xA0:
				command = 'current IO status';
				value   = 'decoded';
				omnibus.LCM.io_status_decode(message);
				break;

			default:
				command = 'unknown';
				value   = new Buffer(message);
				break;
		}

		console.log('[%s->%s] %s:', data.src_name, data.dst_name, command, value);
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
		if (message[2] == 0x00)          { omnibus.status.lights_faulty.all_ok         = true; } else { omnibus.status.lights_faulty.all_ok         = false; }
		if (bit_test(message[2], bit_0)) { omnibus.status.lights_faulty.standing_front = true; } else { omnibus.status.lights_faulty.standing_front = false; }
		if (bit_test(message[2], bit_1)) { omnibus.status.lights_faulty.lowbeam        = true; } else { omnibus.status.lights_faulty.lowbeam        = false; }
		if (bit_test(message[2], bit_2)) { omnibus.status.lights_faulty.highbeam       = true; } else { omnibus.status.lights_faulty.highbeam       = false; }
		if (bit_test(message[2], bit_3)) { omnibus.status.lights_faulty.fog_front      = true; } else { omnibus.status.lights_faulty.fog_front      = false; }
		if (bit_test(message[2], bit_4)) { omnibus.status.lights_faulty.fog_rear       = true; } else { omnibus.status.lights_faulty.fog_rear       = false; }
		if (bit_test(message[2], bit_5)) { omnibus.status.lights_faulty.turn_left      = true; } else { omnibus.status.lights_faulty.turn_left      = false; }
		if (bit_test(message[2], bit_6)) { omnibus.status.lights_faulty.turn_right     = true; } else { omnibus.status.lights_faulty.turn_right     = false; }
		if (bit_test(message[2], bit_7)) { omnibus.status.lights_faulty.license_plate  = true; } else { omnibus.status.lights_faulty.license_plate  = false; }

		// Lights on
		if (bit_test(message[3], bit_1)) { omnibus.status.lights.brake           = true; } else { omnibus.status.lights.brake           = false; }
		if (bit_test(message[3], bit_2)) { omnibus.status.lights.turn_sync       = true; } else { omnibus.status.lights.turn_sync       = false; }
		if (bit_test(message[3], bit_3)) { omnibus.status.lights.standing_rear   = true; } else { omnibus.status.lights.standing_rear   = false; }
		if (bit_test(message[3], bit_4)) { omnibus.status.lights.trailer         = true; } else { omnibus.status.lights.trailer         = false; }
		if (bit_test(message[3], bit_5)) { omnibus.status.lights.reverse         = true; } else { omnibus.status.lights.reverse         = false; }
		if (bit_test(message[3], bit_6)) { omnibus.status.lights.trailer_reverse = true; } else { omnibus.status.lights.trailer_reverse = false; }
		if (bit_test(message[3], bit_7)) { omnibus.status.lights.hazard          = true; } else { omnibus.status.lights.hazard          = false; }

		// Faulty
		if (bit_test(message[4], bit_0)) { omnibus.status.lights_faulty.brake_right         = true; } else { omnibus.status.lights_faulty.brake_right         = false; }
		if (bit_test(message[4], bit_1)) { omnibus.status.lights_faulty.brake_left          = true; } else { omnibus.status.lights_faulty.brake_left          = false; }
		if (bit_test(message[4], bit_2)) { omnibus.status.lights_faulty.standing_rear_right = true; } else { omnibus.status.lights_faulty.standing_rear_right = false; }
		if (bit_test(message[4], bit_3)) { omnibus.status.lights_faulty.standing_rear_left  = true; } else { omnibus.status.lights_faulty.standing_rear_left  = false; }
		if (bit_test(message[4], bit_4)) { omnibus.status.lights_faulty.lowbeam_right       = true; } else { omnibus.status.lights_faulty.lowbeam_right       = false; }
		if (bit_test(message[4], bit_5)) { omnibus.status.lights_faulty.lowbeam_left        = true; } else { omnibus.status.lights_faulty.lowbeam_left        = false; }

		/*
		 * Comfort turn signal handling
		 */

		// Store status in temporary variables
		var turn_left_on  = bit_test(message[1], bit_5);
		var turn_right_on = bit_test(message[1], bit_6);

		// If comfort turn is not currently engaged
		if (omnibus.status.lights.turn_comfort_left == true || omnibus.status.lights.turn_comfort_right == true) {
			console.log('[LCM]  Comfort turn signal currently engaged');
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
						console.log('[LCM]  Left turn signal depress elapsed time: %s ms. Firing left comfort turn signal', turn_left_depress_elapsed);
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
						console.log('[LCM]  Right turn signal depress elapsed time: %s ms. Firing right comfort turn signal', turn_right_depress_elapsed);
						comfort_turn('right');
					}
				}
			}
		}

		// Afterwards, set the status in omnibus.status.lights as usual
		if (turn_right_on) { omnibus.status.lights.turn_right = true; } else { omnibus.status.lights.turn_right = false; }
		if (turn_left_on)  { omnibus.status.lights.turn_left  = true; } else { omnibus.status.lights.turn_left  = false; }

		console.log('[node-bmw] decoded light status message');
	}

	// Handle incoming commands
	function lcm_data(data) {
		if (typeof data['lcm-get'] !== 'undefined') {
			lcm_get();
		}
		else {
			// Dirty assumption
			io_status_encode(data);
		}
	}

	// Automatic lights handling
	function auto_lights(light_switch) {
		console.log('[node-bmw] Turning %s auto lights; current status \'%s\'', light_switch, omnibus.status.lights.auto_lights);

		switch (light_switch) {
			case 'off':
				clearInterval(auto_lights_interval);

				// Set status variables
				omnibus.status.lights.auto_lights   = false;
				omnibus.status.lights.auto_standing = false;
				omnibus.status.lights.auto_lowbeam  = false;
				reset();

				console.log('[node-bmw] Automatic lights disabled');
				break;
			case 'on':
				if (omnibus.status.lights.auto_lights == false) {
					// Set status variables
					omnibus.status.lights.auto_lights = true;

					// Send one through to prime the pumps
					auto_lights_process();

					// Process/send LCM data on 3 second interval
					// LCM diag command timeout is 15 seconds
					auto_lights_interval = setInterval(function() {
						// Process auto lights
						auto_lights_process();
					}, 3000);


					console.log('[node-bmw] Automatic lights enabled');
				}
				break;
		}
	}

	// Logic based on location and time of day, determine if the low beams should be on
	function auto_lights_process() {
		// Init variables
		var lights_reason;
		var current_time = new Date();
		var sun_times    = suncalc.getTimes(current_time, 39.333581, -84.327600);
		var lights_on    = new Date(sun_times.sunsetStart.getTime());
		var lights_off   = new Date(sun_times.sunriseEnd.getTime());

		console.log('[LCM] auto_lights_process(): auto_lights = \'%s\'', omnibus.status.lights.auto_lights);

		// Debug logging
		// console.log('current_time : %s', current_time);
		// console.log('lights_on    : %s', lights_on);
		// console.log('lights_off   : %s', lights_off);

		if (current_time < lights_off) {
			lights_reason = 'before lights off';
			omnibus.status.lights.auto_lowbeam  = true;
			omnibus.status.lights.auto_standing = false;
		}
		else if (current_time > lights_off && current_time < lights_on) {
			lights_reason = 'after lights off, before lights on';
			omnibus.status.lights.auto_lowbeam  = false;
			omnibus.status.lights.auto_standing = true;
		}
		else if (current_time > lights_on) {
			lights_reason = 'after lights on';
			omnibus.status.lights.auto_lowbeam  = true;
			omnibus.status.lights.auto_standing = false;
		}
		else {
			lights_reason = 'unknown time of day, engaging failsafe';
			omnibus.status.lights.auto_lowbeam  = true;
			omnibus.status.lights.auto_standing = false;
		}

		console.log('[node-bmw] Auto lights: standing: %s, lowbeam: %s, reason: %s', omnibus.status.lights.auto_standing, omnibus.status.lights.auto_lowbeam, lights_reason);
		reset();
	}

	// Comfort turn signal handling
	function comfort_turn(action) {
		console.log('[node-bmw] Comfort turn signal - \'%s\'', action);

		switch (action) {
			case 'left':
				// Set status variables
				omnibus.status.lights.turn_comfort_left  = true;
				omnibus.status.lights.turn_comfort_right = false;
				break;
			case 'right':
				// Set status variables
				omnibus.status.lights.turn_comfort_left  = false;
				omnibus.status.lights.turn_comfort_right = true;
				break;
		}

		reset();

		// Turn off comfort turn signal - 1 blink is 500ms, so 5x blink is 2500ms
		setTimeout(function() {
			// Set status variables
			omnibus.status.lights.turn_comfort_left  = false;
			omnibus.status.lights.turn_comfort_right = false;
			reset();
		}, 2500);
	}

	// Welcome lights on unlocking/locking
	function welcome_lights(action) {
		var lcm_object;
		console.log('[node-bmw] Welcome lights level \'%s\'', omnibus.status.lights.welcome_lights_level);

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
			setTimeout(function() {
				omnibus.status.lights.welcome_lights       = false;
				omnibus.status.lights.welcome_lights_level = 0;
			}, 15000);
		}
	}

	function reset() {
		console.log('[LCM]  Resetting');
		var lcm_object = {
			switch_lowbeam_1  : omnibus.status.lights.auto_lowbeam,
			switch_standing   : omnibus.status.lights.auto_standing,
			switch_turn_left  : omnibus.status.lights.turn_comfort_left,
			switch_turn_right : omnibus.status.lights.turn_comfort_right,
		};

		io_status_encode(lcm_object);
	}

	// Get LCM IO status
	function lcm_get() {
		var src = 0x3F; // DIA
		var dst = 0xD0; // GLO
		var cmd = [0x0B, 0x00, 0x00, 0x00, 0x00]; // Get IO status

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(cmd),
		}

		// Send the message
		console.log('[LCM]  Sending \'Get IO status\' packet');
		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// Send message to LCM
	function lcm_set(packet) {
		var src = 0x3F; // DIA
		var dst = 0xD0; // LCM
		var cmd = 0x0C; // Set IO status

		// Add the command to the beginning of the LCM hex array
		packet.unshift(cmd);

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(packet),
		}

		// Send the message
		console.log('[LCM]  Sending \'Set IO status\' packet');
		omnibus.ibus_connection.send_message(ibus_packet);
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
		var bitmask_9  = 0xFE; // Dimmer from 00-FF
		// 10-11 are .. something, don't know yet.
		var bitmask_10 = 0x00;
		var bitmask_11 = 0x00;

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
		if(array.dimmer_value                    ) { bitmask_9 = parseInt(array.dimmer_value); }

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
		var bitmask_9  = array[10]; // Dimmer from 00-FF
		var bitmask_10 = array[11];
		var bitmask_11 = array[12];
		var bitmask_12 = array[13];
		var bitmask_13 = array[14];
		var bitmask_14 = array[15];
		var bitmask_15 = array[16];
		var bitmask_16 = array[17];
		var bitmask_17 = array[18];
		var bitmask_18 = array[19];
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
		var bitmask_29 = array[30];
		var bitmask_30 = array[31];
		var bitmask_31 = array[32];

		omnibus.status.lcm.bitmask_0                        = bitmask_0;
		omnibus.status.lcm.bitmask_1                        = bitmask_1;
		omnibus.status.lcm.bitmask_2                        = bitmask_2;
		omnibus.status.lcm.bitmask_2                        = bitmask_2;
		omnibus.status.lcm.bitmask_3                        = bitmask_3;
		omnibus.status.lcm.bitmask_4                        = bitmask_4;
		omnibus.status.lcm.bitmask_5                        = bitmask_5;
		omnibus.status.lcm.bitmask_6                        = bitmask_6;
		omnibus.status.lcm.bitmask_7                        = bitmask_7;
		omnibus.status.lcm.bitmask_8                        = bitmask_8;
		omnibus.status.lcm.bitmask_9                        = bitmask_9;
		omnibus.status.lcm.bitmask_10                       = bitmask_10;
		omnibus.status.lcm.bitmask_11                       = bitmask_11;
		omnibus.status.lcm.bitmask_12                       = bitmask_12;
		omnibus.status.lcm.bitmask_13                       = bitmask_13;
		omnibus.status.lcm.bitmask_14                       = bitmask_14;
		omnibus.status.lcm.bitmask_15                       = bitmask_15;
		omnibus.status.lcm.bitmask_16                       = bitmask_16;
		omnibus.status.lcm.bitmask_17                       = bitmask_17;
		omnibus.status.lcm.bitmask_18                       = bitmask_18;
		omnibus.status.lcm.bitmask_19                       = bitmask_19;
		omnibus.status.lcm.bitmask_20                       = bitmask_20;
		omnibus.status.lcm.bitmask_21                       = bitmask_21;
		omnibus.status.lcm.bitmask_22                       = bitmask_22;
		omnibus.status.lcm.bitmask_23                       = bitmask_23;
		omnibus.status.lcm.bitmask_24                       = bitmask_24;
		omnibus.status.lcm.bitmask_25                       = bitmask_25;
		omnibus.status.lcm.bitmask_26                       = bitmask_26;
		omnibus.status.lcm.bitmask_27                       = bitmask_27;
		omnibus.status.lcm.bitmask_28                       = bitmask_28;
		omnibus.status.lcm.bitmask_29                       = bitmask_29;
		omnibus.status.lcm.bitmask_30                       = bitmask_30;
		omnibus.status.lcm.bitmask_31                       = bitmask_31;

		omnibus.status.lcm.clamp_15                         = bit_test(bitmask_3, bit_5);
		omnibus.status.lcm.clamp_30a                        = bit_test(bitmask_0, bit_0);
		omnibus.status.lcm.clamp_30b                        = bit_test(bitmask_0, bit_7);
		omnibus.status.lcm.clamp_r                          = bit_test(bitmask_0, bit_6);
		omnibus.status.lcm.dimmer_value                     = bitmask_9;
		omnibus.status.lcm.input_air_suspension             = bit_test(bitmask_3, bit_0);
		omnibus.status.lcm.input_armoured_door              = bit_test(bitmask_1, bit_6);
		omnibus.status.lcm.input_brake_fluid_level          = bit_test(bitmask_1, bit_7);
		omnibus.status.lcm.input_carb                       = bit_test(bitmask_0, bit_4);
		omnibus.status.lcm.input_engine_failsafe            = bit_test(bitmask_3, bit_6);
		omnibus.status.lcm.input_fire_extinguisher          = bit_test(bitmask_0, bit_1);
		omnibus.status.lcm.input_hold_up_alarm              = bit_test(bitmask_3, bit_1);
		omnibus.status.lcm.input_key_in_ignition            = bit_test(bitmask_1, bit_0);
		omnibus.status.lcm.input_kfn                        = bit_test(bitmask_1, bit_5);
		omnibus.status.lcm.input_preheating_fuel_injection  = bit_test(bitmask_0, bit_2);
		omnibus.status.lcm.input_seat_belts_lock            = bit_test(bitmask_1, bit_1);
		omnibus.status.lcm.input_tire_defect                = bit_test(bitmask_3, bit_7);
		omnibus.status.lcm.input_vertical_aim               = bit_test(bitmask_6, bit_1);
		omnibus.status.lcm.input_washer_fluid_level         = bit_test(bitmask_3, bit_2);
		omnibus.status.lcm.mode_failsafe                    = bit_test(bitmask_8, bit_0);
		omnibus.status.lcm.mode_sleep                       = bit_test(bitmask_8, bit_6);
		omnibus.status.lcm.output_brake_rear_left           = bit_test(bitmask_4, bit_3);
		omnibus.status.lcm.output_brake_rear_middle         = bit_test(bitmask_6, bit_4);
		omnibus.status.lcm.output_brake_rear_right          = bit_test(bitmask_4, bit_4);
		omnibus.status.lcm.output_fog_front_left            = bit_test(bitmask_5, bit_2);
		omnibus.status.lcm.output_fog_front_right           = bit_test(bitmask_5, bit_6);
		omnibus.status.lcm.output_fog_rear_left             = bit_test(bitmask_7, bit_2);
		omnibus.status.lcm.output_highbeam_front_left       = bit_test(bitmask_4, bit_6);
		omnibus.status.lcm.output_highbeam_front_right      = bit_test(bitmask_4, bit_5);
		omnibus.status.lcm.output_led_switch_hazard         = bit_test(bitmask_8, bit_2);
		omnibus.status.lcm.output_led_switch_light          = bit_test(bitmask_8, bit_3);
		omnibus.status.lcm.output_license_rear_left         = bit_test(bitmask_4, bit_2);
		omnibus.status.lcm.output_license_rear_right        = bit_test(bitmask_6, bit_2);
		omnibus.status.lcm.output_lowbeam_front_left        = bit_test(bitmask_5, bit_4);
		omnibus.status.lcm.output_lowbeam_front_right       = bit_test(bitmask_5, bit_5);
		omnibus.status.lcm.output_reverse_rear_left         = bit_test(bitmask_5, bit_3);
		omnibus.status.lcm.output_reverse_rear_right        = bit_test(bitmask_7, bit_7);
		omnibus.status.lcm.output_reverse_rear_trailer      = bit_test(bitmask_8, bit_5);
		omnibus.status.lcm.output_standing_front_left       = bit_test(bitmask_5, bit_0);
		omnibus.status.lcm.output_standing_front_right      = bit_test(bitmask_6, bit_5);
		omnibus.status.lcm.output_standing_inner_rear_left  = bit_test(bitmask_5, bit_1);
		omnibus.status.lcm.output_standing_inner_rear_right = bit_test(bitmask_7, bit_3);
		omnibus.status.lcm.output_standing_rear_left        = bit_test(bitmask_6, bit_3);
		omnibus.status.lcm.output_standing_rear_right       = bit_test(bitmask_7, bit_4);
		omnibus.status.lcm.output_turn_front_left           = bit_test(bitmask_7, bit_6);
		omnibus.status.lcm.output_turn_front_right          = bit_test(bitmask_6, bit_6);
		omnibus.status.lcm.output_turn_rear_left            = bit_test(bitmask_6, bit_7);
		omnibus.status.lcm.output_turn_rear_right           = bit_test(bitmask_7, bit_1);
		omnibus.status.lcm.switch_brake                     = bit_test(bitmask_2, bit_0);
		omnibus.status.lcm.switch_fog_front                 = bit_test(bitmask_2, bit_2);
		omnibus.status.lcm.switch_fog_rear                  = bit_test(bitmask_2, bit_4);
		omnibus.status.lcm.switch_hazard                    = bit_test(bitmask_1, bit_4);
		omnibus.status.lcm.switch_highbeam                  = bit_test(bitmask_2, bit_1);
		omnibus.status.lcm.switch_highbeam_flash            = bit_test(bitmask_1, bit_2);
		omnibus.status.lcm.switch_lowbeam_1                 = bit_test(bitmask_3, bit_4);
		omnibus.status.lcm.switch_lowbeam_2                 = bit_test(bitmask_3, bit_3);
		omnibus.status.lcm.switch_standing                  = bit_test(bitmask_2, bit_5);
		omnibus.status.lcm.switch_turn_left                 = bit_test(bitmask_2, bit_7);
		omnibus.status.lcm.switch_turn_right                = bit_test(bitmask_2, bit_6);

		console.log('[node-bmw] decoded LCM IO status');
	}

	// All the possible values to send to the LCM
	var array_of_possible_values = {
		bitmask_10                       : 0x00,
		bitmask_11                       : 0x00,
		clamp_15                         : false,
		clamp_30a                        : false,
		clamp_30b                        : false,
		clamp_r                          : false,
		dimmer_value                     : 0xFF,
		input_air_suspension             : false,
		input_armoured_door              : false,
		input_brake_fluid_level          : false,
		input_carb                       : false,
		input_engine_failsafe            : false,
		input_fire_extinguisher          : false,
		input_hold_up_alarm              : false,
		input_key_in_ignition            : false,
		input_kfn                        : false,
		input_preheating_fuel_injection  : false,
		input_seat_belts_lock            : false,
		input_tire_defect                : false,
		input_vertical_aim               : false,
		input_washer_fluid_level         : false,
		mode_failsafe                    : false,
		mode_sleep                       : false,
		output_brake_rear_left           : false,
		output_brake_rear_middle         : false,
		output_brake_rear_right          : false,
		output_fog_front_left            : false,
		output_fog_front_right           : false,
		output_fog_rear_left             : false,
		output_highbeam_front_left       : false,
		output_highbeam_front_right      : false,
		output_led_switch_hazard         : false,
		output_led_switch_light          : false,
		output_license_rear_left         : false,
		output_license_rear_right        : false,
		output_lowbeam_front_left        : false,
		output_lowbeam_front_right       : false,
		output_reverse_rear_left         : false,
		output_reverse_rear_right        : false,
		output_reverse_rear_trailer      : false,
		output_standing_front_left       : false,
		output_standing_front_right      : false,
		output_standing_inner_rear_left  : false,
		output_standing_inner_rear_right : false,
		output_standing_rear_left        : false,
		output_standing_rear_right       : false,
		output_turn_front_left           : false,
		output_turn_front_right          : false,
		output_turn_rear_left            : false,
		output_turn_rear_right           : false,
		switch_brake                     : false,
		switch_fog_front                 : false,
		switch_fog_rear                  : false,
		switch_hazard                    : false,
		switch_highbeam                  : false,
		switch_highbeam_flash            : false,
		switch_lowbeam_1                 : false,
		switch_lowbeam_2                 : false,
		switch_standing                  : false,
		switch_turn_left                 : false,
		switch_turn_right                : false,

		// Suspect
		// clamp_58g                        : true,
		// output_fog_rear_right            : true,
		// output_fog_rear_trailer          : true,
	}
}

module.exports = LCM;
