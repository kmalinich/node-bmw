#!/usr/bin/env node

var data_handler = function() {
	var data          = null;
	var timer_id      = null;
	var sockets       = [];
	var data_handler  = null;

	// Data handler
	ibus_data = function(data) {
		var dst = bus_modules.get_module_name(data.dst);
		var src = bus_modules.get_module_name(data.src);
		var msg = data.msg;

		// IKE
		if (src == 'IKE') {
			if (msg[0] == 0x17) {
				var command = 'odometer';
				var data    = 'not sure yet.'
			}
			else if (msg[0] == 0x57) {
				var command = 'BC button';
				var data    = 'depressed';
			}
			else if (msg[0] == 0x18) {
				var command = 'speed/RPM';

				// Update vehicle and engine speed variables
				engine_speed_rpm  = msg[2]*100;
				vehicle_speed_kmh = msg[1];

				var data          = vehicle_speed_kmh+' km/h, '+engine_speed_rpm+' RPM';
			}
			else if (msg[0] == 0x24) {
				var command    = 'obc text';
				var data       = ' '+msg+' ';
			}
			else if (msg[0] == 0x19) {
				var command    = 'temperature';

				// Update external and engine coolant temp variables
				ext_temp_c     = msg[1];
				coolant_temp_c = msg[2];

				var data       = ext_temp_c+'C outside, '+coolant_temp_c+'C coolant';
			}
			else if (msg[0] == 0x11) {
				var command = 'ignition';
				if (msg[1] == 0x00) {
					ignition = 'off';
				}
				else if (msg[1] == 0x01) {
					ignition = 'accessory';
				}
				else if (msg[1] == 0x03) {
					ignition = 'on';
				}
				else if (msg[1] == 0x07) {
					ignition = 'starting';
				}
				else {
					ignition = 'unknown';
				}

				var data    = 'ignition: '+ignition;
			}
			else if (msg[0] == 0x13) {
				var command = 'sensors';

				if (msg[1] == 0x01) { handbrake = 'on'; } else { handbrake = 'off'; }
				if (msg[1] == 0x02) { engine    = 'on'; } else { engine    = 'off'; }

				var data    = 'handbrake: '+handbrake+', engine: '+engine;
			}
			else {
				var command = msg[0];
				var data    = msg[1];
			}
		}

		console.log(src, dst, command, data)
	};

	return {
		ibus_data : ibus_data
	};

}();

module.exports = data_handler;
