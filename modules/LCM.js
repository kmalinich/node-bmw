#!/usr/bin/env node

const module_name = 'LCM';

var auto_lights_interval;

// npm libraries
const suncalc = require('suncalc');

// Get LCM coding data
function get_coding() {
	// Get all 20 blocks of coding data
	for (var byte = 0; byte < 21; byte++) {
		omnibus.ibus.send({
			src: 'DIA',
			dst: 'LCM',
			msg: [0x08, byte],
		});
	}
}

// This message also has days since service and total kms, but, baby steps...
function decode_vehicle_data(message) {
	var vin_string     = hex.hex2a(message[1].toString(16))+hex.hex2a(message[2].toString(16))+message[3].toString(16)+message[4].toString(16)+message[5].toString(16)[0];
	status.vehicle.vin = vin_string;
	console.log('[node::LCM] Decoded VIN string: \'%s\'', vin_string);
}

// [0x5B] Decode a light status message from the LCM and act upon the results
function decode_light_status(message) {
	// Could be done better/cleaner, like setting all values (except turn) to false first.. or something

	// Lights on
	if (message[1] == 0x00)          { status.lights.all_off        = true; } else { status.lights.all_off        = false; }
	if (bitmask.bit_test(message[1], bitmask.bit[0])) { status.lights.standing_front = true; } else { status.lights.standing_front = false; }
	if (bitmask.bit_test(message[1], bitmask.bit[1])) { status.lights.lowbeam        = true; } else { status.lights.lowbeam        = false; }
	if (bitmask.bit_test(message[1], bitmask.bit[2])) { status.lights.highbeam       = true; } else { status.lights.highbeam       = false; }
	if (bitmask.bit_test(message[1], bitmask.bit[3])) { status.lights.fog_front      = true; } else { status.lights.fog_front      = false; }
	if (bitmask.bit_test(message[1], bitmask.bit[4])) { status.lights.fog_rear       = true; } else { status.lights.fog_rear       = false; }
	if (bitmask.bit_test(message[1], bitmask.bit[7])) { status.lights.turn_fast      = true; } else { status.lights.turn_fast      = false; }

	// Faulty
	if (message[2] == 0x00)          { status.lights.faulty.all_ok         = true; } else { status.lights.faulty.all_ok         = false; }
	if (bitmask.bit_test(message[2], bitmask.bit[0])) { status.lights.faulty.standing.front = true; } else { status.lights.faulty.standing.front = false; }
	if (bitmask.bit_test(message[2], bitmask.bit[1])) { status.lights.faulty.lowbeam        = true; } else { status.lights.faulty.lowbeam        = false; }
	if (bitmask.bit_test(message[2], bitmask.bit[2])) { status.lights.faulty.highbeam       = true; } else { status.lights.faulty.highbeam       = false; }
	if (bitmask.bit_test(message[2], bitmask.bit[3])) { status.lights.faulty.fog.front      = true; } else { status.lights.faulty.fog.front      = false; }
	if (bitmask.bit_test(message[2], bitmask.bit[4])) { status.lights.faulty.fog.rear       = true; } else { status.lights.faulty.fog.rear       = false; }
	if (bitmask.bit_test(message[2], bitmask.bit[5])) { status.lights.faulty.turn.left      = true; } else { status.lights.faulty.turn.left      = false; }
	if (bitmask.bit_test(message[2], bitmask.bit[6])) { status.lights.faulty.turn.right     = true; } else { status.lights.faulty.turn.right     = false; }
	if (bitmask.bit_test(message[2], bitmask.bit[7])) { status.lights.faulty.license_plate  = true; } else { status.lights.faulty.license_plate  = false; }

	// Lights on
	if (bitmask.bit_test(message[3], bitmask.bit[1])) { status.lights.brake           = true; } else { status.lights.brake           = false; }
	if (bitmask.bit_test(message[3], bitmask.bit[2])) { status.lights.turn_sync       = true; } else { status.lights.turn_sync       = false; }
	if (bitmask.bit_test(message[3], bitmask.bit[3])) { status.lights.standing_rear   = true; } else { status.lights.standing_rear   = false; }
	if (bitmask.bit_test(message[3], bitmask.bit[4])) { status.lights.trailer         = true; } else { status.lights.trailer         = false; }
	if (bitmask.bit_test(message[3], bitmask.bit[5])) { status.lights.reverse         = true; } else { status.lights.reverse         = false; }
	if (bitmask.bit_test(message[3], bitmask.bit[6])) { status.lights.trailer_reverse = true; } else { status.lights.trailer_reverse = false; }
	if (bitmask.bit_test(message[3], bitmask.bit[7])) { status.lights.hazard          = true; } else { status.lights.hazard          = false; }

	// Faulty
	if (bitmask.bit_test(message[4], bitmask.bit[0])) { status.lights.faulty.brake.right         = true; } else { status.lights.faulty.brake.right         = false; }
	if (bitmask.bit_test(message[4], bitmask.bit[1])) { status.lights.faulty.brake.left          = true; } else { status.lights.faulty.brake.left          = false; }
	if (bitmask.bit_test(message[4], bitmask.bit[2])) { status.lights.faulty.standing.rear_right = true; } else { status.lights.faulty.standing.rear_right = false; }
	if (bitmask.bit_test(message[4], bitmask.bit[3])) { status.lights.faulty.standing.rear_left  = true; } else { status.lights.faulty.standing.rear_left  = false; }
	if (bitmask.bit_test(message[4], bitmask.bit[4])) { status.lights.faulty.lowbeam.right       = true; } else { status.lights.faulty.lowbeam.right       = false; }
	if (bitmask.bit_test(message[4], bitmask.bit[5])) { status.lights.faulty.lowbeam.left        = true; } else { status.lights.faulty.lowbeam.left        = false; }

	/*
	 * Comfort turn signal handling
	 */

	// Store status in temporary variables
	var turn_left_on  = bitmask.bit_test(message[1], bitmask.bit[5]);
	var turn_right_on = bitmask.bit_test(message[1], bitmask.bit[6]);

	// If comfort turn is not currently engaged
	if (status.lights.turn_comfort_left == true || status.lights.turn_comfort_right == true) {
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
		if (turn_left_on && !turn_right_on && status.lights.turn_left == false) {
			status.lights.turn_left_depress_time = Date.now();
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
		if (!turn_left_on && turn_right_on && status.lights.turn_right == false) {
			status.lights.turn_right_depress_time = Date.now();
		}

		// If left signal is now off and right signal is now off
		if (!turn_left_on && !turn_right_on) {
			// If left signal was previously on
			if (status.lights.turn_left == true) {
				// Set turn_left_release_time timestamp
				status.lights.turn_left_release_time = Date.now();

				// Calculate time difference between initial on and off
				var turn_left_depress_elapsed = status.lights.turn_left_release_time-status.lights.turn_left_depress_time;

				// If the time difference is less than 1000ms, fire comfort turn signal
				if (turn_left_depress_elapsed < 1000) {
					console.log('[node::LCM] Left turn signal depress elapsed time: %s ms. Firing left comfort turn signal', turn_left_depress_elapsed);
					comfort_turn('left');
				}
			}

			// If right signal was previously on
			if (status.lights.turn_right == true) {
				// Set turn_right_release_time timestamp
				status.lights.turn_right_release_time = Date.now();

				// Calculate time difference between initial on and off
				var turn_right_depress_elapsed = status.lights.turn_right_release_time-status.lights.turn_right_depress_time;

				// If the time difference is less than 1000ms, fire comfort turn signal
				if (turn_right_depress_elapsed < 1000) {
					console.log('[node::LCM] Right turn signal depress elapsed time: %s ms. Firing right comfort turn signal', turn_right_depress_elapsed);
					comfort_turn('right');
				}
			}
		}
	}

	// Afterwards, set the status in status.lights as usual
	if (turn_right_on) { status.lights.turn_right = true; } else { status.lights.turn_right = false; }
	if (turn_left_on)  { status.lights.turn_left  = true; } else { status.lights.turn_left  = false; }

	// console.log('[node::LCM] Decoded light status');
}

// Automatic lights handling
function auto_lights(light_switch) {
	console.log('[node::LCM] Trying to set auto lights to \'%s\'; current status \'%s\'', light_switch, status.lights.auto.active);

	switch (light_switch) {
		case 'off':
			if (status.lights.auto.active === true) {
				auto_lights_off();
			}
			break;
		case 'on':
			if (status.lights.auto.active === false) {
				// Set status variable
				status.lights.auto.active = true;

				// Send one through to prime the pumps
				omnibus.LCM.auto_lights_process();

				// Process/send LCM data on 5 second interval
				// LCM diag command timeout is 15 seconds
				auto_lights_interval = setInterval(() => {
					// Process auto lights
					omnibus.LCM.auto_lights_process();
				}, 5000);
			}
			break;
	}
}

// Quick reset auto lights
function auto_lights_off() {
	clearInterval(auto_lights_interval);

	// Set status variables
	status.lights.auto.reason   = null;
	status.lights.auto.active   = false;
	status.lights.auto.standing = false;
	status.lights.auto.lowbeam  = false;
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
			status.lights.turn_comfort_left  = true;
			status.lights.turn_comfort_right = false;
			cluster_msg_1 = '<------';
			cluster_msg_3 = '       ';
			break;
		case 'right':
			// Set status variables
			status.lights.turn_comfort_left  = false;
			status.lights.turn_comfort_right = true;
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
		status.lights.turn_comfort_left  = false;
		status.lights.turn_comfort_right = false;
		reset();
		omnibus.IKE.hud_refresh();
	}, 2000);

}

