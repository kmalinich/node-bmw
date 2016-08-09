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

// Test number for bitmask
function bit_test(num, bit) {
	if ((num & bit) != 0) { return true; }
	else { return false; }
}

var CDC = function(omnibus) {

	// Self reference
	var _self = this;

	// Exposed data
	this.send_device_status_ready = send_device_status_ready;
	this.send_cd_status_play      = send_cd_status_play;


	// CDC->RAD Device status ready
	function send_device_status_ready() {
		console.log('[CDC->LOC] Sending device status ready');

		var src = 0x18; // CDC
		var dst = 0xFF; // LOC
    var msg = [0x02, 0x01];

		var ibus_packet = {
			src: src, 
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

	// CDC->RAD CD status playing
	function send_cd_status_play() {
		console.log('[CDC->RAD] Sending CD status playing');

		var src = 0x18; // CDC
		var dst = 0x68; // RAD
    var msg = [0x39, 0x02, 0x09, 0x00, 0x01, 0x00, 0x01, 0x00];

		var ibus_packet = {
			src: src, 
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus_connection.send_message(ibus_packet);
	}

}

module.exports = CDC;
