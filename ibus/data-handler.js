#!/usr/bin/env node

// Ultimately some of this could be moved inside the module functions, after the modules themselves are cleaned up...

var data_handler = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.check_data = check_data;

	// Bitmasks in hex
	var bit_0 = 0x01; // 1
	var bit_1 = 0x02; // 2
	var bit_2 = 0x04; // 4
	var bit_3 = 0x08; // 8
	var bit_4 = 0x10; // 16
	var bit_5 = 0x20; // 32
	var bit_6 = 0x40; // 64
	var bit_7 = 0x80; // 128

	// Run check_data(); when new bus data appears 
	omnibus.ibus_connection.on('data', check_data)

	// Test number for bitmask
	function bit_test(num, bit) {
		if ((num & bit) != 0) { return true; }
		else { return false; }
	}

	// Data handler
	function check_data(data) {
		var dst = omnibus.bus_modules.get_module_name(data.dst);
		var src = omnibus.bus_modules.get_module_name(data.src);
		var msg = data.msg;

		// GM
		if (src == 'GM') {
			// Key fob message
			if (msg[0] == 0x72) {
				var command = 'key fob status';
				omnibus.GM.key_fob_status_decode(msg);
			}

			// Current door/flap status
			else if (msg[0] == 0x7A) {
				var command = 'current door/flap status';
				omnibus.GM.door_flap_status_decode(msg);
			}

			else {
				var command = 'unknown';
			}

			console.log('[%s->%s] %s', src, dst, command);
		}

		// EWS
		else if (src == 'EWS') {
			var key_out  = new Buffer([0x74, 0x00, 0xFF]);
			var key_1_in = new Buffer([0x74, 0x04, 0x01]);

			if (msg.compare(key_out) == 0) {
				var command = 'removed';
				var data    = 'key';
			}

			else if (msg.compare(key_1_in) == 0) {
				var command = 'inserted';
				var data    = 'key 1';
			}

			else {
				var command = 'unknown';
				var data    = 'unknown';
			}

			console.log('[%s->%s] %s: %s', src, dst, command, data);
		}

		// CCM
		else if (src == 'CCM') {
			if (msg[0] == 0x51) {
				var command = 'check control sensors';
				var data    = 'unknown'
			}     

			else if (msg[0] == 0x1a) {
				var command = 'check control message';
				var data    = ''+msg+'';
			}

			else {
				var command = 'unknown';
				var data    = 'unknown';
			}

			console.log('[%s->%s] %s: %s', src, dst, command, data);
		}

		// RAD
		else if (src == 'RAD') {
			// CD changer emulation handling
			if (dst == 'CDC') {
				if (msg[0] == 0x01) {
					var command = 'device status request';

					// Do CDC->LOC Device status ready
					omnibus.CDC.send_device_status_ready();
				}

				else if(msg[0] == 0x38 && msg[1] == 0x00 && msg[2] == 0x00) {
					var command = 'CD control status request';

					// Do CDC->LOC CD status play
					omnibus.CDC.send_cd_status_play();
				}

				else {
					var command = 'unknown';
				}
			}

			else {
				var command = 'unknown';
			}

			console.log('[%s->%s] %s', src, dst, command);
		}

		// LCM
		else if (src == 'LCM') {
			if (msg[0] == 0xA0 && typeof msg[1] !== 'undefined') {
				var command = 'current IO status';
				omnibus.LCM.io_status_decode(msg);
			}

			else if(msg[0] == 0x5B) {
				var command = 'light status';
				omnibus.LCM.light_status_decode(msg);
			}

			else if(msg[0] == 0x5C) {
				var command = 'light dimmer status';
				omnibus.status.lights.dimmer = msg[1];
			}

			else {
				var command = 'unknown';
			}

			console.log('[%s->%s] %s', src, dst, command);
		}

		// IKE
		else if (src == 'IKE') {
			if (msg[0] == 0x11) {
				var command = 'ignition status';

				if      (msg[1] == 0x00) { omnibus.status.vehicle.ignition = 'off';       }
				else if (msg[1] == 0x01) { omnibus.status.vehicle.ignition = 'accessory'; }
				else if (msg[1] == 0x03) { omnibus.status.vehicle.ignition = 'run';       }
				else if (msg[1] == 0x07) { omnibus.status.vehicle.ignition = 'start';     }
				else                     { omnibus.status.vehicle.ignition = 'unknown';   }
			}

			else if (msg[0] == 0x13) {
				var command = 'sensor status';

				// This is a bitmask
				// msg[1]:
				// 0x01 = handbrake on
				if (bit_test(msg[1], bit_0)) { omnibus.status.vehicle.handbrake = true; } else { omnibus.status.vehicle.handbrake = false; }

				// msg[2]:
				//   1 = Engine running
				// 176 = P (4+5+7)
				//  16 = R (4)
				// 112 = N (4+5+6)
				// 128 = D (7)
				// 192 = 4 (6+7)
				// 208 = 3 (4+6+7)
				//  64 = 2 (6)
				if (bit_test(msg[2], bit_0)) { omnibus.status.engine.running = true; } else { omnibus.status.engine.running = false; }

				if (bit_test(msg[2], bit_4) && !bit_test(msg[2], bit_5) && !bit_test(msg[2], bit_6) && !bit_test(msg[2], bit_7)) {
					omnibus.status.vehicle.reverse = true;
				}

				else {
					omnibus.status.vehicle.reverse = false;
				}
			}

			else if (msg[0] == 0x17) {
				var command = 'current odometer';
			}

			else if (msg[0] == 0x19) {
				var command = 'current temperature';

				// Update external and engine coolant temp variables
				omnibus.status.temperature.exterior_c = parseFloat(msg[1]).toFixed(2);
				omnibus.status.temperature.coolant_c  = parseFloat(msg[2]).toFixed(2);

				omnibus.status.temperature.exterior_f = parseFloat(((msg[1]*9)/5)+32).toFixed(2);
				omnibus.status.temperature.coolant_f  = parseFloat(((msg[2]*9)/5)+32).toFixed(2);
			}

			else if (msg[0] == 0x18) {
				var command = 'current speed and RPM';

				// Update vehicle and engine speed variables
				omnibus.status.vehicle.speed_kmh = parseFloat(msg[1]*2).toFixed(2);
				omnibus.status.engine.speed      = parseFloat(msg[2]*100).toFixed(2);

				// Convert values and round to 2 decimals
				omnibus.status.vehicle.speed_mph = parseFloat((msg[1]*2)*0.621371192237334).toFixed(2);
			}

			// OBC values broadcast
			else if (msg[0] == 0x24) {
				if (msg[1] == 0x01) { // Time
					var command = 'OBC value: time';

					// Parse unit 
					var string_time_unit = new Buffer([msg[8], msg[9]]);
					string_time_unit     = string_time_unit.toString().trim().toLowerCase();

					// Detect 12h or 24h time and parse value
					if (string_time_unit == 'am' || string_time_unit == 'pm') {
						omnibus.status.coding.unit_time = '12h';
						var string_time = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7], msg[8], msg[9]]);
					}
					else {
						omnibus.status.coding.unit_time = '24h';
						var string_time = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7]]);
					}

					string_time = string_time.toString().trim().toLowerCase();

					// Update omnibus.status variables
					omnibus.status.obc.time = string_time; 
				}

				else if (msg[1] == 0x02) { // Date
					var command = 'OBC value: date';

					// Parse value
					var string_date = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7], msg[8], msg[9], msg[10], msg[11], msg[12]]);
					string_date     = string_date.toString().trim();

					// Update omnibus.status variables
					omnibus.status.obc.date = string_date; 
				}

				else if (msg[1] == 0x03) { // Exterior temp
					var command = 'OBC value: exterior temp';

					// Parse unit
					var string_temp_exterior_unit = new Buffer([msg[9]]);
					string_temp_exterior_unit     = string_temp_exterior_unit.toString().trim().toLowerCase();

					// Parse if it is +/-
					var string_temp_exterior_negative = new Buffer([msg[9]]);
					string_temp_exterior_negative     = string_temp_exterior_negative.toString().trim().toLowerCase();

					// Parse value
					if (string_temp_exterior_negative == '-') {
						var string_temp_exterior_value = new Buffer(msg[3], [msg[4], msg[5], msg[6], msg[7]]);
						string_temp_exterior_value     = string_temp_exterior_value.toString().trim().toLowerCase();
					}

					else {
						var string_temp_exterior_value = new Buffer([msg[4], msg[5], msg[6], msg[7]]);
						string_temp_exterior_value     = string_temp_exterior_value.toString().trim().toLowerCase();
					}


					// Update omnibus.status variables
					if (string_temp_exterior_unit == 'c') {
						omnibus.status.obc.temp_exterior_c = parseFloat(string_temp_exterior_value).toFixed(2);
						omnibus.status.obc.temp_exterior_f = parseFloat(((string_temp_exterior_value*9)/5)+32).toFixed(2);
						omnibus.status.coding.unit_temp    = 'c';
					}

					else {
						omnibus.status.obc.temp_exterior_f = parseFloat(string_temp_exterior_value).toFixed(2);
						omnibus.status.obc.temp_exterior_f = parseFloat(((string_temp_exterior_value-32)*(5/9))).toFixed(2);
						omnibus.status.coding.unit_temp    = 'f';
					}
				}

				else if (msg[1] == 0x04) { // Consumption 1
					var command = 'OBC value: consumption 1';

					// Parse unit
					var string_consumption_1_unit = new Buffer([msg[8]]);
					string_consumption_1_unit     = string_consumption_1_unit.toString().trim().toLowerCase();

					// Parse value
					var string_consumption_1 = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_consumption_1     = parseFloat(string_consumption_1.toString().trim().toLowerCase());

					// Perform appropriate conversions between units
					if (string_consumption_1_unit == 'm') {
						omnibus.status.coding.unit_cons = 'mpg';
						string_consumption_1_mpg        = string_consumption_1;
						string_consumption_1_l100       = 235.21/string_consumption_1;
					}

					else {
						omnibus.status.coding.unit_cons = 'l100';
						string_consumption_1_mpg        = 235.21/string_consumption_1;
						string_consumption_1_l100       = string_consumption_1;
					}

					// Update omnibus.status variables
					omnibus.status.obc.consumption_1_mpg  = string_consumption_1_mpg.toFixed(2); 
					omnibus.status.obc.consumption_1_l100 = string_consumption_1_l100.toFixed(2);
				}

				else if (msg[1] == 0x05) { // Consumption 2
					var command = 'OBC value: consumption 2';

					// Parse unit
					var string_consumption_2_unit = new Buffer([msg[8]]);
					string_consumption_2_unit     = string_consumption_2_unit.toString().trim().toLowerCase();

					// Parse value
					var string_consumption_2 = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_consumption_2     = parseFloat(string_consumption_2.toString().trim().toLowerCase());

					// Perform appropriate conversions between units and round to 2 decimals
					if (string_consumption_2_unit == 'm') {
						string_consumption_2_mpg        = string_consumption_2;
						string_consumption_2_l100       = 235.215/string_consumption_2;
					}
					else {
						string_consumption_2_mpg        = 235.215/string_consumption_2;
						string_consumption_2_l100       = string_consumption_2;
					}

					// Update omnibus.status variables
					omnibus.status.obc.consumption_2_mpg  = string_consumption_2_mpg.toFixed(2); 
					omnibus.status.obc.consumption_2_l100 = string_consumption_2_l100.toFixed(2);
				}

				else if (msg[1] == 0x06) { // Range
					var command = 'OBC value: range to empty';

					// Parse value
					var string_range = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_range     = string_range.toString().trim();

					var string_range_unit = new Buffer([msg[7], msg[8]]);
					string_range_unit     = string_range_unit.toString().trim().toLowerCase();

					if (string_range_unit == 'ml') {
						omnibus.status.coding.unit_distance = 'mi';
						// Update omnibus.status variables
						omnibus.status.obc.range_mi = parseFloat(string_range).toFixed(2);
						omnibus.status.obc.range_km = parseFloat(string_range*1.60934).toFixed(2);
					}
					else if (string_range_unit == 'km') {
						omnibus.status.coding.unit_distance = 'km';
						omnibus.status.obc.range_mi = parseFloat(string_range*0.621371).toFixed(2);
						omnibus.status.obc.range_km = parseFloat(string_range).toFixed(2);
					}
				}

				else if (msg[1] == 0x07) { // Distance
					var command = 'OBC value: distance remaining';

					// Parse value
					var string_distance = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_distance     = string_distance.toString().trim().toLowerCase();

					// Update omnibus.status variables
					omnibus.status.obc.distance = string_distance; 
				}

				else if (msg[1] == 0x08) { // --:--
					var command = 'OBC value: clock?';

					console.log('[data-handler] --:--: %s', msg);
				}

				else if (msg[1] == 0x09) { // Limit
					var command = 'OBC value: speed limit';

					// Parse value
					var string_speedlimit = new Buffer([msg[3], msg[4], msg[5]]);
					string_speedlimit     = parseFloat(string_speedlimit.toString().trim().toLowerCase());

					// Update omnibus.status variables
					omnibus.status.obc.speedlimit = string_speedlimit.toFixed(2); 
				}

				else if (msg[1] == 0x0A) { // Avg. speed
					var command = 'OBC value: average speed';

					// Parse unit
					var string_speedavg_unit = new Buffer([msg[8]]);
					string_speedavg_unit     = string_speedavg_unit.toString().trim().toLowerCase();

					// Parse value
					var string_speedavg = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_speedavg     = parseFloat(string_speedavg.toString().trim().toLowerCase());

					// Convert values appropriately based on coding data units
					if (string_speedavg_unit == 'k') {
						omnibus.status.coding.unit_speed = 'kmh';
						// Update omnibus.status variables
						omnibus.status.obc.speedavg_kmh = string_speedavg.toFixed(2);
						omnibus.status.obc.speedavg_mph = (string_speedavg*0.621371).toFixed(2);
					}

					else if (string_speedavg_unit == 'm') {
						omnibus.status.coding.unit_speed = 'mph';
						// Update omnibus.status variables
						omnibus.status.obc.speedavg_kmh = (string_speedavg*1.60934).toFixed(2);
						omnibus.status.obc.speedavg_mph = string_speedavg.toFixed(2);
					}
				}

				else if (msg[1] == 0x0E) { // Timer
					var command = 'OBC value: timer';

					// Parse value
					var string_timer = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_timer     = parseFloat(string_timer.toString().trim().toLowerCase()).toFixed(2);

					// Update omnibus.status variables
					omnibus.status.obc.timer = string_timer; 
				}

				else if (msg[1] == 0x0F) { // Aux heat timer 1
					var command = 'OBC value: aux heat timer 1';

					// Parse value
					var string_aux_heat_timer_1 = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7], msg[8], msg[9]]);
					string_aux_heat_timer_1     = string_aux_heat_timer_1.toString().trim().toLowerCase();

					// Update omnibus.status variables
					omnibus.status.obc.aux_heat_timer_1 = string_aux_heat_timer_1; 
				}

				else if (msg[1] == 0x10) { // Aux heat timer 2
					var command = 'OBC value: aux heat timer 2';

					// Parse value
					var string_aux_heat_timer_2 = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7], msg[8], msg[9]]);
					string_aux_heat_timer_2     = string_aux_heat_timer_2.toString().trim().toLowerCase();

					// Update omnibus.status variables
					omnibus.status.obc.aux_heat_timer_2 = string_aux_heat_timer_2; 
				}

				else if (msg[1] == 0x1A) { // Stopwatch
					var command = 'OBC value: stopwatch';

					// Parse value
					var string_stopwatch = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_stopwatch     = parseFloat(string_stopwatch.toString().trim().toLowerCase()).toFixed(2);

					// Update omnibus.status variables
					omnibus.status.obc.stopwatch = string_stopwatch; 
				}

				else {
					var command = 'OBC value: unknown';
				}
			}

			else if (msg[0] == 0x57) {
				var command = 'BC button';
			}

			else {
				var command = 'unknown';
			}

			console.log('[%s->%s] %s', src, dst, command);
		}

		// MFL
		else if (src == 'MFL') {
			if (msg[0] == 0x32) {
				var command = 'button action';
				var button  = 'volume';
				var action;

				// Needs to be finished
				if      (msg[1] == 0x10) { action = 'decrease 1 step';  }
				else if (msg[1] == 0x11) { action = 'increase 1 step'; }
			}

			else if (msg[0] == 0x3A) {
				var command = 'button action';
				var button  = 'recirculation';
				var action;

				// Bitmask:
				// 0x00 = released
				// 0x08 = pressed

				if      (msg[1] == 0x00) { action = 'released';  }
				else if (msg[1] == 0x01) { action = 'depressed'; }
			}

			else if (msg[0] == 0x3B) {
				var command = 'button action';

				// Bitmask:
				// 0x00 = no buttons pressed
				// 0x01 = right
				// 0x08 = left
				// 0x10 = long depress
				// 0x20 = release
				// 0x80 = send/end

				// Detect button
				var button;
				if      (bit_test(msg[1], bit_0)) { button = 'right';    }
				else if (bit_test(msg[1], bit_3)) { button = 'left';     }
				else if (bit_test(msg[1], bit_7)) { button = 'send/end'; }
				else {
					var button = 'unknown';
				}

				// Detect action
				var action;
				if      (bit_test(msg[1], bit_4)) { action = 'long depress'; }
				else if (bit_test(msg[1], bit_5)) { action = 'release';      }
				else {
					action = 'depress';
				}

			}
			// Nope..
			// 50 B0 01,MFL --> SES: Device status request
			// 50 C8 01,MFL --> TEL: Device status request
			// else if (msg[0] == 0x01) {
			// 	var command = 'button action';
			// 	var button  = 'r/t';
			// 	var action  = 'depress';
			// }

			else {
				var command = 'unknown';
				var button  = 'unknown';
				var action  = 'unknown';
			}

			console.log('[%s->%s] %s: %s->%s', src, dst, command, button, action);
		}

		else {
			var command = 'unknown';
			console.log('[%s->%s] %s', src, dst, command);
		}
	}
}

module.exports = data_handler;