function reset() {
	console.log('[node::LCM] reset()');
	var lcm_object = {
		dimmer_value_1    : status.lights.auto.dimmer_value_1,
		// dimmer_value_2    : status.lights.dimmer_value_2,
		switch_fog_rear   : true, // To leverage the IKE LED as a status indicator
		switch_lowbeam_1  : status.lights.auto.lowbeam,
		switch_standing   : status.lights.auto.standing,
		switch_turn_left  : status.lights.turn_comfort_left,
		switch_turn_right : status.lights.turn_comfort_right,
	};

	encode_io_status(lcm_object);
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

	// Request the IO status after
	omnibus.LCM.request('io-status');
}

// Encode the LCM bitmask string from an input of true/false values
function encode_io_status(array) {
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

	// These we kinda don't fool with, so just populate them from stock values
	var bitmask_12 = 0x00;
	var bitmask_13 = 0x00;
	var bitmask_14 = 0x00;
	var bitmask_17 = 0x00;
	var bitmask_18 = 0x3D;
	var bitmask_19 = 0x00;
	var bitmask_20 = 0x00;
	var bitmask_21 = 0x00;
	var bitmask_22 = 0x00;
	var bitmask_25 = 0x00;
	var bitmask_26 = 0x00;
	var bitmask_27 = 0x00;
	var bitmask_28 = 0x00;
	var bitmask_29 = 0xFF;
	var bitmask_30 = 0xFF;
	var bitmask_31 = 0x00;

	// These have something to do with autoleveling
	var bitmask_16 = 101;
	var bitmask_23 = 101;
	var bitmask_24 = 101;

	// Set the various bitmask values according to the input array
	if(array.clamp_30a                       ) { bitmask_0 = bitmask.bit_set(bitmask_0, bitmask.bit[0]); }
	if(array.input_fire_extinguisher         ) { bitmask_0 = bitmask.bit_set(bitmask_0, bitmask.bit[1]); }
	if(array.input_preheating_fuel_injection ) { bitmask_0 = bitmask.bit_set(bitmask_0, bitmask.bit[2]); }
	if(array.input_carb                      ) { bitmask_0 = bitmask.bit_set(bitmask_0, bitmask.bit[4]); }
	if(array.clamp_r                         ) { bitmask_0 = bitmask.bit_set(bitmask_0, bitmask.bit[6]); }
	if(array.clamp_30b                       ) { bitmask_0 = bitmask.bit_set(bitmask_0, bitmask.bit[7]); }
	if(array.input_key_in_ignition           ) { bitmask_1 = bitmask.bit_set(bitmask_1, bitmask.bit[0]); }
	if(array.input_seat_belts_lock           ) { bitmask_1 = bitmask.bit_set(bitmask_1, bitmask.bit[1]); }
	if(array.switch_highbeam_flash           ) { bitmask_1 = bitmask.bit_set(bitmask_1, bitmask.bit[2]); }
	if(array.switch_hazard                   ) { bitmask_1 = bitmask.bit_set(bitmask_1, bitmask.bit[4]); }
	if(array.input_kfn                       ) { bitmask_1 = bitmask.bit_set(bitmask_1, bitmask.bit[5]); }
	if(array.input_armoured_door             ) { bitmask_1 = bitmask.bit_set(bitmask_1, bitmask.bit[6]); }
	if(array.input_brake_fluid_level         ) { bitmask_1 = bitmask.bit_set(bitmask_1, bitmask.bit[7]); }

	if(array.switch_brake                    ) { bitmask_2 = bitmask.bit_set(bitmask_2, bitmask.bit[0]); }
	if(array.switch_highbeam                 ) { bitmask_2 = bitmask.bit_set(bitmask_2, bitmask.bit[1]); }
	if(array.switch_fog_front                ) { bitmask_2 = bitmask.bit_set(bitmask_2, bitmask.bit[2]); }
	if(array.switch_fog_rear                 ) { bitmask_2 = bitmask.bit_set(bitmask_2, bitmask.bit[4]); }
	if(array.switch_standing                 ) { bitmask_2 = bitmask.bit_set(bitmask_2, bitmask.bit[5]); }
	if(array.switch_turn_right               ) { bitmask_2 = bitmask.bit_set(bitmask_2, bitmask.bit[6]); }
	if(array.switch_turn_left                ) { bitmask_2 = bitmask.bit_set(bitmask_2, bitmask.bit[7]); }

	if(array.input_air_suspension            ) { bitmask_3 = bitmask.bit_set(bitmask_3, bitmask.bit[0]); }
	if(array.input_hold_up_alarm             ) { bitmask_3 = bitmask.bit_set(bitmask_3, bitmask.bit[1]); }
	if(array.input_washer_fluid_level        ) { bitmask_3 = bitmask.bit_set(bitmask_3, bitmask.bit[2]); }
	if(array.switch_lowbeam_2                ) { bitmask_3 = bitmask.bit_set(bitmask_3, bitmask.bit[3]); }
	if(array.switch_lowbeam_1                ) { bitmask_3 = bitmask.bit_set(bitmask_3, bitmask.bit[4]); }
	if(array.clamp_15                        ) { bitmask_3 = bitmask.bit_set(bitmask_3, bitmask.bit[5]); }
	if(array.input_engine_failsafe           ) { bitmask_3 = bitmask.bit_set(bitmask_3, bitmask.bit[6]); }
	if(array.input_tire_defect               ) { bitmask_3 = bitmask.bit_set(bitmask_3, bitmask.bit[7]); }

	if(array.output_license_rear_left        ) { bitmask_4 = bitmask.bit_set(bitmask_4, bitmask.bit[2]); }
	if(array.output_brake_rear_left          ) { bitmask_4 = bitmask.bit_set(bitmask_4, bitmask.bit[3]); }
	if(array.output_brake_rear_right         ) { bitmask_4 = bitmask.bit_set(bitmask_4, bitmask.bit[4]); }
	if(array.output_highbeam_front_right     ) { bitmask_4 = bitmask.bit_set(bitmask_4, bitmask.bit[5]); }
	if(array.output_highbeam_front_left      ) { bitmask_4 = bitmask.bit_set(bitmask_4, bitmask.bit[6]); }

	if(array.output_standing_front_left      ) { bitmask_5 = bitmask.bit_set(bitmask_5, bitmask.bit[0]); }
	if(array.output_standing_inner_rear_left ) { bitmask_5 = bitmask.bit_set(bitmask_5, bitmask.bit[1]); }
	if(array.output_fog_front_left           ) { bitmask_5 = bitmask.bit_set(bitmask_5, bitmask.bit[2]); }
	if(array.output_reverse_rear_left        ) { bitmask_5 = bitmask.bit_set(bitmask_5, bitmask.bit[3]); }
	if(array.output_lowbeam_front_left       ) { bitmask_5 = bitmask.bit_set(bitmask_5, bitmask.bit[4]); }
	if(array.output_lowbeam_front_right      ) { bitmask_5 = bitmask.bit_set(bitmask_5, bitmask.bit[5]); }
	if(array.output_fog_front_right          ) { bitmask_5 = bitmask.bit_set(bitmask_5, bitmask.bit[6]); }
	if(array.output_led_rear_fog             ) { bitmask_5 = bitmask.bit_set(bitmask_5, bitmask.bit[7]); } // Maybe this is actually the trailer fog..

	if(array.input_vertical_aim              ) { bitmask_6 = bitmask.bit_set(bitmask_6, bitmask.bit[1]); }
	if(array.output_license_rear_right       ) { bitmask_6 = bitmask.bit_set(bitmask_6, bitmask.bit[2]); }
	if(array.output_standing_rear_left       ) { bitmask_6 = bitmask.bit_set(bitmask_6, bitmask.bit[3]); }
	if(array.output_brake_rear_middle        ) { bitmask_6 = bitmask.bit_set(bitmask_6, bitmask.bit[4]); }
	if(array.output_standing_front_right     ) { bitmask_6 = bitmask.bit_set(bitmask_6, bitmask.bit[5]); }
	if(array.output_turn_front_right         ) { bitmask_6 = bitmask.bit_set(bitmask_6, bitmask.bit[6]); }
	if(array.output_turn_rear_left           ) { bitmask_6 = bitmask.bit_set(bitmask_6, bitmask.bit[7]); }

	if(array.output_turn_rear_right          ) { bitmask_7 = bitmask.bit_set(bitmask_7, bitmask.bit[1]); }
	if(array.output_fog_rear_left            ) { bitmask_7 = bitmask.bit_set(bitmask_7, bitmask.bit[2]); }
	if(array.output_standing_inner_rear_right) { bitmask_7 = bitmask.bit_set(bitmask_7, bitmask.bit[3]); }
	if(array.output_standing_rear_right      ) { bitmask_7 = bitmask.bit_set(bitmask_7, bitmask.bit[4]); }
	if(array.output_turn_side_left           ) { bitmask_7 = bitmask.bit_set(bitmask_7, bitmask.bit[5]); } // Maybe this is actually the trailer left..
	if(array.output_turn_front_left          ) { bitmask_7 = bitmask.bit_set(bitmask_7, bitmask.bit[6]); }
	if(array.output_reverse_rear_right       ) { bitmask_7 = bitmask.bit_set(bitmask_7, bitmask.bit[7]); }

	if(array.mode_failsafe                   ) { bitmask_8 = bitmask.bit_set(bitmask_8, bitmask.bit[0]); }
	if(array.output_led_switch_hazard        ) { bitmask_8 = bitmask.bit_set(bitmask_8, bitmask.bit[2]); }
	if(array.output_led_switch_light         ) { bitmask_8 = bitmask.bit_set(bitmask_8, bitmask.bit[3]); }
	if(array.output_reverse_rear_trailer     ) { bitmask_8 = bitmask.bit_set(bitmask_8, bitmask.bit[5]); }
	if(array.mode_sleep                      ) { bitmask_8 = bitmask.bit_set(bitmask_8, bitmask.bit[6]); }

	// LCM dimmer
	if(array.battery_voltage) { bitmask_9 = parseInt(array.dimmer_value_1); }
	// if(array.dimmer_value_2) { bitmask_15 = parseInt(array.dimmer_value_2); }

	// Suspect
	// array.clamp_58g

	// ??
	// if(array.) { bitmask_0 = bitmask.bit_set(bitmask_0, bitmask.bit[3]) ; }
	// if(array.) { bitmask_0 = bitmask.bit_set(bitmask_0, bitmask.bit[5]) ; }
	// if(array.) { bitmask_1 = bitmask.bit_set(bitmask_1, bitmask.bit[3]) ; }
	// if(array.) { bitmask_2 = bitmask.bit_set(bitmask_2, bitmask.bit[3]) ; }
	// if(array.) { bitmask_4 = bitmask.bit_set(bitmask_4, bitmask.bit[0]) ; }
	// if(array.) { bitmask_4 = bitmask.bit_set(bitmask_4, bitmask.bit[1]) ; }
	// if(array.) { bitmask_4 = bitmask.bit_set(bitmask_4, bitmask.bit[7]) ; }
	// if(array.) { bitmask_4 = bitmask.bit_set(bitmask_5, bitmask.bit[7]) ; }
	// if(array.) { bitmask_6 = bitmask.bit_set(bitmask_6, bitmask.bit[0]) ; }
	// if(array.) { bitmask_7 = bitmask.bit_set(bitmask_7, bitmask.bit[0]) ; }
	// if(array.) { bitmask_8 = bitmask.bit_set(bitmask_8, bitmask.bit[1]) ; }
	// if(array.) { bitmask_8 = bitmask.bit_set(bitmask_8, bitmask.bit[4]) ; }
	// if(array.) { bitmask_8 = bitmask.bit_set(bitmask_8, bitmask.bit[7]) ; }

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
function decode_io_status(array) {
	var bitmask_0  = array[1];
	var bitmask_1  = array[2];
	var bitmask_2  = array[3];
	var bitmask_3  = array[4];
	var bitmask_4  = array[5];
	var bitmask_5  = array[6];
	var bitmask_6  = array[7];
	var bitmask_7  = array[8];
	var bitmask_8  = array[9];
	var bitmask_9  = array[10]; // battery voltage 0x00-0xFF
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
	status.lcm.io.bitmask_0  = bitmask_0;
	status.lcm.io.bitmask_1  = bitmask_1;
	status.lcm.io.bitmask_2  = bitmask_2;
	status.lcm.io.bitmask_2  = bitmask_2;
	status.lcm.io.bitmask_3  = bitmask_3;
	status.lcm.io.bitmask_4  = bitmask_4;
	status.lcm.io.bitmask_5  = bitmask_5;
	status.lcm.io.bitmask_6  = bitmask_6;
	status.lcm.io.bitmask_7  = bitmask_7;
	status.lcm.io.bitmask_8  = bitmask_8;
	status.lcm.io.bitmask_9  = bitmask_9;
	status.lcm.io.bitmask_10 = bitmask_10;
	status.lcm.io.bitmask_11 = bitmask_11;
	status.lcm.io.bitmask_12 = bitmask_12;
	status.lcm.io.bitmask_13 = bitmask_13;
	status.lcm.io.bitmask_14 = bitmask_14;
	status.lcm.io.bitmask_15 = bitmask_15;
	status.lcm.io.bitmask_16 = bitmask_16;
	status.lcm.io.bitmask_17 = bitmask_17;
	status.lcm.io.bitmask_18 = bitmask_18;
	status.lcm.io.bitmask_19 = bitmask_19;
	status.lcm.io.bitmask_20 = bitmask_20;
	status.lcm.io.bitmask_21 = bitmask_21;
	status.lcm.io.bitmask_22 = bitmask_22;
	status.lcm.io.bitmask_23 = bitmask_23;
	status.lcm.io.bitmask_24 = bitmask_24;
	status.lcm.io.bitmask_25 = bitmask_25;
	status.lcm.io.bitmask_26 = bitmask_26;
	status.lcm.io.bitmask_27 = bitmask_27;
	status.lcm.io.bitmask_28 = bitmask_28;

	// Bitmask 29+30 are the MFL lever voltage, x100
	status.lcm.io.bitmask_29 = bitmask_29;
	status.lcm.io.bitmask_30 = bitmask_30;
	status.lcm.switch.mfl    = parseFloat((bitmask_29+bitmask_30)/100);

	status.lcm.io.bitmask_31 = bitmask_31;

	status.lcm.clamp.c_15                       = bitmask.bit_test(bitmask_3, bitmask.bit[5]);
	status.lcm.clamp.c_30a                      = bitmask.bit_test(bitmask_0, bitmask.bit[0]);
	status.lcm.clamp.c_30b                      = bitmask.bit_test(bitmask_0, bitmask.bit[7]);
	status.lcm.clamp.c_r                        = bitmask.bit_test(bitmask_0, bitmask.bit[6]);
	status.lcm.battery_voltage                  = bitmask_9;
	status.lcm.dimmer.value_2                   = bitmask_15;
	status.lcm.input.air_suspension             = bitmask.bit_test(bitmask_3, bitmask.bit[0]);
	status.lcm.input.armoured_door              = bitmask.bit_test(bitmask_1, bitmask.bit[6]);
	status.lcm.input.brake_fluid_level          = bitmask.bit_test(bitmask_1, bitmask.bit[7]);
	status.lcm.input.carb                       = bitmask.bit_test(bitmask_0, bitmask.bit[4]);
	status.lcm.input.engine_failsafe            = bitmask.bit_test(bitmask_3, bitmask.bit[6]);
	status.lcm.input.fire_extinguisher          = bitmask.bit_test(bitmask_0, bitmask.bit[1]);
	status.lcm.input.hold_up_alarm              = bitmask.bit_test(bitmask_3, bitmask.bit[1]);
	status.lcm.input.key_in_ignition            = bitmask.bit_test(bitmask_1, bitmask.bit[0]);
	status.lcm.input.kfn                        = bitmask.bit_test(bitmask_1, bitmask.bit[5]);
	status.lcm.input.preheating_fuel_injection  = bitmask.bit_test(bitmask_0, bitmask.bit[2]);
	status.lcm.input.seat_belts_lock            = bitmask.bit_test(bitmask_1, bitmask.bit[1]);
	status.lcm.input.tire_defect                = bitmask.bit_test(bitmask_3, bitmask.bit[7]);
	status.lcm.input.vertical_aim               = bitmask.bit_test(bitmask_6, bitmask.bit[1]);
	status.lcm.input.washer_fluid_level         = bitmask.bit_test(bitmask_3, bitmask.bit[2]);
	status.lcm.mode.failsafe                    = bitmask.bit_test(bitmask_8, bitmask.bit[0]);
	status.lcm.mode.sleep                       = bitmask.bit_test(bitmask_8, bitmask.bit[6]);
	status.lcm.output.brake.rear_left           = bitmask.bit_test(bitmask_4, bitmask.bit[3]);
	status.lcm.output.brake.rear_middle         = bitmask.bit_test(bitmask_6, bitmask.bit[4]);
	status.lcm.output.brake.rear_right          = bitmask.bit_test(bitmask_4, bitmask.bit[4]);
	status.lcm.output.fog.front_left            = bitmask.bit_test(bitmask_5, bitmask.bit[2]);
	status.lcm.output.fog.front_right           = bitmask.bit_test(bitmask_5, bitmask.bit[6]);
	status.lcm.output.fog.rear_left             = bitmask.bit_test(bitmask_7, bitmask.bit[2]);
	status.lcm.output.highbeam.front_left       = bitmask.bit_test(bitmask_4, bitmask.bit[6]);
	status.lcm.output.highbeam.front_right      = bitmask.bit_test(bitmask_4, bitmask.bit[5]);
	status.lcm.output.led.switch_hazard         = bitmask.bit_test(bitmask_8, bitmask.bit[2]);
	status.lcm.output.led.switch_light          = bitmask.bit_test(bitmask_8, bitmask.bit[3]);
	status.lcm.output.led.rear_fog              = bitmask.bit_test(bitmask_5, bitmask.bit[7]);
	status.lcm.output.license.rear_left         = bitmask.bit_test(bitmask_4, bitmask.bit[2]);
	status.lcm.output.license.rear_right        = bitmask.bit_test(bitmask_6, bitmask.bit[2]);
	status.lcm.output.lowbeam.front_left        = bitmask.bit_test(bitmask_5, bitmask.bit[4]);
	status.lcm.output.lowbeam.front_right       = bitmask.bit_test(bitmask_5, bitmask.bit[5]);
	status.lcm.output.reverse.rear_left         = bitmask.bit_test(bitmask_5, bitmask.bit[3]);
	status.lcm.output.reverse.rear_right        = bitmask.bit_test(bitmask_7, bitmask.bit[7]);
	status.lcm.output.reverse.rear_trailer      = bitmask.bit_test(bitmask_8, bitmask.bit[5]);
	status.lcm.output.standing.front_left       = bitmask.bit_test(bitmask_5, bitmask.bit[0]);
	status.lcm.output.standing.front_right      = bitmask.bit_test(bitmask_6, bitmask.bit[5]);
	status.lcm.output.standing.inner_rear_left  = bitmask.bit_test(bitmask_5, bitmask.bit[1]);
	status.lcm.output.standing.inner_rear_right = bitmask.bit_test(bitmask_7, bitmask.bit[3]);
	status.lcm.output.standing.rear_left        = bitmask.bit_test(bitmask_6, bitmask.bit[3]);
	status.lcm.output.standing.rear_right       = bitmask.bit_test(bitmask_7, bitmask.bit[4]);
	status.lcm.output.turn.side_left            = bitmask.bit_test(bitmask_7, bitmask.bit[5]);
	status.lcm.output.turn.front_left           = bitmask.bit_test(bitmask_7, bitmask.bit[6]);
	status.lcm.output.turn.front_right          = bitmask.bit_test(bitmask_6, bitmask.bit[6]);
	status.lcm.output.turn.rear_left            = bitmask.bit_test(bitmask_6, bitmask.bit[7]);
	status.lcm.output.turn.rear_right           = bitmask.bit_test(bitmask_7, bitmask.bit[1]);
	status.lcm.switch.brake                     = bitmask.bit_test(bitmask_2, bitmask.bit[0]);
	status.lcm.switch.fog_front                 = bitmask.bit_test(bitmask_2, bitmask.bit[2]);
	status.lcm.switch.fog_rear                  = bitmask.bit_test(bitmask_2, bitmask.bit[4]);
	status.lcm.switch.hazard                    = bitmask.bit_test(bitmask_1, bitmask.bit[4]);
	status.lcm.switch.highbeam                  = bitmask.bit_test(bitmask_2, bitmask.bit[1]);
	status.lcm.switch.highbeam_flash            = bitmask.bit_test(bitmask_1, bitmask.bit[2]);
	status.lcm.switch.lowbeam_1                 = bitmask.bit_test(bitmask_3, bitmask.bit[4]);
	status.lcm.switch.lowbeam_2                 = bitmask.bit_test(bitmask_3, bitmask.bit[3]);
	status.lcm.switch.standing                  = bitmask.bit_test(bitmask_2, bitmask.bit[5]);
	status.lcm.switch.turn_left                 = bitmask.bit_test(bitmask_2, bitmask.bit[7]);
	status.lcm.switch.turn_right                = bitmask.bit_test(bitmask_2, bitmask.bit[6]);

	// console.log('[node::LCM] Decoded IO status');
}

module.exports = {
	// Logic based on location and time of day, determine if the low beams should be on
	auto_lights_process : () => {
		// Init variables
		var current_time = new Date();
		var sun_times    = suncalc.getTimes(current_time, 39.333581, -84.327600);
		var lights_on    = new Date(sun_times.sunsetStart.getTime());
		var lights_off   = new Date(sun_times.sunriseEnd.getTime());

		// Debug logging
		// console.log('current_time : %s', current_time);
		// console.log('lights_on    : %s', lights_on);
		// console.log('lights_off   : %s', lights_off);

		// Check ignition
		if (status.vehicle.ignition !== 'run' || config.lights.auto !== true) {
			// Not in run: turn off auto lights
			// console.log('[node::LCM] auto_lights_process(): ignition not in run (it\'s in \'%s\'); disabling auto lights', ignition);
			auto_lights('off');
			return;
		}
		else {
			auto_lights('on');
		}

		// Check handbrake
		// if (status.vehicle.handbrake === true && status.vehicle.ignition == 'run') {
		// 	// Handbrake is set: disable auto lowbeams
		// 	console.log('[node::LCM] Auto lights: Handbrake on');

		// 	status.lights.auto.reason   = 'handbrake on';
		// 	status.lights.auto.lowbeam  = false;
		// 	status.lights.auto.standing = true;
		// 	reset();
		// 	return;
		// }

		// Check time of day
		if (current_time < lights_off) {
			status.lights.auto.reason    = 'before lights off';
			status.lights.auto.lowbeam   = true;
			status.lights.auto.standing  = false;
			status.lights.auto.dimmer_value_1 = config.lights.dimmer_lights_on;
		}
		else if (current_time > lights_off && current_time < lights_on) {
			status.lights.auto.reason    = 'after lights off, before lights on';
			status.lights.auto.lowbeam   = false;
			status.lights.auto.standing  = true;
			status.lights.auto.dimmer_value_1 = config.lights.dimmer_lights_off;
		}
		else if (current_time > lights_on) {
			status.lights.auto.reason    = 'after lights on';
			status.lights.auto.lowbeam   = true;
			status.lights.auto.standing  = false;
			status.lights.auto.dimmer_value_1 = config.lights.dimmer_lights_on;
		}
		else {
			status.lights.auto.reason    = 'unknown time of day, engaging failsafe';
			status.lights.auto.lowbeam   = true;
			status.lights.auto.standing  = false;
			status.lights.auto.dimmer_value_1 = config.lights.dimmer_lights_on;
		}

		// console.log('[node::LCM] auto_lights_process(): standing: %s, lowbeam: %s, reason: %s', status.lights.auto.standing, status.lights.auto.lowbeam, status.lights.auto.reason);
		reset();
	},

	// Parse data sent from LCM module
	parse_out : (data) => {
		// Init variables
		var command;
		var value;

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
						break;
				}
				break;

			case 0x10: // Request: ignition status
				data.command = 'req';
				data.value   = 'ignition status';
				break;

			case 0x12: // Request: IKE sensor status
				data.command = 'req';
				data.value   = 'IKE sensor status';
				break;

			case 0x1D: // Request: temperature
				data.command = 'req';
				data.value   = 'temperature';
				break;

			case 0x54: // Broadcast: vehicle data
				data.command = 'bro';
				data.value   = 'vehicle data';
				decode_vehicle_data(data.msg);
				break;

			case 0x5B: // Broadcast: light status
				data.command = 'bro';
				data.value   = 'light status';
				decode_light_status(data.msg);
				break;

			case 0x5C: // Broadcast: light dimmer status
				status.lights.dimmer_value_3 = data.msg[1];
				data.command = 'bro';
				data.value   = 'dimmer 3 : '+status.lights.dimmer_value_3;
				break;

			case 0x79: // Request: door/flap status
				data.command = 'req';
				data.value   = 'door/flap status';
				break;

			case 0xA0: // Reply to DIA: success
				data.command = 'rep';
				if (data.msg.length === 33 || data.msg.length === 13) {
					data.value = 'IO status';
					decode_io_status(data.msg);
				}
				else if (data.msg.length == 1) {
					data.value = 'ACK';
				}
				else {
					data.value = Buffer.from(data.msg);
				}
				break;

			case 0xA2: // diagnostic command rejected
				data.command = 'rep';
				data.value   = 'diagnostic command rejected';
				break;

			default:
				data.command = 'unk';
				data.value   = Buffer.from(data.msg);
				break;
		}

		log.out(data);
	},

	// Request various things from LCM
	request : (value) => {
		var src;
		var cmd;

		console.log('[node::LCM] Requesting \'%s\'', value);

		switch (value) {
			case 'coding':
				get_coding();
				break;
			case 'dimmer':
				src = 'BMBT';
				cmd = [0x5D];
				break;
			case 'io-status':
				src = 'DIA';
				cmd = [0x0B, 0x00]; // Get IO status
				break;
			case 'lampstatus':
				src = 'GT';
				cmd = [0x5A];
				break;
			case 'vehicledata':
				src = 'IKE';
				cmd = [0x53];
				break;
		}

		omnibus.ibus.send({
			src: src,
			dst: 'LCM',
			msg: cmd,
		});
	},

	// Handle incoming commands from API
	lcm_data : (data) => {
		if (typeof data['lcm-get'] !== 'undefined') {
			omnibus.LCM.request('io-status');
		}
		else {
			// Dirty assumption
			encode_io_status(data);
		}
	},

	// Welcome lights on unlocking/locking
	welcome_lights : (action) => {
		var lcm_object;
		console.log('[node::LCM] Welcome lights level \'%s\'', status.lights.welcome_lights_level);

		switch (action) {
			case 'on' :
				status.lights.welcome_lights = true;

				// This below could be done about 5000x better, but it is late, I'm tired, and I wanted to write working POC code before I hung it up.
				if (status.lights.welcome_lights_level == 0) {
					status.lights.welcome_lights_level = 1;
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
				else if (status.lights.welcome_lights_level == 1) {
					status.lights.welcome_lights_level = 2;
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
				else if (status.lights.welcome_lights_level == 2) {
					status.lights.welcome_lights_level = 3;
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
				else if (status.lights.welcome_lights_level == 3) {
					status.lights.welcome_lights_level = 4;
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
				else if (status.lights.welcome_lights_level == 4) {
					status.lights.welcome_lights_level = 5;
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
				else if (status.lights.welcome_lights_level == 5) {
					status.lights.welcome_lights_level = 6;
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
				else if (status.lights.welcome_lights_level == 6) {
					status.lights.welcome_lights_level = 0;
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

				encode_io_status(lcm_object);
				break;
			case 'off':
				status.lights.welcome_lights       = false;
				status.lights.welcome_lights_level = 0;
				reset();
				break;
		}

		// Clear welcome lights variables after 15 seconds
		if (status.lights.welcome_lights == true) {
			setTimeout(() => {
				status.lights.welcome_lights       = false;
				status.lights.welcome_lights_level = 0;
			}, 15000);
		}
	},
};
