#!/usr/bin/env node

// npm libraries
var convert = require('node-unit-conversion');
var dbus    = require('dbus-native');
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

var IKE = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.ike_data  = ike_data;
	this.ike_send  = ike_send;
	this.ike_text  = ike_text;
	this.obc_data  = obc_data;
	this.parse_out = parse_out;
	this.request   = request;

	// Pad string for IKE text screen length (20 characters)
	String.prototype.ike_pad = function() {
		var string = this;

		while (string.length < 20) {
			string = string + ' ';
		}

		return string;
	}

	// Refresh OBC HUD once every 2 seconds, if ignition is in 'run'
	if (omnibus.status.vehicle.ignition == 'run') { hud_refresh(); }
	setInterval(function() {
		if (omnibus.status.vehicle.ignition == 'run') { hud_refresh(); }
	}, 5000);

	// Parse data sent from IKE module
	function parse_out(data) {
		// Init variables
		var src      = data.src;
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
					// If the doors are locked
					if (omnibus.status.vehicle.locked == true) {
						console.log('[node-bmw] Unlocking doors');
						// Send message to GM to toggle door locks
						omnibus.GM.gm_cl('toggle');
					}
				}

				// If key is now in 'off' and ignition status was previously 'accessory' or 'run'
				if (message[1] == 0x00 && (omnibus.status.vehicle.ignition == 'accessory' || omnibus.status.vehicle.ignition == 'run')) {
					console.log('[node-bmw] Trigger: power-off state');
					omnibus.status.vehicle.ignition = 'off';
					// Stop auto lights
					omnibus.LCM.auto_lights('off');

					// Set audio modules as not ready
					omnibus.status.audio.dsp_ready = false;
					omnibus.status.audio.rad_ready = false;
				}

				// If key is now in 'accessory' or 'run' and ignition status was previously 'off'
				if ((message[1] == 0x01 || message[1] == 0x03) && omnibus.status.vehicle.ignition == 'off') {
					console.log('[node-bmw] Trigger: power-on state');
					omnibus.status.vehicle.ignition = 'accessory';
					// Start auto lights
					omnibus.LCM.auto_lights('on');
				}

				switch (message[1]) { // Ignition status value
					case 0x00 : omnibus.status.vehicle.ignition = 'off'      ; break;
					case 0x01 : omnibus.status.vehicle.ignition = 'accessory'; break;
					case 0x03 : omnibus.status.vehicle.ignition = 'run'      ; break;
					case 0x07 : omnibus.status.vehicle.ignition = 'start'    ; break;
					default   : omnibus.status.vehicle.ignition = 'unknown'  ; break;
				}

				value = omnibus.status.vehicle.ignition;
				break;

			case 0x13: // IKE sensor status
				command = 'broadcast';
				value   = 'IKE sensor status';

				// This is a bitmask
				// message[1]:
				// 0x01 = handbrake on
				if (bit_test(message[1], bit_0)) {
					// If the handbrake was previously off
					if (omnibus.status.vehicle.handbrake == false) {
						// Stop auto lights
						omnibus.LCM.auto_lights('off');
					}

					omnibus.status.vehicle.handbrake = true;
					console.log('[node-bmw] Handbrake on');
				}
				else {
					// If the handbrake was previously on
					if (omnibus.status.vehicle.handbrake == true) {
						// Start auto lights
						omnibus.LCM.auto_lights('on');
					}

					omnibus.status.vehicle.handbrake = false;
					console.log('[node-bmw] Handbrake off');
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
				if (bit_test(message[2], bit_0)) { omnibus.status.engine.running = true; } else { omnibus.status.engine.running = false; }

				if (bit_test(message[2], bit_4) && !bit_test(message[2], bit_5) && !bit_test(message[2], bit_6) && !bit_test(message[2], bit_7)) {
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
				command = 'broadcast';
				value   = 'odometer';
				break;

			case 0x18: // Vehicle speed and RPM
				command = 'broadcast';
				value   = 'current speed and RPM';

				// Update vehicle and engine speed variables
				omnibus.status.vehicle.speed_kmh = parseFloat(message[1]*2).toFixed(2);
				omnibus.status.engine.speed      = parseFloat(message[2]*100).toFixed(2);

				// Convert values and round to 2 decimals
				omnibus.status.vehicle.speed_mph = convert(parseFloat((message[1]*2))).from('kilometre').to('us mile').toFixed(2);
				break;

			case 0x19: // Coolant temp and external temp
				command = 'broadcast';
				value   = 'temperature values';

				// Update external and engine coolant temp variables
				omnibus.status.temperature.exterior_c = parseFloat(message[1]).toFixed(2);
				omnibus.status.temperature.coolant_c  = parseFloat(message[2]).toFixed(2);

				omnibus.status.temperature.exterior_f = convert(parseFloat(message[1])).from('celsius').to('fahrenheit').toFixed(2);
				omnibus.status.temperature.coolant_f  = convert(parseFloat(message[2])).from('celsius').to('fahrenheit').toFixed(2);
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
							omnibus.status.coding.unit_time = '12h';
							string_time = new Buffer([message[3], message[4], message[5], message[6], message[7], message[8], message[9]]);
						}
						else {
							omnibus.status.coding.unit_time = '24h';
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
								omnibus.status.coding.unit_temp    = 'c';
								omnibus.status.obc.temp_exterior_c = parseFloat(string_temp_exterior_value).toFixed(2);
								omnibus.status.obc.temp_exterior_f = convert(parseFloat(string_temp_exterior_value)).from('celsius').to('fahrenheit').toFixed(2);
								break;
							case 'f':
								omnibus.status.coding.unit_temp    = 'f';
								omnibus.status.obc.temp_exterior_c = convert(parseFloat(string_temp_exterior_value)).from('fahrenheit').to('celsius').toFixed(2);
								omnibus.status.obc.temp_exterior_f = parseFloat(string_temp_exterior_value).toFixed(2);
								break;
						}

						value = omnibus.status.obc.temp_exterior_c;
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
								omnibus.status.coding.unit_cons = 'mpg';
								string_consumption_1_mpg        = string_consumption_1;
								string_consumption_1_l100       = 235.21/string_consumption_1;
								break;

							default:
								omnibus.status.coding.unit_cons = 'l100';
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

						switch (string_range_unit) {
							case 'ml':
								omnibus.status.coding.unit_distance = 'mi';
								// Update omnibus.status variables
								omnibus.status.obc.range_mi = parseFloat(string_range).toFixed(2);
								omnibus.status.obc.range_km = convert(parseFloat(string_range)).from('kilometre').to('us mile').toFixed(2);
								break;

							case 'km':
								omnibus.status.coding.unit_distance = 'km';
								omnibus.status.obc.range_mi = convert(parseFloat(string_range)).from('us mile').to('kilometre').toFixed(2);
								omnibus.status.obc.range_km = parseFloat(string_range).toFixed(2);
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

					case 0x08: // --:--
						command = 'OBC clock';
						value   = 'decoding not implemented';
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
								omnibus.status.coding.unit_speed = 'kmh';
								// Update omnibus.status variables
								omnibus.status.obc.speedavg_kmh = string_speedavg.toFixed(2);
								omnibus.status.obc.speedavg_mph = convert(string_speedavg).from('kilometre').to('us mile').toFixed(2);
								break;

							case 'm':
								omnibus.status.coding.unit_speed = 'mph';
								// Update omnibus.status variables
								omnibus.status.obc.speedavg_kmh = convert(string_speedavg).from('us mile').to('kilometre').toFixed(2);
								omnibus.status.obc.speedavg_mph = string_speedavg.toFixed(2);
								break;
						}

						value = omnibus.status.obc.speedavg_mph;
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

			case 0x57: // BC button in cluster
				command = 'button';
				value   = 'BC';
				break;

			default:
				command = 'unknown';
				value   = new Buffer(message);
				break;
		}

		console.log('[%s->%s] %s:', data.src_name, data.dst_name, command, value);
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
			console.log('[node-bmw] ike_data(): Unknown command');
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
		console.log('[node-bmw] Refreshing OBC HUD');

		// Request consumption 1 and time
		obc_data('get', 'cons1');
		obc_data('get', 'time');

		var cons1 = parseFloat(omnibus.status.obc.consumption_1_mpg).toFixed(1);
		var ctmp  = Math.round(omnibus.status.temperature.coolant_c);

		ike_text(omnibus.status.obc.time+' C:'+cons1+' T:'+ctmp);
	}

	// Refresh OBC data
	function obc_refresh() {
		console.log('[node-bmw] Refreshing all OBC data');

		obc_data('get', 'auxheat1');
		obc_data('get', 'auxheat2');
		obc_data('get', 'cons1');
		obc_data('get', 'cons2');
		obc_data('get', 'date');
		obc_data('get', 'distance');
		obc_data('get', 'range');
		obc_data('get', 'speedavg');
		obc_data('get', 'speedlimit');
		obc_data('get', 'stopwatch');
		obc_data('get', 'temp_exterior');
		obc_data('get', 'time');
		obc_data('get', 'timer');
	}

	// OBC data request
	function obc_data(action, value) {
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
			case 'limit-on'   : action_id = 0x04; break;
			case 'limit-off'  : action_id = 0x08; break;
			case 'reset'      : action_id = 0x10; break;
			case 'limit-set'  : action_id = 0x20; break;
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

		console.log('[node-bmw]  Doing \'%s\' on OBC value \'%s\'', action, value);

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
		var cmd = 0x5C; // Set LCD screen text

		console.log('[node-bmw] Setting LCD screen backlight to %s', value);

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

		console.log('[node-bmw] Requesting \'%s\' from IKE', value);

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
			case 'temperature':
				src = 0x5B; // IHKA
				cmd = [0x1D, 0xC5];
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

		console.log('[node-bmw] Claiming ignition is \'%s\'', value);

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

		console.log('[node-bmw] Setting OBC clock to \'%s/%s/%s %s:%s\'', data.day, data.month, data.year, data.hour, data.minute);

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

		console.log('[node-bmw] OBC gong %s', obc_value);

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// Check control messages
	function ike_text_urgent(message) {
		var src = 0x30; // CCM
		var dst = 0x80; // IKE

		var message_hex = [0x1A, 0x35, 0x00];
		var message_hex = message_hex.concat(ascii2hex(message));
		// var message_hex = message_hex.concat(0x04);

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(message_hex),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
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

		// Need to center and pad spaces out to 20 chars
		console.log('[node-bmw] Sending text to IKE screen: \'%s\'', string);

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
		console.log('[node-bmw] Sending IKE packet');
		omnibus.ibus_connection.send_message(ibus_packet);
	}

}

module.exports = IKE;
