#!/usr/bin/env node

// npm libraries
var convert = require('node-unit-conversion');
var moment  = require('moment');
var os      = require('os');

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
	if ((num & bit) != 0) { return true; } else { return false; }
}

var IKE = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.hud_refresh      = hud_refresh;
	this.ike_data         = ike_data;
	this.ike_send         = ike_send;
	this.ike_text         = ike_text;
	this.ike_text_urgent  = ike_text_urgent;
	this.ike_text_warning = ike_text_warning;
	this.obc_data         = obc_data;
	this.obc_refresh      = obc_refresh;
	this.parse_out        = parse_out;
	this.request          = request;

	// Pad string for IKE text screen length (20 characters)
	String.prototype.ike_pad = function() {
		var string = this;

		while (string.length < 20) {
			string = string + ' ';
		}

		return string;
	}

	// Refresh OBC HUD once every 3 seconds, if ignition is in 'run' or 'accessory'
	setInterval(() => {
		if (omnibus.status.vehicle.ignition == 'run' || omnibus.status.vehicle.ignition == 'accessory') { hud_refresh(); }
	}, 5000);

	// Parse data sent from IKE module
	function parse_out(data) {
		// Init variables
		var src      = data.src.id;
		var dst      = data.dst;
		var message  = data.msg;

		var command;
		var value;

		switch (message[0]) {

			case 0x02: // device status
				switch (message[1]) {
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

			case 0x11: // ignition status
				command = 'ignition status';

				// If key is now in 'off' or 'accessory' and ignition status was previously 'run'
				if ((message[1] == 0x00 || message[1] == 0x01) && omnibus.status.vehicle.ignition == 'run') {
					console.log('[ node-bmw] Trigger: power-off state');

					// If the doors are locked
					if (omnibus.status.vehicle.locked == true) {
						// Send message to GM to toggle door locks
						omnibus.GM.gm_cl();
					}
				}

				// If key is now in 'off' and ignition status was previously 'accessory' or 'run'
				if (message[1] == 0x00 && (omnibus.status.vehicle.ignition == 'accessory' || omnibus.status.vehicle.ignition == 'run')) {
					console.log('[ node-bmw] Trigger: power-down state');

					// Stop media playback
					omnibus.kodi.stop_all();

					// Set audio modules as not ready
					omnibus.status.audio.dsp_ready = false;
					omnibus.status.audio.rad_ready = false;

					// Turn off HDMI display after 3 seconds
					setTimeout(() => {
						omnibus.HDMI.command('poweroff');
					}, 3000);
				}

				// If key is now in 'accessory' or 'run' and ignition status was previously 'off'
				if ((message[1] == 0x01 || message[1] == 0x03) && omnibus.status.vehicle.ignition == 'off') {
					console.log('[ node-bmw] Trigger: power-on state');

					// Welcome message
					ike_text_warning('node-bmw     '+os.hostname(), 3000);
				}

				// If key is now in 'run' and ignition status was previously 'off' or 'accessory'
				if (message[1] == 0x03 && (omnibus.status.vehicle.ignition == 'off' || omnibus.status.vehicle.ignition == 'accessory')) {
					console.log('[ node-bmw] Trigger: run state');
				}

				switch (message[1]) { // Ignition status value
					case 0x00 : omnibus.status.vehicle.ignition = 'off';       break;
					case 0x01 : omnibus.status.vehicle.ignition = 'accessory'; break;
					case 0x03 : omnibus.status.vehicle.ignition = 'run';       break;
					case 0x07 : omnibus.status.vehicle.ignition = 'start';     break;
					default   : omnibus.status.vehicle.ignition = 'unknown';   break;
				}

				omnibus.LCM.auto_lights_process();
				value = omnibus.status.vehicle.ignition;
				break;

			case 0x13: // IKE sensor status
				command = 'broadcast';
				value   = 'IKE sensor status';

				// This is a bitmask
				// message[1]:
				// 0x01 = handbrake on
				if (bit_test(message[1], bit_0)) {
					// If handbrake is newly true
					if (omnibus.status.vehicle.handbrake === false) {
						omnibus.status.vehicle.handbrake = true;
						// omnibus.LCM.auto_lights_process();
					}
				}
				else {
					// If handbrake is newly false
					if (omnibus.status.vehicle.handbrake === true) {
						omnibus.status.vehicle.handbrake = false;
						// omnibus.LCM.auto_lights_process();
					}
				}

				// message[2]:
				//   1 = Engine running
				// 176 = P (4+5+7)
				//  16 = R (4)
				// 112 = N (4+5+6)
				// 128 = D (7)
				// 192 = 4 (6+7)
				// 208 = 3 (4+6+7)
				//  64 = 2 (6)
				if (bit_test(message[2], bit_0)) {
					// If it's newly running
					if (omnibus.status.engine.running === false) {
						omnibus.HDMI.command('poweron');
						omnibus.status.engine.running = true;
					}
				}
				else {
					// If it's newly NOT running
					if (omnibus.status.engine.running === true) {
						omnibus.status.engine.running = false;
					}
				}

				if (bit_test(message[2], bit_4) && !bit_test(message[2], bit_5) && !bit_test(message[2], bit_6) && !bit_test(message[2], bit_7)) {
					// If it's newly in reverse
					if (omnibus.status.vehicle.reverse == false) {
						ike_text_warning(' YOU\'RE IN REVERSE!', 2000);
					}
					omnibus.status.vehicle.reverse = true;
				}
				else {
					omnibus.status.vehicle.reverse = false;
				}
				break;

			case 0x15: // country coding data
				command = 'broadcast';
				value   = 'country coding data';
				break;

			case 0x17: // Odometer
				command                            = 'odometer';
				var odometer_value1                = message[3] << 16;
				var odometer_value2                = message[2] << 8;
				var odometer_value                 = odometer_value1 + odometer_value2 + message[1];
				value                              = odometer_value;
				omnibus.status.vehicle.odometer.km = odometer_value;
				omnibus.status.vehicle.odometer.mi = Math.round(convert(odometer_value).from('kilometre').to('us mile'));
				break;

			case 0x18: // Vehicle speed and RPM
				command = 'broadcast';
				value   = 'current speed and RPM';

				// Update vehicle and engine speed variables
				omnibus.status.vehicle.speed.kmh = parseFloat(message[1]*2);
				omnibus.status.engine.speed      = parseFloat(message[2]*100);

				// Convert values and round to 2 decimals
				omnibus.status.vehicle.speed.mph = convert(parseFloat((message[1]*2))).from('kilometre').to('us mile').toFixed(2);
				break;

			case 0x19: // Coolant temp and external temp
				command = 'broadcast';
				value   = 'temperature values';

				// Update external and engine coolant temp variables
				omnibus.status.temperature.exterior.c = parseFloat(message[1]);
				omnibus.status.temperature.coolant.c  = parseFloat(message[2]);

				omnibus.status.temperature.exterior.f = Math.round(convert(parseFloat(message[1])).from('celsius').to('fahrenheit'));
				omnibus.status.temperature.coolant.f  = Math.round(convert(parseFloat(message[2])).from('celsius').to('fahrenheit'));

				// Send Kodi a notification
				// omnibus.kodi.notify('Temperature', 'Coolant: '+omnibus.status.temperature.coolant.c+' C, Exterior: '+omnibus.status.temperature.exterior.c+' C');
				break;

			case 0x1B: // ACK text message
				command = 'acknowledged';
				value   = 'temperature value';

				value = parseFloat(message[1]);

				value = value+' text messages';
				break;

			case 0x24: // OBC values broadcast
				switch (message[1]) {
					case 0x01: // Time
						command = 'OBC time';

						// Parse unit
						string_time_unit = new Buffer([message[8], message[9]]);
						string_time_unit = string_time_unit.toString().trim().toLowerCase();

						// Detect 12h or 24h time and parse value
						if (string_time_unit == 'am' || string_time_unit == 'pm') {
							omnibus.status.coding.unit.time = '12h';
							string_time = new Buffer([message[3], message[4], message[5], message[6], message[7], message[8], message[9]]);
						}
						else {
							omnibus.status.coding.unit.time = '24h';
							string_time = new Buffer([message[3], message[4], message[5], message[6], message[7]]);
						}

						string_time = string_time.toString().trim().toLowerCase();

						// Update omnibus.status variables
						omnibus.status.obc.time = string_time;
						value                   = omnibus.status.obc.time;
						break;

					case 0x02: // Date
						command = 'OBC date';

						// Parse value
						string_date = new Buffer([message[3], message[4], message[5], message[6], message[7], message[8], message[9], message[10], message[11], message[12]]);
						string_date = string_date.toString().trim();

						// Update omnibus.status variables
						omnibus.status.obc.date = string_date;
						value                   = omnibus.status.obc.date;
						break;

					case 0x03: // Exterior temp
						command = 'OBC exterior temperature';

						// Parse unit
						string_temp_exterior_unit = new Buffer([message[9]]);
						string_temp_exterior_unit = string_temp_exterior_unit.toString().trim().toLowerCase();

						// Parse if it is +/-
						string_temp_exterior_negative = new Buffer([message[9]]);
						string_temp_exterior_negative = string_temp_exterior_negative.toString().trim().toLowerCase();

						// Parse value
						if (string_temp_exterior_negative == '-') {
							string_temp_exterior_value = new Buffer(message[3], [message[4], message[5], message[6], message[7]]);
							string_temp_exterior_value = string_temp_exterior_value.toString().trim().toLowerCase();
						}

						else {
							string_temp_exterior_value = new Buffer([message[4], message[5], message[6], message[7]]);
							string_temp_exterior_value = string_temp_exterior_value.toString().trim().toLowerCase();
						}

						// Update omnibus.status variables
						switch (string_temp_exterior_unit) {
							case 'c':
								omnibus.status.coding.unit.temp = 'c';
								omnibus.status.temperature.exterior.obc.c = parseFloat(string_temp_exterior_value);
								omnibus.status.temperature.exterior.obc.f = convert(parseFloat(string_temp_exterior_value)).from('celsius').to('fahrenheit');
								break;
							case 'f':
								omnibus.status.coding.unit.temp = 'f';
								omnibus.status.temperature.exterior.obc.c = convert(parseFloat(string_temp_exterior_value)).from('fahrenheit').to('celsius');
								omnibus.status.temperature.exterior.obc.f = parseFloat(string_temp_exterior_value);
								break;
						}

						value = omnibus.status.temperature.exterior.obc.c;
						break;

					case 0x04: // Consumption 1
						command = 'OBC consumption 1';

						// Parse unit
						string_consumption_1_unit = new Buffer([message[8]]);
						string_consumption_1_unit = string_consumption_1_unit.toString().trim().toLowerCase();

						// Parse value
						string_consumption_1 = new Buffer([message[3], message[4], message[5], message[6]]);
						string_consumption_1 = parseFloat(string_consumption_1.toString().trim().toLowerCase());

						// Perform appropriate conversions between units
						switch (string_consumption_1_unit) {
							case 'm':
								omnibus.status.coding.unit.cons = 'mpg';
								string_consumption_1_mpg        = string_consumption_1;
								string_consumption_1_l100       = 235.21/string_consumption_1;
								break;

							default:
								omnibus.status.coding.unit.cons = 'l100';
								string_consumption_1_mpg        = 235.21/string_consumption_1;
								string_consumption_1_l100       = string_consumption_1;
								break;
						}

						// Update omnibus.status variables
						omnibus.status.obc.consumption_1_mpg  = string_consumption_1_mpg.toFixed(2);
						omnibus.status.obc.consumption_1_l100 = string_consumption_1_l100.toFixed(2);

						value = omnibus.status.obc.consumption_1_mpg;
						break;

					case 0x05: // Consumption 2
						command = 'OBC consumption 2';

						// Parse unit
						string_consumption_2_unit = new Buffer([message[8]]);
						string_consumption_2_unit = string_consumption_2_unit.toString().trim().toLowerCase();

						// Parse value
						string_consumption_2 = new Buffer([message[3], message[4], message[5], message[6]]);
						string_consumption_2 = parseFloat(string_consumption_2.toString().trim().toLowerCase());

						// Perform appropriate conversions between units and round to 2 decimals
						if (string_consumption_2_unit == 'm') {
							string_consumption_2_mpg  = string_consumption_2;
							string_consumption_2_l100 = 235.215/string_consumption_2;
						}
						else {
							string_consumption_2_mpg  = 235.215/string_consumption_2;
							string_consumption_2_l100 = string_consumption_2;
						}

						// Update omnibus.status variables
						omnibus.status.obc.consumption_2_mpg  = string_consumption_2_mpg.toFixed(2);
						omnibus.status.obc.consumption_2_l100 = string_consumption_2_l100.toFixed(2);

						value = omnibus.status.obc.consumption_2_mpg;
						break;

					case 0x06: // Range
						command = 'OBC range to empty';

						// Parse value
						string_range = new Buffer([message[3], message[4], message[5], message[6]]);
						string_range = string_range.toString().trim();

						string_range_unit = new Buffer([message[7], message[8]]);
						string_range_unit = string_range_unit.toString().trim().toLowerCase();

						// Update omnibus.status variables
						switch (string_range_unit) {
							case 'ml':
								omnibus.status.coding.unit.distance = 'mi';
								omnibus.status.obc.range_mi = parseFloat(string_range);
								omnibus.status.obc.range_km = parseFloat(convert(parseFloat(string_range)).from('kilometre').to('us mile').toFixed(2));
								break;

							case 'km':
								omnibus.status.coding.unit.distance = 'km';
								omnibus.status.obc.range_mi = parseFloat(convert(parseFloat(string_range)).from('us mile').to('kilometre').toFixed(2));
								omnibus.status.obc.range_km = parseFloat(string_range);
								break;
						}

						value = omnibus.status.obc.range_mi;
						break;

					case 0x07: // Distance
						command = 'OBC distance remaining';

						// Parse value
						string_distance = new Buffer([message[3], message[4], message[5], message[6]]);
						string_distance = string_distance.toString().trim().toLowerCase();

						// Update omnibus.status variables
						omnibus.status.obc.distance = string_distance;
						value                       = omnibus.status.obc.distance;
						break;

					case 0x08: // Arrival time
						command = 'OBC arrival time';
						// Parse value
						string_arrival = new Buffer([message[3], message[4], message[5], message[6], message[7], message[8], message[9]]);
						string_arrival = string_arrival.toString().trim().toLowerCase();

						// Update omnibus.status variables
						omnibus.status.obc.arrival = string_arrival;
						value                      = omnibus.status.obc.arrival;
						break;

					case 0x09: // Limit
						command = 'OBC speed limit';

						// Parse value
						string_speedlimit = new Buffer([message[3], message[4], message[5]]);
						string_speedlimit = parseFloat(string_speedlimit.toString().trim().toLowerCase());

						// Update omnibus.status variables
						omnibus.status.obc.speedlimit = string_speedlimit.toFixed(2);
						value                         = omnibus.status.obc.speedlimit;
						break;

					case 0x0A: // average speed
						command = 'OBC average speed';

						// Parse unit
						string_speedavg_unit = new Buffer([message[8]]);
						string_speedavg_unit = string_speedavg_unit.toString().trim().toLowerCase();

						// Parse value
						string_speedavg = new Buffer([message[3], message[4], message[5], message[6]]);
						string_speedavg = parseFloat(string_speedavg.toString().trim().toLowerCase());

						// Convert values appropriately based on coding valueunits
						switch(string_speedavg_unit) {
							case 'k':
								omnibus.status.coding.unit.speed = 'kmh';
								// Update omnibus.status variables
								omnibus.status.obc.speedavg_kmh = string_speedavg.toFixed(2);
								omnibus.status.obc.speedavg_mph = convert(string_speedavg).from('kilometre').to('us mile').toFixed(2);
								break;

							case 'm':
								omnibus.status.coding.unit.speed = 'mph';
								// Update omnibus.status variables
								omnibus.status.obc.speedavg_kmh = convert(string_speedavg).from('us mile').to('kilometre').toFixed(2);
								omnibus.status.obc.speedavg_mph = string_speedavg.toFixed(2);
								break;
						}

						value = omnibus.status.obc.speedavg_mph;
						break;

					case 0x0B: //
						command = 'OBC 0x0B';
						value   = new Buffer(message);
						break;

					case 0x0C: //
						command = 'OBC 0x0C';
						value   = new Buffer(message);
						break;

					case 0x0D: //
						command = 'OBC code';
						// Parse value
						string_code = new Buffer([message[3], message[4], message[5], message[6]]);
						string_code = string_code.toString().trim().toLowerCase();

						// Update omnibus.status variable
						omnibus.status.obc.code = string_code;
						value                   = omnibus.status.obc.code;
						break;

					case 0x0E: // Timer
						command = 'OBC timer';

						// Parse value
						string_timer = new Buffer([message[3], message[4], message[5], message[6]]);
						string_timer = parseFloat(string_timer.toString().trim().toLowerCase()).toFixed(2);

						// Update omnibus.status variables
						omnibus.status.obc.timer = string_timer;
						value                    = omnibus.status.obc.timer;
						break;

					case 0x0F: // Aux heat timer 1
						command = 'OBC aux heat timer 1';

						// Parse value
						string_aux_heat_timer_1 = new Buffer([message[3], message[4], message[5], message[6], message[7], message[8], message[9]]);
						string_aux_heat_timer_1 = string_aux_heat_timer_1.toString().trim().toLowerCase();

						// Update omnibus.status variables
						omnibus.status.obc.aux_heat_timer_1 = string_aux_heat_timer_1;
						value                               = omnibus.status.obc.aux_heat_timer_1;
						break;

					case 0x10: // Aux heat timer 2
						command = 'OBC aux heat timer 2';

						// Parse value
						string_aux_heat_timer_2 = new Buffer([message[3], message[4], message[5], message[6], message[7], message[8], message[9]]);
						string_aux_heat_timer_2 = string_aux_heat_timer_2.toString().trim().toLowerCase();

						// Update omnibus.status variables
						omnibus.status.obc.aux_heat_timer_2 = string_aux_heat_timer_2;
						value                               = omnibus.status.obc.aux_heat_timer_2;
						break;

					case 0x1A: // Stopwatch
						command = 'OBC stopwatch';

						// Parse value
						string_stopwatch = new Buffer([message[3], message[4], message[5], message[6]]);
						string_stopwatch = parseFloat(string_stopwatch.toString().trim().toLowerCase()).toFixed(2);

						// Update omnibus.status variables
						omnibus.status.obc.stopwatch = string_stopwatch;
						value                        = omnibus.status.obc.stopwatch;
						break;

					default:
						command = 'OBC unknown value';
						value   = new Buffer(message);
						break;
				}
				break;

			case 0x2A: // aux heating LED
				command = 'aux heating LED';
				// This actually is a bitmask but.. this is also a freetime project
				switch(message[2]) {
					case 0x00:
						value = 'off';
						break;
					case 0x04:
						value = 'on';
						break;
					case 0x08:
						value = 'blink';
						break;
					default:
						value = new Buffer(message);
						break;
				}

				omnibus.status.obc.aux_heat_led = value;
				break;

			case 0x50: // Request check-control sensor information
				command = 'request';
				value   = 'check control sensor status';
				break;

			case 0x57: // BC button in cluster
				command = 'button';
				value   = 'BC';
				break;

			default:
				command = 'unknown';
				value   = new Buffer(message);
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

	// Handle incoming commands from API
	function ike_data(data) {
		// Display text string in cluster
		if (typeof data['obc-text'] !== 'undefined') {
			ike_text(data['obc-text']);
		}

		// Set OBC clock
		else if (data.command == 'obc_clock') {
			obc_clock(data);
		}

		else if (typeof data['obc-gong'] !== 'undefined') {
			obc_gong(data['obc-gong']);
		}

		// Set cluster LCD backlight
		else if (typeof data['ike-backlight'] !== 'undefined') {
			ike_backlight(data['ike-backlight']);
		}

		// Send fake ignition status
		else if (typeof data['ike-ignition'] !== 'undefined') {
			ike_ignition(data['ike-ignition']);
		}

		// Refresh OBC data value
		else if (typeof data['obc-get'] !== 'undefined') {
			if (data['obc-get'] == 'all') {
				obc_refresh();
			}
			else {
				obc_data('get', data['obc-get']);
			}
		}

		// Reset OBC data value
		else if (typeof data['obc-reset'] !== 'undefined') {
			obc_data('reset', data['obc-reset']);
		}

		else {
			console.log('[ node-bmw] ike_data(): Unknown command');
		}

	}

	// ASCII to hex for cluster message
	function ascii2hex(str) {
		var array = [];

		for (var n = 0, l = str.length; n < l; n ++) {
			var hex = str.charCodeAt(n);
			array.push(hex);
		}

		return array;
	}

	// Refresh custom HUD
	function hud_refresh() {
		var spacing1;
		var spacing2;
		var string_cons;
		var string_temp;
		var string_time = moment().format('HH:mm');

		// console.log('[ node-bmw] Refreshing OBC HUD');

		// Populate values if missing
		if (omnibus.status.obc.consumption_1_mpg === null) {
			obc_data('get', 'cons1');
			string_cons = '     ';
		}
		else {
			string_cons = parseFloat(omnibus.status.obc.consumption_1_mpg).toFixed(1)+'m';
		}

		if (omnibus.status.temperature.coolant.c === null) {
			request('temperature');
			string_temp = '  ';
		}
		else {
			string_temp = Math.round(omnibus.status.temperature.coolant.c)+'¨';
		}

		// Only display data if we have data
		if (omnibus.status.obc.consumption_1_mpg != 0 && omnibus.status.temperature.coolant.c != 0) {
		}

		switch (string_temp.length) {
			case 4:
				spacing1 = '   ';
				spacing2 = '   ';
				break;
			case 3:
				spacing1 = '    ';
				spacing2 = '   ';
				break;
			case 2:
				spacing1 = '    ';
				spacing2 = '    ';
				break;
			default:
				spacing1 = ' ';
				spacing2 = ' ';
				break;
		}

		// Add space to left-most string (consumption 1)
		if (string_cons.length == 4) {
			string_cons = '0'+string_cons;
		}

		ike_text(string_cons+spacing1+string_temp+spacing2+string_time);
	}

	// Refresh OBC data
	function obc_refresh() {
		console.log('[ node-bmw] Refreshing all OBC data');

		// LCM data
		omnibus.LCM.request('vehicledata');
		omnibus.LCM.request('lampstatus');
		omnibus.LCM.request('dimmer');
		omnibus.LCM.request('lcm-io');

		// Immo+GM data
		omnibus.EWS.request('immobiliserstatus');
		omnibus.GM.gm_get();

		// IKE data
		request('statusall'  );
		request('coding'     );
		request('ignition'   );
		request('odometer'   );
		request('sensor'     );
		request('temperature');
		request('vin'        );

		// OBC data
		obc_data('get', 'arrival'      );
		obc_data('get', 'auxheat1'     );
		obc_data('get', 'auxheat2'     );
		obc_data('get', 'auxheatvent'  );
		obc_data('get', 'code'         );
		obc_data('get', 'cons1'        );
		obc_data('get', 'cons2'        );
		obc_data('get', 'date'         );
		obc_data('get', 'distance'     );
		obc_data('get', 'range'        );
		obc_data('get', 'speedavg'     );
		obc_data('get', 'speedlimit'   );
		obc_data('get', 'stopwatch'    );
		obc_data('get', 'temp_exterior');
		obc_data('get', 'time'         );
		obc_data('get', 'timer'        );
	}

	// OBC data request
	function obc_data(action, value, target) {
		var src = 0x3B; // GT
		var dst = 0x80; // IKE
		var cmd = 0x41; // OBC data request

		// Init action_id, value_id
		var action_id;
		var value_id;

		// Determine action_id from action argument
		switch (action) {
			case 'get'        : action_id = 0x01; break; // Request current value
			case 'get-status' : action_id = 0x02; break; // Request current status
			case 'limit-off'  : action_id = 0x08; break;
			case 'limit-on'   : action_id = 0x04; break;
			case 'limit-set'  : action_id = 0x20; break;
			case 'reset'      : action_id = 0x10; break;
			case 'set' :
				cmd       = 0x40; // OBC data set (speed limit/distance)
				action_id = 0x00;
				break;
		}

		// Determine value_id from value argument
		switch (value) {
			case 'arrival'       : value_id = 0x08; break;
			case 'auxheat1'      : value_id = 0x0F; break;
			case 'auxheat2'      : value_id = 0x10; break;
			case 'auxheatvent'   : value_id = 0x1B; break;
			case 'code'          : value_id = 0x0D; break;
			case 'cons1'         : value_id = 0x04; break;
			case 'cons2'         : value_id = 0x05; break;
			case 'date'          : value_id = 0x02; break;
			case 'distance'      : value_id = 0x07; break;
			case 'range'         : value_id = 0x06; break;
			case 'speedavg'      : value_id = 0x0A; break;
			case 'speedlimit'    : value_id = 0x09; break;
			case 'stopwatch'     : value_id = 0x1A; break;
			case 'temp_exterior' : value_id = 0x03; break;
			case 'time'          : value_id = 0x01; break;
			case 'timer'         : value_id = 0x0E; break;
		}

		// Assemble message string
		var msg = [cmd, value_id, action_id];

		// If we're setting, insert the data
		if (typeof target !== 'undefined' && target) {
			msg = [msg, target];
		}

		// console.log('[ node-bmw] Doing \'%s\' on OBC value \'%s\'', action, value);

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// Cluster/interior backlight
	function ike_backlight(value) {
		var src = 0xD0; // LCM
		var dst = 0xBF; // GLO
		var cmd = 0x5C; // Set LCD screen backlight

		console.log('[ node-bmw] Setting LCD screen backlight to %s', value);

		// Convert the value to hex
		value = value.toString(16);

		// Will need to concat and push array for value
		var msg = [cmd, value, 0x00];

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// Request various things from IKE
	function request(value) {
		var src = 0xED; // VID
		var dst = 0x80; // IKE
		var cmd;

		console.log('[ node-bmw] Requesting \'%s\'', value);

		switch (value) {
			case 'ignition':
				cmd = 0x10;
				break;
			case 'sensor':
				cmd = 0x12;
				break;
			case 'coding':
				src = 0x68; // RAD
				cmd = 0x14;
				break;
			case 'odometer':
				src = 0x44; // EWS
				cmd = 0x16;
				break;
			case 'dimmer':
				src = 0x5B; // IHKA
				cmd = [0x1D, 0xC5];
				break;
			case 'temperature':
				src = 0x5B; // IHKA
				cmd = [0x1D, 0xC5];
				break;
			case 'statusall':
				src = 0x80; // IKE
				dst = 0xBF; // GLO
				cmd = 0x01;
				break;
			case 'vin':
				src = 0x80; // IKE
				dst = 0xD0; // LCM
				cmd = 0x53;
				break;
		}

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer([cmd]),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// Pretend to be IKE saying the car is on
	function ike_ignition(value) {
		var src = 0x80; // IKE
		var dst = 0xBF; // GLO
		var cmd = 0x11; // Ignition status

		// Init status variable
		var status;

		console.log('[ node-bmw] Claiming ignition is \'%s\'', value);

		switch (value) {
			case 'off':
				status = 0x00;
				break;
			case 'pos1':
				status = 0x01;
				break;
			case 'pos2':
				status = 0x03;
				break;
			case 'pos3':
				status = 0x07;
				break;
		}

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer([cmd, status]),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// OBC set clock
	function obc_clock(data) {
		var src = 0x3B; // GT
		var dst = 0x80; // IKE

		console.log('[ node-bmw] Setting OBC clock to \'%s/%s/%s %s:%s\'', data.day, data.month, data.year, data.hour, data.minute);

		var time_msg         = [0x40, 0x01, data.hour, data.minute];
		var time_ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(time_msg),
		}

		omnibus.ibus_connection.send_message(time_ibus_packet);

		var date_msg         = [0x40, 0x02, data.day, data.month, data.year];
		var date_ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(date_msg),
		}

		omnibus.ibus_connection.send_message(date_ibus_packet);
	}

	// OBC gong
	// Doesn't work right now
	function obc_gong(value) {
		var src = 0x68; // RAD
		var dst = 0x80; // IKE

		// Determine desired value to gong
		if (value == '1') {
			var msg       = [0x23, 0x62, 0x30, 0x37, 0x08];
			var obc_value = '1';
		}

		else if (value == '2') {
			var msg       = [0x23, 0x62, 0x30, 0x37, 0x10];
			var obc_value = '2';
		}

		console.log('[ node-bmw] OBC gong %s', obc_value);

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// Check control warnings
	function ike_text_warning(message, timeout) {
		var src = 0x30; // CCM
		var dst = 0x80; // IKE

		// var message_hex = [0x1A, 0x37, 0x00]; // no gong, no arrows
		// var message_hex = [0x1A, 0x37, 0x01]; // no gong, solid arrows
		// var message_hex = [0x1A, 0x37, 0x02]; // no gong, no arrows
		// var message_hex = [0x1A, 0x37, 0x03]; // no gong, flash arrows
		// var message_hex = [0x1A, 0x37, 0x04]; // 1 hi gong,  no arrows
		// var message_hex = [0x1A, 0x37, 0x08]; // 2 hi gongs, no arrows
		// var message_hex = [0x1A, 0x37, 0x0C]; // 3 hi gongs + no arrows
		// var message_hex = [0x1A, 0x37, 0x10]; // 1 lo gong, no arrows
		// var message_hex = [0x1A, 0x37, 0x18]; // 3 beeps + no arrows

		var message_hex = [0x1A, 0x37, 0x03]; // no gong, flash arrows

		var message_hex = message_hex.concat(ascii2hex(message.ike_pad()));

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(message_hex),
		}

		omnibus.ibus_connection.send_message(ibus_packet);

		if (!timeout) { var timeout = 10000; }

		// Clear the message after 5 seconds
		setTimeout(() => {
			ike_text_urgent_off();
			hud_refresh();
		}, timeout);
	}

	// Check control messages
	function ike_text_urgent(message, timeout) {
		var src = 0x30; // CCM
		var dst = 0x80; // IKE

		var message_hex = [0x1A, 0x35, 0x00];
		var message_hex = message_hex.concat(ascii2hex(message.ike_pad()));

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(message_hex),
		}

		omnibus.ibus_connection.send_message(ibus_packet);

		if (!timeout) { var timeout = 5000; }

		// Clear the message after 5 seconds
		setTimeout(() => {
			ike_text_urgent_off();
			hud_refresh();
		}, timeout);
	}

	// Check control messages
	function ike_text_urgent_off() {
		var src = 0x30; // CCM
		var dst = 0x80; // IKE

		var message_hex = [0x1A, 0x30, 0x00];

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(message_hex),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// IKE cluster text send message
	function ike_text(string) {
		var src = 0x68; // RAD
		var dst = 0xBF; // GLO

		string = string.ike_pad();

		// console.log('[ node-bmw] Sending text to IKE screen: \'%s\'', string);

		// Need to center text..
		var string_hex = [0x23, 0x50, 0x30, 0x07];
		var string_hex = string_hex.concat(ascii2hex(string));
		var string_hex = string_hex.concat(0x04);

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(string_hex),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// Send message to IKE
	function ike_send(packet) {
		var src = 0x3F; // DIA
		var dst = 0xBF; // GLO
		var cmd = 0x0C; // Set IO status

		// Add the command to the beginning of the IKE hex array
		packet.unshift(cmd);

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(packet),
		}

		// Send the message
		console.log('[ node-bmw] Sending IKE packet');
		omnibus.ibus_connection.send_message(ibus_packet);
	}

}

module.exports = IKE;
