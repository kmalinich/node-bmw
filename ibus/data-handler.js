#!/usr/bin/env node

var data_handler = function(ibus_connection, bus_modules, vehicle_status, IKE_connection, LCM_connection) {

	// Self reference
	var _self = this;

	// Exposed data
	this.check_data = check_data;

	// Events
	ibus_connection.on('data', check_data)

	function check_data(data) {
		var dst = bus_modules.get_module_name(data.dst);
		var src = bus_modules.get_module_name(data.src);
		var msg = data.msg;

		// GM
		if (src == 'GM') {
			if (msg[0] == 0x72) {
				var command = 'key fob button';

				if      (msg[1] == 0x12) {
					var data = 'lock depressed';
				}

				else if (msg[1] == 0x22) {
					var data = 'unlock depressed';
					
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
					LCM_connection.lcm_bitmask_encode(lcm_object);
				}

				else if (msg[1] == 0x42) {
					var data = 'trunk depressed';
					
					// WELCOME LIGHTS!
					var lcm_object = {};

					console.log('[data-handler] Deactivating welcome lights');
					LCM_connection.lcm_bitmask_encode(lcm_object);
				}
			}

			console.log(src, dst, command, data, msg);
		}

		// IKE
		else if (src == 'IKE') {
			if (msg[0] == 0x11) {
				var command = 'ignition';

				if      (msg[1] == 0x00) { vehicle_status.vehicle.ignition = 'off';       }
				else if (msg[1] == 0x01) { vehicle_status.vehicle.ignition = 'accessory'; }
				else if (msg[1] == 0x03) { vehicle_status.vehicle.ignition = 'on';        }
				else if (msg[1] == 0x07) { vehicle_status.vehicle.ignition = 'starting';  }
				else                     { vehicle_status.vehicle.ignition = 'unknown';   }
			}
			else if (msg[0] == 0x13) {
				var command = 'sensors';

				if (msg[1] == 0x01) { vehicle_status.vehicle.handbrake = 'on';      } else { vehicle_status.vehicle.handbrake = 'off'; }
				if (msg[2] == 0x03) { vehicle_status.engine.status     = 'running'; } else { vehicle_status.engine.status     = 'off'; }
			}
			else if (msg[0] == 0x17) {
				var command = 'odometer';
			}
			else if (msg[0] == 0x19) {
				var command    = 'temperatures';

				// Update external and engine coolant temp variables
				vehicle_status.temperature.exterior_c = msg[1];
				vehicle_status.temperature.coolant_c  = msg[2];

				vehicle_status.temperature.exterior_f = ((msg[1]*9)/5)+32;
				vehicle_status.temperature.coolant_f  = ((msg[2]*9)/5)+32;
			}
			else if (msg[0] == 0x18) {
				var command = 'speed/RPM';

				// Update vehicle and engine speed variables
				vehicle_status.vehicle.speed_kmh = msg[1]*2;
				vehicle_status.engine.speed      = msg[2]*100;

				vehicle_status.vehicle.speed_mph_full = (msg[1]*2)*0.621371192237334;
				vehicle_status.vehicle.speed_mph      = (msg[1]*2)*0.62;
			}
			else if (msg[0] == 0x24) {
				var command    = 'OBC text';
				
				if (msg[1] == 0x01) { // Time
					// Parse out value
					var string_time = new Buffer([msg[3], msg[4], msg[5], msg[6], msg[7]]);
					string_time = string_time.toString();

					// Update vehicle_status variables
					vehicle_status.obc.time = string_time; 
					console.log('[data-handler] Updating time with value "%s"', vehicle_status.obc.time);
				}
				else if (msg[1] == 0x02) { // Date
				}
				else if (msg[1] == 0x03) { // External temp
				}
				else if (msg[1] == 0x04) { // Consumption 1
					// Parse out value
					var string_cons1 = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_cons1 = string_cons1.toString();

					// Update vehicle_status variables
					vehicle_status.obc.consumption_1 = string_cons1; 
					console.log('[data-handler] Updating consumption_1 with value "%s"', vehicle_status.obc.consumption_1);
				}
				else if (msg[1] == 0x05) { // Consumption 2
					// Parse out value
					var string_cons2 = new Buffer([msg[3], msg[4], msg[5], msg[6]]);
					string_cons2 = string_cons2.toString();

					// Update vehicle_status variables
					vehicle_status.obc.consumption_2 = string_cons2; 
					console.log('[data-handler] Updating consumption_2 with value "%s"', vehicle_status.obc.consumption_2);
				}
				else if (msg[1] == 0x06) { // Range
				}
				else if (msg[1] == 0x07) { // Distance
				}
				else if (msg[1] == 0x08) { // --:--
				}
				else if (msg[1] == 0x09) { // Limit
				}
				else if (msg[1] == 0x0A) { // Avg. speed
				}
				else if (msg[1] == 0x0E) { // Timer
				}
				else if (msg[1] == 0x0F) { // Aux heating timer 1
				}
				else if (msg[1] == 0x10) { // Aux heating timer 2
				}
				else if (msg[1] == 0x1A) { // Stopwatch
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
