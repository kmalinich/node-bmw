#!/usr/bin/env node

// Ultimately this could be moved inside the module functions, after the modules themselves are cleaned up...

var data_handler = function(omnibus) {

	// Self reference
	var _self = this;

	// Exposed data
	this.check_data = check_data;

	// Events
	omnibus.ibus_connection.on('data', check_data)

	function check_data(data) {
		var dst = omnibus.bus_modules.get_module_name(data.dst);
		var src = omnibus.bus_modules.get_module_name(data.src);
		var msg = data.msg;

		// GM
		if (src == 'GM') {
			if (msg[0] == 0x72) {
				var command = 'key fob button';

				if (msg[1] == 0x12) {
					var button = 'lock depressed';
					
					// WELCOME LIGHTS!
					var lcm_object = {};

					console.log('[data-handler] Deactivating welcome lights');
					omnibus.LCM_connection.lcm_bitmask_encode(lcm_object);
				}

				else if (msg[1] == 0x22) {
					var button = 'unlock depressed';
					
					// WELCOME LIGHTS!
					var lcm_object = {
						output_lowbeam_front_left   : true,
						output_lowbeam_front_right  : true,
						output_standing_front_left  : true,
						output_standing_front_right : true,
						output_turn_rear_left       : true,
						output_turn_rear_right      : true,
						output_license_rear_right   : true,
						output_reverse_rear_left    : true,
						output_reverse_rear_right   : true,
					};

					console.log('[data-handler] Activating welcome lights');
					omnibus.LCM_connection.lcm_bitmask_encode(lcm_object);
				}

				else if (msg[1] == 0x42) {
					var button = 'trunk depressed';
				}
			}

			// console.log(src, dst, command, button, msg);
		}

		// IKE
		else if (src == 'IKE') {
			if (msg[0] == 0x11) {
				var command = 'ignition';

				if      (msg[1] == 0x00) { omnibus.vehicle_status.vehicle.ignition = 'off';       }
				else if (msg[1] == 0x01) { omnibus.vehicle_status.vehicle.ignition = 'accessory'; }
				else if (msg[1] == 0x03) { omnibus.vehicle_status.vehicle.ignition = 'run';       }
				else if (msg[1] == 0x07) { omnibus.vehicle_status.vehicle.ignition = 'start';     }
				else                     { omnibus.vehicle_status.vehicle.ignition = 'unknown';   }

				console.log('[data-handler] Set omnibus.vehicle_status.vehicle.ignition       = \'%s\'', omnibus.vehicle_status.vehicle.ignition);
			}
			else if (msg[0] == 0x13) {
				var command = 'sensors';

				if (msg[1] == 0x01) { omnibus.vehicle_status.vehicle.handbrake = true; } else { omnibus.vehicle_status.vehicle.handbrake = false; }
				
				// This is a bitmask
				// msg[2]: 0x01 = engine running, 0x10 = reverse
				// For now, dirty hack
				if (msg[2] == 0x01) {
					omnibus.vehicle_status.engine.running  = true;
					omnibus.vehicle_status.vehicle.reverse = false;
				}
				else if (msg[2] == 0x10) {
					omnibus.vehicle_status.engine.running  = false;
					omnibus.vehicle_status.vehicle.reverse = true;
				}
				else if (msg[2] == 0x11) {
					omnibus.vehicle_status.vehicle.reverse = true;
					omnibus.vehicle_status.engine.running  = true;
				}

				console.log('[data-handler] Set omnibus.vehicle_status.vehicle.handbrake      = %s', omnibus.vehicle_status.vehicle.handbrake);
				console.log('[data-handler] Set omnibus.vehicle_status.vehicle.reverse        = %s', omnibus.vehicle_status.vehicle.reverse);
				console.log('[data-handler] Set omnibus.vehicle_status.engine.running         = %s', omnibus.vehicle_status.engine.running);
			}
			else if (msg[0] == 0x17) {
				var command = 'odometer';
			}
			else if (msg[0] == 0x19) {
				var command = 'temperatures';

				// Update external and engine coolant temp variables
				omnibus.vehicle_status.temperature.exterior_c = parseFloat(msg[1]).toFixed(2);
				omnibus.vehicle_status.temperature.coolant_c  = parseFloat(msg[2]).toFixed(2);

				omnibus.vehicle_status.temperature.exterior_f = parseFloat(((msg[1]*9)/5)+32).toFixed(2);
				omnibus.vehicle_status.temperature.coolant_f  = parseFloat(((msg[2]*9)/5)+32).toFixed(2);
				console.log('[data-handler] Set omnibus.vehicle_status.temperature.exterior_c = %s', omnibus.vehicle_status.temperature.exterior_c);
				console.log('[data-handler] Set omnibus.vehicle_status.temperature.coolant_c  = %s', omnibus.vehicle_status.temperature.coolant_c);
				console.log('[data-handler] Set omnibus.vehicle_status.temperature.exterior_f = %s', omnibus.vehicle_status.temperature.exterior_f);
				console.log('[data-handler] Set omnibus.vehicle_status.temperature.coolant_f  = %s', omnibus.vehicle_status.temperature.coolant_f);
			}
			else if (msg[0] == 0x18) {
				var command = 'speed/RPM';

				// Update vehicle and engine speed variables
				omnibus.vehicle_status.vehicle.speed_kmh = parseFloat(msg[1]*2).toFixed(2);
				omnibus.vehicle_status.engine.speed      = parseFloat(msg[2]*100).toFixed(2);

				// Convert values and round to 2 decimals
				omnibus.vehicle_status.vehicle.speed_mph = parseFloat((msg[1]*2)*0.621371192237334).toFixed(2);

				console.log('[data-handler] Set omnibus.vehicle_status.vehicle.speed_kmh      = %s', omnibus.vehicle_status.vehicle.speed_kmh);
				console.log('[data-handler] Set omnibus.vehicle_status.vehicle.speed_mph      = %s', omnibus.vehicle_status.vehicle.speed_mph);
				console.log('[data-handler] Set omnibus.vehicle_status.engine.speed           = %s', omnibus.vehicle_status.engine.speed);
			}
			else if (msg[0] == 0x24) {
				var command = 'OBC text';
				
				if (msg[1] == 0x01) { // Time
					// Parse unit 
					var string_time_unit = new Buffer([msg[8], msg[9]]);
					string_time_unit     = string_time_unit.toString().trim().toLowerCase();

					// Detect 12h or 24h time and parse value
					if (string_time_unit == 'am' || string_time_unit == 'pm') {
						omnibus.vehicle_status.coding.unit_time = '12h';
						var string_time = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7], msg[8], msg[9]]);
					}
					else {
						omnibus.vehicle_status.coding.unit_time = '24h';
						var string_time = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7]]);
					}

					string_time = string_time.toString().trim().toLowerCase();

					// Update omnibus.vehicle_status variables
					omnibus.vehicle_status.obc.time = string_time; 
					console.log('[data-handler] Set omnibus.vehicle_status.obc.time               = \'%s\'', omnibus.vehicle_status.obc.time);
					console.log('[data-handler] Set omnibus.vehicle_status.coding.unit_time       = \'%s\'', omnibus.vehicle_status.coding.unit_time);
				}
				else if (msg[1] == 0x02) { // Date
					// Parse value
					var string_date = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7], msg[8], msg[9], msg[10], msg[11], msg[12]]);
					string_date     = string_date.toString().trim();

					// Update omnibus.vehicle_status variables
					omnibus.vehicle_status.obc.date = string_date; 
					console.log('[data-handler] Set omnibus.vehicle_status.obc.date               = \'%s\'', omnibus.vehicle_status.obc.date);
				}
				else if (msg[1] == 0x03) { // Exterior temp
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

					// Update omnibus.vehicle_status variables
					if (string_temp_exterior_unit == 'c') {
						omnibus.vehicle_status.obc.temp_exterior_c = parseFloat(string_temp_exterior_value).toFixed(2);
						omnibus.vehicle_status.obc.temp_exterior_f = parseFloat(((string_temp_exterior_value*9)/5)+32).toFixed(2);
						omnibus.vehicle_status.coding.unit_temp    = 'c';
					}
					else {
						omnibus.vehicle_status.obc.temp_exterior_f = parseFloat(string_temp_exterior_value).toFixed(2);
						omnibus.vehicle_status.obc.temp_exterior_f = parseFloat(((string_temp_exterior_value-32)*(5/9))).toFixed(2);
						omnibus.vehicle_status.coding.unit_temp    = 'f';
					}

					console.log('[data-handler] Set omnibus.vehicle_status.coding.unit_temp       = \'%s\'', omnibus.vehicle_status.coding.unit_temp);
					console.log('[data-handler] Set omnibus.vehicle_status.obc.temp_exterior_c    = %s', omnibus.vehicle_status.obc.temp_exterior_c);
					console.log('[data-handler] Set omnibus.vehicle_status.obc.temp_exterior_f    = %s', omnibus.vehicle_status.obc.temp_exterior_f);
				}

				else if (msg[1] == 0x04) { // Consumption 1
					// Parse unit
					var string_consumption_1_unit = new Buffer([msg[8]]);
					string_consumption_1_unit     = string_consumption_1_unit.toString().trim().toLowerCase();

					// Parse value
					var string_consumption_1 = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_consumption_1     = parseFloat(string_consumption_1.toString().trim().toLowerCase());

					// Perform appropriate conversions between units
					if (string_consumption_1_unit == 'm') {
						omnibus.vehicle_status.coding.unit_cons = 'mpg';
						string_consumption_1_mpg        = string_consumption_1;
						string_consumption_1_l100       = 235.21/string_consumption_1;
					}
					else {
						omnibus.vehicle_status.coding.unit_cons = 'l100';
						string_consumption_1_mpg        = 235.21/string_consumption_1;
						string_consumption_1_l100       = string_consumption_1;
					}

					// Update omnibus.vehicle_status variables
					omnibus.vehicle_status.obc.consumption_1_mpg  = string_consumption_1_mpg.toFixed(2); 
					omnibus.vehicle_status.obc.consumption_1_l100 = string_consumption_1_l100.toFixed(2);

					console.log('[data-handler] Set omnibus.vehicle_status.coding.unit_cons       = \'%s\'', omnibus.vehicle_status.coding.unit_cons);
					console.log('[data-handler] Set omnibus.vehicle_status.obc.consumption_1_l100 = %s', omnibus.vehicle_status.obc.consumption_1_l100);
					console.log('[data-handler] Set omnibus.vehicle_status.obc.consumption_1_mpg  = %s', omnibus.vehicle_status.obc.consumption_1_mpg);
				}

				else if (msg[1] == 0x05) { // Consumption 2
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

					// Update omnibus.vehicle_status variables
					omnibus.vehicle_status.obc.consumption_2_mpg  = string_consumption_2_mpg.toFixed(2); 
					omnibus.vehicle_status.obc.consumption_2_l100 = string_consumption_2_l100.toFixed(2);

					console.log('[data-handler] Set omnibus.vehicle_status.obc.consumption_2_l100 = %s', omnibus.vehicle_status.obc.consumption_2_l100);
					console.log('[data-handler] Set omnibus.vehicle_status.obc.consumption_2_mpg  = %s', omnibus.vehicle_status.obc.consumption_2_mpg);
				}

				else if (msg[1] == 0x06) { // Range
					// Parse value
					var string_range = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_range     = string_range.toString().trim();

					var string_range_unit = new Buffer([msg[7], msg[8]]);
					string_range_unit     = string_range_unit.toString().trim().toLowerCase();

					if (string_range_unit == 'ml') {
						omnibus.vehicle_status.coding.unit_distance = 'mi';
						// Update omnibus.vehicle_status variables
						omnibus.vehicle_status.obc.range_mi = parseFloat(string_range).toFixed(2);
						omnibus.vehicle_status.obc.range_km = parseFloat(string_range*1.60934).toFixed(2);
					}
					else if (string_range_unit == 'km') {
						omnibus.vehicle_status.coding.unit_distance = 'km';
						omnibus.vehicle_status.obc.range_mi = parseFloat(string_range*0.621371).toFixed(2);
						omnibus.vehicle_status.obc.range_km = parseFloat(string_range).toFixed(2);
					}

					console.log('[data-handler] Set omnibus.vehicle_status.obc.range_mi           = %s', omnibus.vehicle_status.obc.range_mi);
					console.log('[data-handler] Set omnibus.vehicle_status.obc.range_km           = %s', omnibus.vehicle_status.obc.range_km);
					console.log('[data-handler] Set omnibus.vehicle_status.coding.unit_distance   = \'%s\'', omnibus.vehicle_status.coding.unit_distance);
				}

				else if (msg[1] == 0x07) { // Distance
					// Parse value
					var string_distance = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_distance     = string_distance.toString().trim().toLowerCase();

					// Update omnibus.vehicle_status variables
					omnibus.vehicle_status.obc.distance = string_distance; 
					console.log('[data-handler] Set omnibus.vehicle_status.obc.distance           = %s', omnibus.vehicle_status.obc.distance);
				}

				else if (msg[1] == 0x08) { // --:--
					console.log('[data-handler] --:--: %s', msg);
				}

				else if (msg[1] == 0x09) { // Limit
					// Parse value
					var string_speedlimit = new Buffer([msg[3], msg[4], msg[5]]);
					string_speedlimit     = parseFloat(string_speedlimit.toString().trim().toLowerCase());

					// Update omnibus.vehicle_status variables
					omnibus.vehicle_status.obc.speedlimit = string_speedlimit.toFixed(2); 
					console.log('[data-handler] Set omnibus.vehicle_status.obc.speedlimit         = %s mph', omnibus.vehicle_status.obc.speedlimit);
				}

				else if (msg[1] == 0x0A) { // Avg. speed
					// Parse unit
					var string_speedavg_unit = new Buffer([msg[8]]);
					string_speedavg_unit     = string_speedavg_unit.toString().trim().toLowerCase();

					// Parse value
					var string_speedavg = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_speedavg     = parseFloat(string_speedavg.toString().trim().toLowerCase());

					// Convert values appropriately based on coding data units
					if (string_speedavg_unit == 'k') {
						omnibus.vehicle_status.coding.unit_speed = 'kmh';
						// Update omnibus.vehicle_status variables
						omnibus.vehicle_status.obc.speedavg_kmh = string_speedavg.toFixed(2);
						omnibus.vehicle_status.obc.speedavg_mph = (string_speedavg*0.621371).toFixed(2);
					}
					else if (string_speedavg_unit == 'm') {
						omnibus.vehicle_status.coding.unit_speed = 'mph';
						// Update omnibus.vehicle_status variables
						omnibus.vehicle_status.obc.speedavg_kmh = (string_speedavg*1.60934).toFixed(2);
						omnibus.vehicle_status.obc.speedavg_mph = string_speedavg.toFixed(2);
					}

					console.log('[data-handler] Set omnibus.vehicle_status.coding.unit_speed      = \'%s\'', omnibus.vehicle_status.coding.unit_speed);
					console.log('[data-handler] Set omnibus.vehicle_status.obc.speedavg_kmh       = %s', omnibus.vehicle_status.obc.speedavg_kmh);
					console.log('[data-handler] Set omnibus.vehicle_status.obc.speedavg_mph       = %s', omnibus.vehicle_status.obc.speedavg_mph);
				}

				else if (msg[1] == 0x0E) { // Timer
					// Parse value
					var string_timer = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_timer     = parseFloat(string_timer.toString().trim().toLowerCase()).toFixed(2);

					// Update omnibus.vehicle_status variables
					omnibus.vehicle_status.obc.timer = string_timer; 
					console.log('[data-handler] Set omnibus.vehicle_status.obc.timer              = %s', omnibus.vehicle_status.obc.timer);
				}

				else if (msg[1] == 0x0F) { // Aux heat timer 1
					// Parse value
					var string_aux_heat_timer_1 = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7], msg[8], msg[9]]);
					string_aux_heat_timer_1     = string_aux_heat_timer_1.toString().trim().toLowerCase();

					// Update omnibus.vehicle_status variables
					omnibus.vehicle_status.obc.aux_heat_timer_1 = string_aux_heat_timer_1; 
					console.log('[data-handler] Set omnibus.vehicle_status.obc.aux_heat_timer_1   = \'%s\'', omnibus.vehicle_status.obc.aux_heat_timer_1);
				}

				else if (msg[1] == 0x10) { // Aux heat timer 2
					// Parse value
					var string_aux_heat_timer_2 = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7], msg[8], msg[9]]);
					string_aux_heat_timer_2     = string_aux_heat_timer_2.toString().trim().toLowerCase();

					// Update omnibus.vehicle_status variables
					omnibus.vehicle_status.obc.aux_heat_timer_2 = string_aux_heat_timer_2; 
					console.log('[data-handler] Set omnibus.vehicle_status.obc.aux_heat_timer_2   = \'%s\'', omnibus.vehicle_status.obc.aux_heat_timer_2);
				}

				else if (msg[1] == 0x1A) { // Stopwatch
					// Parse value
					var string_stopwatch = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_stopwatch     = parseFloat(string_stopwatch.toString().trim().toLowerCase()).toFixed(2);

					// Update omnibus.vehicle_status variables
					omnibus.vehicle_status.obc.stopwatch = string_stopwatch; 
					console.log('[data-handler] Set omnibus.vehicle_status.obc.stopwatch          = %s', omnibus.vehicle_status.obc.stopwatch);
				}
			}
			else if (msg[0] == 0x57) {
				var command = 'BC button';
			}
		}

		// MFL
		else if (src == 'MFL') {
			if (msg[0] == 0x3B) {
				var command = 'button';

				if (msg[1] == 0x80) {
					var data = 'send/end depressed';
				}

				else if (msg[1] == 0xA0) { var data = 'send/end released';   }
				else if (msg[1] == 0x90) { var data = 'send/end long press'; }
				else if (msg[1] == 0x01) { var data = 'right pressed';       }
				else if (msg[1] == 0x08) { var data = 'left pressed';        }
				else if (msg[1] == 0x21) { var data = 'right released';      }
				else if (msg[1] == 0x28) { var data = 'left released';       }
				else if (msg[1] == 0x18) { var data = 'left long press';     }
				else if (msg[1] == 0x11) { var data = 'right long press';    }
				else                     { var data = msg[1];                }
			}
			else if (msg[0] == 0x01) {
				var command = 'button';

				var data = 'r/t pressed';
			}
			else {
				var command = 'unknown';
				var data    = 'unknown';
			}
		}

		// console.log(src, dst, command, msg);
	}
}

module.exports = data_handler;
