#!/usr/bin/env node

// npm libraries
var convert = require('node-unit-conversion');
var moment  = require('moment');
var os      = require('os');

var IKE = function() {
	// Exposed data
	this.hud_refresh  = hud_refresh;
	this.ike_data     = ike_data;
	this.obc_data     = obc_data;
	this.obc_refresh  = obc_refresh;
	this.parse_out    = parse_out;
	this.request      = request;
	this.text         = text;
	this.text_urgent  = text_urgent;
	this.text_warning = text_warning;

	// HUD refresh vars
	var interval_hud_refresh;
	var last_hud_refresh = 0;

	// Ignition state change vars
	var state_powerdown;
	var state_poweroff;
	var state_poweron;
	var state_run;

	// Pad string for IKE text screen length (20 characters)
	String.prototype.ike_pad = function() {
		var string = this;

		while (string.length < 20) {
			string = string + ' ';
		}

		return string;
	}

	// Parse data sent from IKE module
	function parse_out(data) {
		// Init variables
		var src = data.src.id;
		var dst = data.dst;

		var command;
		var value;

		switch (data.msg[0]) {
			case 0x01: // Request device status
				command = 'request';
				value   = 'device status';
				break;

			case 0x02: // Broadcast device status
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

			case 0x07: // Gong status
				command = 'gong status';
				value   = 'not decoded';
				break;

			case 0x11: // ignition status
				command = 'ignition status';

				// If key is now in 'off' and ignition status was previously 'accessory' or 'run'
				if (data.msg[1] == 0x00 && (status.vehicle.ignition == 'accessory' || status.vehicle.ignition == 'run')) {
					console.log('[node::IKE] Trigger: power-down state');
					state_powerdown = true;
				}
				else {
					state_powerdown = false;
				}

				// If key is now in 'off' or 'accessory' and ignition status was previously 'run'
				if ((data.msg[1] == 0x00 || data.msg[1] == 0x01) && status.vehicle.ignition == 'run') {
					console.log('[node::IKE] Trigger: power-off state');
					state_poweroff = true;
				}
				else {
					state_poweroff = false;
				}

				// If key is now in 'accessory' or 'run' and ignition status was previously 'off'
				if ((data.msg[1] == 0x01 || data.msg[1] == 0x03) && status.vehicle.ignition == 'off') {
					console.log('[node::IKE] Trigger: power-on state');
					state_poweron = true;
				}
				else {
					state_poweron = false;
				}

				// If key is now in 'run' and ignition status was previously 'off' or 'accessory'
				if (data.msg[1] == 0x03 && (status.vehicle.ignition == 'off' || status.vehicle.ignition == 'accessory')) {
					console.log('[node::IKE] Trigger: run state');
					state_run = true;
				}
				else {
					state_run = false;
				}

				switch (data.msg[1]) { // Ignition status value
					case 0x00 : status.vehicle.ignition = 'off';       break;
					case 0x01 : status.vehicle.ignition = 'accessory'; break;
					case 0x03 : status.vehicle.ignition = 'run';       break;
					case 0x07 : status.vehicle.ignition = 'start';     break;
					default   : status.vehicle.ignition = 'unknown';   break;
				}

				if (state_powerdown === true) {
					// Disable HUD refresh
					clearInterval(interval_hud_refresh, () => {
						console.log('[node::IKE] Cleared HUD refresh interval');
					});

					// Disable BMBT refresh
					omnibus.BMBT.interval_status('unset');

					// Stop media playback
					omnibus.kodi.stop_all();

					// Set modules as not ready
					status.bmbt.ready = false;
					status.bmbt.reset = true;
					status.cdc.ready  = false;
					status.cdc.reset  = true;
					status.dsp.ready  = false;
					status.dsp.reset  = true;
					status.dspc.ready = false;
					status.dspc.reset = true;
					status.lcm.ready  = false;
					status.lcm.reset  = true;
					status.mid.ready  = false;
					status.mid.reset  = true;
					status.rad.ready  = false;
					status.rad.reset  = true;

					// Turn off HDMI display after 3 seconds
					setTimeout(() => {
						omnibus.HDMI.command('poweroff');
					}, 1000);
				}

				if (state_poweroff === true) {
					// If the doors are locked
					if (status.vehicle.locked == true) {
						// Send message to GM to toggle door locks
						omnibus.GM.gm_cl();
					}
				}

				if (state_poweron === true) {
					// Enable BMBT refresh
					omnibus.BMBT.interval_status('set');

					// Welcome message
					text_warning('node-bmw     '+os.hostname(), 3000);

					// Refresh OBC HUD once every 5 seconds
					hud_refresh(true);
					interval_hud_refresh = setInterval(() => {
						hud_refresh(true);
					}, 5000);
				}

				if (state_run === true) {
				}

				omnibus.LCM.auto_lights_process();
				value = status.vehicle.ignition;
				break;

			case 0x13: // IKE sensor status
				command = 'broadcast';
				value   = 'IKE sensor status';
				// console.log('[node::IKE] sensor :', Buffer.from(data.msg));

				// This is a bitmask
				// data.msg[1]:
				// 0x01 = handbrake on
				if (bitmask.bit_test(data.msg[1], bitmask.bit[0])) {
					// If handbrake is newly true
					if (status.vehicle.handbrake === false) {
						status.vehicle.handbrake = true;
						// omnibus.LCM.auto_lights_process();
					}
				}
				else {
					// If handbrake is newly false
					if (status.vehicle.handbrake === true) {
						status.vehicle.handbrake = false;
						// omnibus.LCM.auto_lights_process();
					}
				}

				// data.msg[2]:
				//   1 = Engine running
				// 176 = P (4+5+7)
				//  16 = R (4)
				// 112 = N (4+5+6)
				// 128 = D (7)
				// 192 = 4 (6+7)
				// 208 = 3 (4+6+7)
				//  64 = 2 (6)
				if (bitmask.bit_test(data.msg[2], bitmask.bit[0])) {
					// If it's newly running
					if (status.engine.running === false || status.engine.running === null) {
						omnibus.HDMI.command('poweron');
						status.engine.running = true;
					}
				}
				else {
					// If it's newly NOT running
					if (status.engine.running === true || status.engine.running === null) {
						status.engine.running = false;
					}
				}

				if (bitmask.bit_test(data.msg[2], bitmask.bit[4]) &&
					!bitmask.bit_test(data.msg[2], bitmask.bit[5])  &&
					!bitmask.bit_test(data.msg[2], bitmask.bit[6])  &&
					!bitmask.bit_test(data.msg[2], bitmask.bit[7])) {

					// If it's newly in reverse
					if (status.vehicle.reverse === false || status.vehicle.reverse === null) {
						text_warning(' YOU\'RE IN REVERSE!', 2000);
					}
					status.vehicle.reverse = true;
				}
				else {
					status.vehicle.reverse = false;
				}
				break;

			case 0x15: // country coding data
				command = 'broadcast';
				value   = 'country coding data';
				break;

			case 0x17: // Odometer
				command                            = 'odometer';
				var odometer_value1                = data.msg[3] << 16;
				var odometer_value2                = data.msg[2] << 8;
				var odometer_value                 = odometer_value1 + odometer_value2 + data.msg[1];
				value                              = odometer_value;
				status.vehicle.odometer.km = odometer_value;
				status.vehicle.odometer.mi = Math.round(convert(odometer_value).from('kilometre').to('us mile'));
				break;

			case 0x18: // Vehicle speed and RPM
				command = 'broadcast';
				value   = 'current speed and RPM';

				// Update vehicle and engine speed variables
				status.vehicle.speed.kmh = parseFloat(data.msg[1]*2);
				status.engine.speed      = parseFloat(data.msg[2]*100);

				// Convert values and round to 2 decimals
				status.vehicle.speed.mph = convert(parseFloat((data.msg[1]*2))).from('kilometre').to('us mile').toFixed(2);
				break;

			case 0x19: // Coolant temp and external temp
				command = 'broadcast';
				value   = 'temperature values';

				// Update external and engine coolant temp variables
				status.temperature.exterior.c = parseFloat(data.msg[1]);
				status.temperature.coolant.c  = parseFloat(data.msg[2]);

				status.temperature.exterior.f = Math.round(convert(parseFloat(data.msg[1])).from('celsius').to('fahrenheit'));
				status.temperature.coolant.f  = Math.round(convert(parseFloat(data.msg[2])).from('celsius').to('fahrenheit'));

				// Send Kodi a notification
				// omnibus.kodi.notify('Temperature', 'Coolant: '+status.temperature.coolant.c+' C, Exterior: '+status.temperature.exterior.c+' C');

				// Refresh the HUD
				hud_refresh(false);
				break;

			case 0x1B: // ACK text message
				command = 'acknowledged';
				value   = parseFloat(data.msg[1])+' text messages';
				break;

			case 0x24: // OBC values broadcast
				switch (data.msg[1]) {
					case 0x01: // Time
						command = 'OBC time';

						// Parse unit
						string_time_unit = Buffer.from([data.msg[8], data.msg[9]]);
						string_time_unit = string_time_unit.toString().trim().toLowerCase();

						// Detect 12h or 24h time and parse value
						if (string_time_unit == 'am' || string_time_unit == 'pm') {
							status.coding.unit.time = '12h';
							string_time = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6], data.msg[7], data.msg[8], data.msg[9]]);
						}
						else {
							status.coding.unit.time = '24h';
							string_time = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6], data.msg[7]]);
						}

						string_time = string_time.toString().trim().toLowerCase();

						// Update status variables
						status.obc.time = string_time;
						value                   = status.obc.time;
						break;

					case 0x02: // Date
						command = 'OBC date';

						// Parse value
						string_date = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6], data.msg[7], data.msg[8], data.msg[9], data.msg[10], data.msg[11], data.msg[12]]);
						string_date = string_date.toString().trim();

						// Update status variables
						status.obc.date = string_date;
						value                   = status.obc.date;
						break;

					case 0x03: // Exterior temp
						command = 'OBC exterior temperature';

						// Parse unit
						string_temp_exterior_unit = Buffer.from([data.msg[9]]);
						string_temp_exterior_unit = string_temp_exterior_unit.toString().trim().toLowerCase();

						// Parse if it is +/-
						string_temp_exterior_negative = Buffer.from([data.msg[9]]);
						string_temp_exterior_negative = string_temp_exterior_negative.toString().trim().toLowerCase();

						// Parse value
						if (string_temp_exterior_negative == '-') {
							string_temp_exterior_value = Buffer.from(data.msg[3], [data.msg[4], data.msg[5], data.msg[6], data.msg[7]]);
							string_temp_exterior_value = string_temp_exterior_value.toString().trim().toLowerCase();
						}
						else {
							string_temp_exterior_value = Buffer.from([data.msg[4], data.msg[5], data.msg[6], data.msg[7]]);
							string_temp_exterior_value = string_temp_exterior_value.toString().trim().toLowerCase();
						}

						// Update status variables
						switch (string_temp_exterior_unit) {
							case 'c':
								status.coding.unit.temp = 'c';
								status.temperature.exterior.obc.c = parseFloat(string_temp_exterior_value);
								status.temperature.exterior.obc.f = convert(parseFloat(string_temp_exterior_value)).from('celsius').to('fahrenheit');
								break;
							case 'f':
								status.coding.unit.temp = 'f';
								status.temperature.exterior.obc.c = convert(parseFloat(string_temp_exterior_value)).from('fahrenheit').to('celsius');
								status.temperature.exterior.obc.f = parseFloat(string_temp_exterior_value);
								break;
						}

						value = status.temperature.exterior.obc.c;
						break;

					case 0x04: // Consumption 1
						command = 'OBC consumption 1';

						// Parse unit
						string_consumption_1_unit = Buffer.from([data.msg[8]]);
						string_consumption_1_unit = string_consumption_1_unit.toString().trim().toLowerCase();

						// Parse value
						string_consumption_1 = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6]]);
						string_consumption_1 = parseFloat(string_consumption_1.toString().trim().toLowerCase());

						// Perform appropriate conversions between units
						switch (string_consumption_1_unit) {
							case 'm':
								status.coding.unit.cons = 'mpg';
								string_consumption_1_mpg        = string_consumption_1;
								string_consumption_1_l100       = 235.21/string_consumption_1;
								break;

							default:
								status.coding.unit.cons = 'l100';
								string_consumption_1_mpg        = 235.21/string_consumption_1;
								string_consumption_1_l100       = string_consumption_1;
								break;
						}

						// Update status variables
						status.obc.consumption_1_mpg  = string_consumption_1_mpg.toFixed(2);
						status.obc.consumption_1_l100 = string_consumption_1_l100.toFixed(2);

						value = status.obc.consumption_1_mpg;

						// Refresh the HUD
						hud_refresh(false);
						break;

					case 0x05: // Consumption 2
						command = 'OBC consumption 2';

						// Parse unit
						string_consumption_2_unit = Buffer.from([data.msg[8]]);
						string_consumption_2_unit = string_consumption_2_unit.toString().trim().toLowerCase();

						// Parse value
						string_consumption_2 = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6]]);
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

						// Update status variables
						status.obc.consumption_2_mpg  = string_consumption_2_mpg.toFixed(2);
						status.obc.consumption_2_l100 = string_consumption_2_l100.toFixed(2);

						value = status.obc.consumption_2_mpg;
						break;

					case 0x06: // Range
						command = 'OBC range to empty';

						// Parse value
						string_range = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6]]);
						string_range = string_range.toString().trim();

						string_range_unit = Buffer.from([data.msg[7], data.msg[8]]);
						string_range_unit = string_range_unit.toString().trim().toLowerCase();

						// Update status variables
						switch (string_range_unit) {
							case 'ml':
								status.coding.unit.distance = 'mi';
								status.obc.range_mi = parseFloat(string_range);
								status.obc.range_km = parseFloat(convert(parseFloat(string_range)).from('kilometre').to('us mile').toFixed(2));
								break;

							case 'km':
								status.coding.unit.distance = 'km';
								status.obc.range_mi = parseFloat(convert(parseFloat(string_range)).from('us mile').to('kilometre').toFixed(2));
								status.obc.range_km = parseFloat(string_range);
								break;
						}

						value = status.obc.range_mi;
						break;

					case 0x07: // Distance
						command = 'OBC distance remaining';

						// Parse value
						string_distance = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6]]);
						string_distance = string_distance.toString().trim().toLowerCase();

						// Update status variables
						status.obc.distance = string_distance;
						value                       = status.obc.distance;
						break;

					case 0x08: // Arrival time
						command = 'OBC arrival time';
						// Parse value
						string_arrival = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6], data.msg[7], data.msg[8], data.msg[9]]);
						string_arrival = string_arrival.toString().trim().toLowerCase();

						// Update status variables
						status.obc.arrival = string_arrival;
						value                      = status.obc.arrival;
						break;

					case 0x09: // Limit
						command = 'OBC speed limit';

						// Parse value
						string_speedlimit = Buffer.from([data.msg[3], data.msg[4], data.msg[5]]);
						string_speedlimit = parseFloat(string_speedlimit.toString().trim().toLowerCase());

						// Update status variables
						status.obc.speedlimit = string_speedlimit.toFixed(2);
						value                         = status.obc.speedlimit;
						break;

					case 0x0A: // average speed
						command = 'OBC average speed';

						// Parse unit
						string_speedavg_unit = Buffer.from([data.msg[8]]);
						string_speedavg_unit = string_speedavg_unit.toString().trim().toLowerCase();

						// Parse value
						string_speedavg = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6]]);
						string_speedavg = parseFloat(string_speedavg.toString().trim().toLowerCase());

						// Convert values appropriately based on coding valueunits
						switch(string_speedavg_unit) {
							case 'k':
								status.coding.unit.speed = 'kmh';
								// Update status variables
								status.obc.speedavg_kmh = string_speedavg.toFixed(2);
								status.obc.speedavg_mph = convert(string_speedavg).from('kilometre').to('us mile').toFixed(2);
								break;

							case 'm':
								status.coding.unit.speed = 'mph';
								// Update status variables
								status.obc.speedavg_kmh = convert(string_speedavg).from('us mile').to('kilometre').toFixed(2);
								status.obc.speedavg_mph = string_speedavg.toFixed(2);
								break;
						}

						value = status.obc.speedavg_mph;
						break;

					case 0x0B: //
						command = 'OBC 0x0B';
						value   = Buffer.from(data.msg);
						break;

					case 0x0C: //
						command = 'OBC 0x0C';
						value   = Buffer.from(data.msg);
						break;

					case 0x0D: //
						command = 'OBC code';
						// Parse value
						string_code = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6]]);
						string_code = string_code.toString().trim().toLowerCase();

						// Update status variable
						status.obc.code = string_code;
						value                   = status.obc.code;
						break;

					case 0x0E: // Timer
						command = 'OBC timer';

						// Parse value
						string_timer = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6]]);
						string_timer = parseFloat(string_timer.toString().trim().toLowerCase()).toFixed(2);

						// Update status variables
						status.obc.timer = string_timer;
						value                    = status.obc.timer;
						break;

					case 0x0F: // Aux heat timer 1
						command = 'OBC aux heat timer 1';

						// Parse value
						string_aux_heat_timer_1 = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6], data.msg[7], data.msg[8], data.msg[9]]);
						string_aux_heat_timer_1 = string_aux_heat_timer_1.toString().trim().toLowerCase();

						// Update status variables
						status.obc.aux_heat_timer_1 = string_aux_heat_timer_1;
						value                               = status.obc.aux_heat_timer_1;
						break;

					case 0x10: // Aux heat timer 2
						command = 'OBC aux heat timer 2';

						// Parse value
						string_aux_heat_timer_2 = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6], data.msg[7], data.msg[8], data.msg[9]]);
						string_aux_heat_timer_2 = string_aux_heat_timer_2.toString().trim().toLowerCase();

						// Update status variables
						status.obc.aux_heat_timer_2 = string_aux_heat_timer_2;
						value                               = status.obc.aux_heat_timer_2;
						break;

					case 0x1A: // Stopwatch
						command = 'OBC stopwatch';

						// Parse value
						string_stopwatch = Buffer.from([data.msg[3], data.msg[4], data.msg[5], data.msg[6]]);
						string_stopwatch = parseFloat(string_stopwatch.toString().trim().toLowerCase()).toFixed(2);

						// Update status variables
						status.obc.stopwatch = string_stopwatch;
						value                        = status.obc.stopwatch;
						break;

					default:
						command = 'OBC unknown value';
						value   = Buffer.from(data.msg);
						break;
				}
				break;

			case 0x2A: // aux heating LED
				command = 'aux heating LED';
				// This actually is a bitmask but.. this is also a freetime project
				switch(data.msg[2]) {
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
						value = Buffer.from(data.msg);
						break;
				}

				status.obc.aux_heat_led = value;
				break;

			case 0x50: // Request check-control sensor information
				command = 'request';
				value   = 'check control sensor status';
				break;

			case 0x53: // Request vehicle data
				command = 'request';
				value   = 'vehicle data';
				break;

			case 0x57: // BC button in cluster
				command = 'button';
				value   = 'BC';
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

	// Handle incoming commands from API
	function ike_data(data) {
		// Display text string in cluster
		if (typeof data['obc-text'] !== 'undefined') {
			text(data['obc-text']);
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
			console.log('[node::IKE] ike_data(): Unknown command');
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
	function hud_refresh(interval) {
		var spacing1;
		var spacing2;
		var string_cons;
		var string_temp;
		var string_time = moment().format('HH:mm');
		var time_now    = now();

		// Bounce if the last update was less than 5 sec ago, and it's the auto interval calling
		if (time_now-last_hud_refresh <= 5000 && interval === true) {
			console.log('[node::IKE] HUD refresh: too soon');
			return;
		}

		// console.log('[node::IKE] Refreshing OBC HUD');

		// Populate values if missing
		if (status.obc.consumption_1_mpg === null) {
			obc_data('get', 'cons1');
			string_cons = '     ';
		}
		else {
			string_cons = parseFloat(status.obc.consumption_1_mpg).toFixed(1)+'m';
		}

		if (status.temperature.coolant.c === null) {
			request('temperature');
			string_temp = '  ';
		}
		else {
			string_temp = Math.round(status.temperature.coolant.c)+'¨';
		}

		// Format the output (ghetto-ly)
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

		// 1m sysload - to 3 digits
		var load_1m = os.loadavg()[0].toFixed(3);

		// Format the output (ghetto-ly)
		switch (load_1m.length) {
			case 4:
				load_1m = load_1m+'0';
				break;
			case 3:
				load_1m = load_1m+'00';
				break;
			case 2:
				load_1m = load_1m+'000';
				break;
			case 1:
				load_1m = '0.000';
				break;
		}

		// Add space to left-most string (consumption 1)
		if (string_cons.length === 4) {
			string_cons = '0'+string_cons;
		}

		if (status.vehicle.ignition == 'run' || status.vehicle.ignition == 'accessory') {
			text(load_1m+spacing1+string_temp+spacing2+string_time, () => {
				last_hud_refresh = now();
			});
		}
	}

	// Refresh OBC data
	function obc_refresh() {
		console.log('[node::IKE] Refreshing all OBC data');

		// LCM data
		omnibus.LCM.request('vehicledata');
		omnibus.LCM.request('lampstatus');
		omnibus.LCM.request('dimmer');
		omnibus.LCM.request('io-status');

		// Immo+GM data
		omnibus.EWS.request('immobiliserstatus');
		omnibus.GM.request('io-status');
		omnibus.GM.request('door-flap-status');

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

		// console.log('[node::IKE] Performing \'%s\' on OBC value \'%s\'', action, value);

		omnibus.ibus.send({
			src: 'GT',
			dst: 'IKE',
			msg: msg,
		});
	}

	// Cluster/interior backlight
	function ike_backlight(value) {
		console.log('[node::IKE] Setting LCD screen backlight to %s', value);
		omnibus.ibus.send({
			src: 'LCM',
			dst: 'GLO',
			msg: [0x5C, value.toString(16), 0x00]
		});
	}

	// Request various things from IKE
	function request(value) {
		console.log('[node::IKE] Requesting \'%s\'', value);

		var cmd;
		var src = 'VID';
		var dst = 'IKE';
		switch (value) {
			case 'ignition':
				cmd = [0x10];
				break;
			case 'sensor':
				cmd = [0x12];
				break;
			case 'coding':
				src = 'RAD';
				cmd = [0x14];
				break;
			case 'odometer':
				src = 'EWS';
				cmd = [0x16];
				break;
			case 'dimmer':
				src = 'IHKA';
				cmd = [0x1D, 0xC5];
				break;
			case 'temperature':
				src = 'LCM';
				cmd = [0x1D, 0xC5];
				break;
			case 'statusall':
				src = 'IKE';
				dst = 'GLO';
				cmd = [0x01];
				break;
			case 'vin':
				src = 'IKE';
				dst = 'LCM';
				cmd = [0x53];
				break;
		}

		omnibus.ibus.send({
			src: src,
			dst: dst,
			msg: cmd,
		});
	}

	// Pretend to be IKE saying the car is on
	// Note - this can and WILL set the alarm off - kudos to the Germans...
	function ike_ignition(value) {
		console.log('[node::IKE] Claiming ignition is \'%s\'', value);

		var status;
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

		omnibus.ibus.send({
			src: 'IKE',
			dst: 'GLO',
			msg: [0x11, status],
		});
	}

	// OBC set clock
	function obc_clock() {
		console.log('[node::IKE] Setting OBC clock to current time');

		var time = moment();

		// Time
		omnibus.ibus.send({
			src: 'GT',
			dst: 'IKE',
			msg: [0x40, 0x01, time.format('H'), time.format('m')],
		});

		// Date
		omnibus.ibus.send({
			src: 'GT',
			dst: 'IKE',
			msg: [0x40, 0x02, time.format('D'), time.format('M'), time.format('YY')],
		});
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

		console.log('[node::IKE] OBC gong %s', obc_value);

		omnibus.ibus.send({
			src: 'RAD',
			dst: 'IKE',
			msg: msg,
		});
	}

	// Check control warnings
	function text_warning(message, timeout) {
		// 3rd byte:
		// 0x00 : no gong,   no arrow
		// 0x01 : no gong,   solid arrow
		// 0x02 : no gong,   no arrow
		// 0x03 : no gong,   flash arrow
		// 0x04 : 1 hi gong, no arrow
		// 0x08 : 2 hi gong, no arrow
		// 0x0C : 3 hi gong, no arrow
		// 0x10 : 1 lo gong, no arrow
		// 0x18 : 3 beep,    no arrow

		var message_hex = [0x1A, 0x37, 0x03]; // no gong, flash arrow
		var message_hex = message_hex.concat(ascii2hex(message.ike_pad()));

		omnibus.ibus.send({
			src : 'CCM',
			dst : 'IKE',
			msg : message_hex,
		});

		// Default timeout = 10 sec
		if (typeof timeout === 'undefined' || timeout === null) { var timeout = 10000; }

		// Clear the message after 5 seconds
		setTimeout(() => {
			text_urgent_off();
		}, timeout);
	}

	// Check control messages
	function text_urgent(message, timeout) {
		var message_hex = [0x1A, 0x35, 0x00];
		var message_hex = message_hex.concat(ascii2hex(message.ike_pad()));

		omnibus.ibus.send({
			src : 'CCM',
			dst : 'IKE',
			msg : message_hex,
		});

		// Default timeout = 5 sec
		if (typeof timeout === 'undefined' || timeout === null) { var timeout = 5000; }

		// Clear the message after 5 seconds
		setTimeout(() => {
			text_urgent_off();
		}, timeout);
	}

	// Clear check control messages, then refresh HUD
	function text_urgent_off() {
		omnibus.ibus.send({
			src: 'CCM',
			dst: 'IKE',
			msg: [0x1A, 0x30, 0x00],
		});

		setTimeout(() => {
			hud_refresh();
		}, 250);
	}

	// IKE cluster text send message
	function text(string) {
		// console.log('[node::IKE] Sending text to IKE screen: \'%s\'', string);
		string = string.ike_pad();

		// Need to center text..
		var string_hex = [0x23, 0x50, 0x30, 0x07];
		var string_hex = string_hex.concat(ascii2hex(string));
		var string_hex = string_hex.concat(0x04);

		omnibus.ibus.send({
			src: 'RAD',
			dst: 'GLO',
			msg: string_hex,
		});
	}
}

module.exports = IKE;
