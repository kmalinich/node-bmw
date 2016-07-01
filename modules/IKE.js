#!/usr/bin/env node

// npm libraries
var clc  = require('cli-color');
var wait = require('wait.for');

// Bitmasks in hex
var bit_0 = 0x01;
var bit_1 = 0x02;
var bit_2 = 0x04;
var bit_3 = 0x08;
var bit_4 = 0x10;
var bit_5 = 0x20;
var bit_6 = 0x40;
var bit_7 = 0x80;


var IKE = function(omnibus) {

	// self reference
	var _self = this;

	// exposed data
	this.obc_get   = obc_get;
	this.obc_reset = obc_reset;
	this.ike_send  = ike_send;
	this.ike_text  = ike_text;
	this.ike_data  = ike_data;

	// ASCII to hex for cluster message
	function ascii2hex(str) { 
		var array = [];

		for (var n = 0, l = str.length; n < l; n ++) {
			var hex = str.charCodeAt(n);
			array.push(hex);
		}

		return array;
	}

	// Pad string for IKE text screen length (20 characters)
	String.prototype.ike_pad = function() {
		var string = this;

		while (string.length < 20) {
			string = string + ' ';
		}

		return string;
	}

	// Refresh custom HUD
	function hud_refresh() {
		console.log('[IKE] Refreshing OBC HUD');

		obc_get('cons1');
		obc_get('time');

		var cons1 = parseFloat(omnibus.status.obc.consumption_1_mpg).toFixed(1);
		var ctmp  = Math.round(omnibus.status.temperature.coolant_c);

		ike_text(omnibus.status.obc.time+' C:'+cons1+' T:'+ctmp);
	}

	// Refresh OBC data
	function obc_refresh() {
		obc_get('auxheat1');
		obc_get('auxheat2');
		obc_get('cons1');
		obc_get('cons2');
		obc_get('date');
		obc_get('distance');
		obc_get('range');
		obc_get('speedavg');
		obc_get('speedlimit');
		obc_get('stopwatch');
		obc_get('temp_exterior');
		obc_get('time');
		obc_get('timer');
	}

	// OBC get
	function obc_get(value) {
		var src = 0x3B; // GT
		var dst = 0x80; // IKE

		// Determine desired value to get 
		if (value == 'time') {
			var msg       = [0x41, 0x01, 0x01];
			var obc_value = 'Time';
		}

		else if (value == 'date') {
			var msg       = [0x41, 0x02, 0x01];
			var obc_value = 'Date';
		}

		else if (value == 'temp_exterior') {
			var msg       = [0x41, 0x03, 0x01];
			var obc_value = 'Exterior temp';
		}

		else if (value == 'cons1') {
			var msg       = [0x41, 0x04, 0x01];
			var obc_value = 'Average consumption 1';
		}

		else if (value == 'cons2') {
			var msg       = [0x41, 0x05, 0x01];
			var obc_value = 'Average consumption 2';
		}

		else if (value == 'range') {
			var msg       = [0x41, 0x06, 0x01];
			var obc_value = 'Range';
		}

		else if (value == 'distance') {
			var msg       = [0x41, 0x07, 0x01];
			var obc_value = 'Distance';
		}

		//else if (value == '') {
		//	var msg       = [0x41, 0x08, 0x01];
		//	var obc_value = '';
		//}

		else if (value == 'speedlimit') {
			var msg       = [0x41, 0x09, 0x01];
			var obc_value = 'Speed limit';
		}

		else if (value == 'speedavg') {
			var msg       = [0x41, 0x0A, 0x01];
			var obc_value = 'Average speed';
		}

		else if (value == 'timer') {
			var msg       = [0x41, 0x0E, 0x01];
			var obc_value = 'Timer';
		}

		else if (value == 'auxheat1') {
			var msg       = [0x41, 0x0F, 0x01];
			var obc_value = 'Aux heating timer 1';
		}

		else if (value == 'auxheat2') {
			var msg       = [0x41, 0x10, 0x01];
			var obc_value = 'Aux heating timer 2';
		}

		else if (value == 'stopwatch') {
			var msg       = [0x41, 0x1A, 0x01];
			var obc_value = 'Stopwatch';
		}

		console.log('[IKE] Getting OBC value %s', obc_value);

		var ibus_packet = {
			src: src, 
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// OBC reset
	function obc_reset(value) {
		var src = 0x3B; // GT
		var dst = 0x80; // IKE

		// Determine desired value to reset 
		if (value == 'speedavg') {
			var msg       = [0x41, 0x0A, 0x10];
			var obc_value = 'Average speed';

		} else if (value == 'cons1') {
			var msg       = [0x41, 0x04, 0x10];
			var obc_value = 'Average consumption 1';

		} else if (value == 'cons2') {
			var msg       = [0x41, 0x05, 0x10];
			var obc_value = 'Average consumption 2';

		} else if (value == 'speedlimitoff') {
			var msg       = [0x41, 0x09, 0x08];
			var obc_value = 'Speed limit off';

		} else if (value == 'speedlimiton') {
			var msg       = [0x41, 0x09, 0x04];
			var obc_value = 'Speed limit on';

		} else if (value == 'speedlimit') {
			var msg       = [0x41, 0x09, 0x20];
			var obc_value = 'Speed limit';
		}

		console.log('[IKE] Setting/resetting OBC value %s', obc_value);

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

		console.log('[IKE] Setting backlight to %s', value);

		// Convert the value to hex
		value = value.toString(16);

		// Will need to concat and push array for value
		var msg = [0x5C, value, 0x00];

		var ibus_packet = {
			src: src, 
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// OBC set clock
	function obc_clock(values) {
		var src = 0x3B; // GT
		var dst = 0x80; // IKE

		console.log('[IKE] OBC clock, day    : %s', values.day);
		console.log('[IKE] OBC clock, month  : %s', values.month);
		console.log('[IKE] OBC clock, year   : %s', values.year);
		console.log('[IKE] OBC clock, hour   : %s', values.hour);
		console.log('[IKE] OBC clock, minute : %s', values.minute);
	
		var date_msg         = [0x40, 0x02, values.day, values.month, values.year];
		var date_ibus_packet = {
			src: src, 
			dst: dst,
			msg: new Buffer(date_msg),
		}

		var time_msg         = [0x40, 0x01, values.hour, values.minute];
		var time_ibus_packet = {
			src: src, 
			dst: dst,
			msg: new Buffer(time_msg),
		}

		console.log(date_ibus_packet);
		console.log(time_ibus_packet);

		omnibus.ibus_connection.send_message(date_ibus_packet);
		omnibus.ibus_connection.send_message(time_ibus_packet);
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
		} else if (value == '2') {
			var msg       = [0x23, 0x62, 0x30, 0x37, 0x10];
			var obc_value = '2';
		}

		console.log('[IKE] OBC gong %s', obc_value);

		var ibus_packet = {
			src: src, 
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	function ike_text_urgent(message) {
		var src = 0x30; // ??
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

	function ike_text_urgent_off() {
		var src = 0x30; // ??
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
		var dst = 0x80; // IKE

		string = string.ike_pad();

		// Need to center and pad spaces out to 20 chars
		console.log('[IKE] Sending text to IKE: "%s"', string);

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

	// Loop to update text in the cluster
	function ike_text_loop() {
		console.log('[IKE] text loop');
		console.log(omnibus.status);
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
		console.log('[IKE] Sending IKE packet.');
		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// Handle incoming commands
	function ike_data(data) {
		console.log('[IKE] ike_data()');

		if (typeof data['obc-text'] !== 'undefined') {
			console.log('[IKE] IKE text string: \'%s\'', data['obc-text']);
			ike_text(data['obc-text']);
		}

		else if (typeof data['obc-get'] !== 'undefined') {
			console.log('[IKE] IKE OBC get: \'%s\'', data['obc-get']);
			if (data['obc-get'] == 'all')
				{ obc_refresh(); }
			else
				{ obc_get(data['obc-get']); }
		}

		else if (typeof data['obc-reset'] !== 'undefined') {
			console.log('[IKE] IKE OBC reset: \'%s\'', data['obc-reset']);
			if (data['obc-reset'] == 'all')
				{ obc_refresh(); }
			else
				{ obc_reset(data['obc-reset']); }
		}

		else if (data.command == 'obc_clock') {
			console.log('[IKE] IKE OBC set clock');
			obc_clock(data.values);
		}

		else if (typeof data['obc-time'] !== 'undefined') {
			console.log('[IKE] IKE OBC time: \'%s\'', data['obc-time']);
			obc_time(data['obc-time']);
		}

		else if (typeof data['obc-gong'] !== 'undefined') {
			console.log('[IKE] IKE OBC gong: \'%s\'', data['obc-gong']);
			obc_gong(data['obc-gong']);
		}

		else if (typeof data['ike-backlight'] !== 'undefined') {
			console.log('[IKE] IKE backlight: %s', data['ike-backlight']);
			ike_backlight(data['ike-backlight']);
		}

		else {
			console.log('[IKE] Unknown command');
		}

	}

	// Refresh OBC data once every half-second
	//setInterval(function() {
	//	if (omnibus.status.vehicle.ignition == 'run') {
	//		obc_refresh();
	//	}
	//}, 500);

	// Refresh OBC HUD once every 2 seconds
	setInterval(function() {
		if (omnibus.status.vehicle.ignition == 'run') {
			hud_refresh();
		}
	}, 2000);

}

module.exports = IKE;
