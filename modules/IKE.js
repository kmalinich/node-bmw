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
	this.ike_data  = ike_data;
	this.ike_send  = ike_send;
	this.ike_text  = ike_text;
	this.obc_data   = obc_data;

	// Handle incoming commands
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
			console.log('[IKE] ike_data(): Unknown command');
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

	// Pad string for IKE text screen length (20 characters)
	String.prototype.ike_pad = function() {
		var string = this;

		while (string.length < 20) {
			string = string + ' ';
		}

		return string;
	}

	// Refresh OBC HUD once every 2 seconds, if ignition is in 'run'
	setInterval(function() {
		if (omnibus.status.vehicle.ignition == 'run') {
			hud_refresh();
		}
	}, 2000);

	// Refresh custom HUD
	function hud_refresh() {
		console.log('[IKE] Refreshing OBC HUD');

		// Request consumption 1 and time
		obc_data('get', 'cons1');
		obc_data('get', 'time');

		var cons1 = parseFloat(omnibus.status.obc.consumption_1_mpg).toFixed(1);
		var ctmp  = Math.round(omnibus.status.temperature.coolant_c);

		ike_text(omnibus.status.obc.time+' C:'+cons1+' T:'+ctmp);
	}

	// Refresh OBC data
	function obc_refresh() {
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

		console.log('[IKE] Doing \'%s\' on OBC value \'%s\'', action, value);

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

		console.log('[IKE] Setting LCD screen backlight to %s', value);

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

	// Pretend to be IKE saying the car is on
	function ike_ignition(value) {
		var src = 0x80; // IKE 
		var dst = 0xBF; // GLO 
		var cmd = 0x11; // Ignition status

		// Init status variable
		var status;

		console.log('[IKE] Claiming ignition is \'%s\'', value);

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

		console.log('[IKE] Setting OBC clock to \'%s/%s/%s %s:%s\'', data.day, data.month, data.year, data.hour, data.minute);

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

		console.log('[IKE] OBC gong %s', obc_value);

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
		var dst = 0x80; // IKE

		string = string.ike_pad();

		// Need to center and pad spaces out to 20 chars
		console.log('[IKE] Sending text to IKE screen: \'%s\'', string);

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
		console.log('[IKE] Sending IKE packet');
		omnibus.ibus_connection.send_message(ibus_packet);
	}

}

module.exports = IKE;
