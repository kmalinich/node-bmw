#!/usr/bin/env node

// npm libraries
var clc  = require('cli-color');
var dbus = require('dbus-native');
var wait = require('wait.for');

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


var CCM = function(omnibus) {

	// Self reference
	var _self = this;

	// Exposed data
	this.parse_data = parse_data;


	// Parse data sent by real CCM module
	function parse_data(message) {
		// Init variables
		var command;
		var data;

		switch (message[0]) {
			case 0x02: // Broadcast: device status
				if (message[1] == 0x00) {
					command = 'device status';
					data    = 'ready';
				}

				else if (message[1] == 0x01) {
					command = 'device status';
					data    = 'ready after reset';
				}
				break;
			case 0x10: // Request: ignition status
				command = 'request';
				data    = 'ignition status';
				break;
			case 0x1A: // Broadcast: check control message 
				command = 'check control message';
				data    = ''+message+'';
				break;
			case 0x51: // Broadcast: check control sensors
				command = 'check control sensors';
				data    = 'unknown';
				break;
			case 0x79: // Request: immobiliser status
				command = 'request';
				data    = 'immobiliser status';
				break;
			case 0x79: // Request: door/flap status
				command = 'request';
				data    = 'door/flap status';
				break;
			default:
				command = 'unknown';
				data    = new Buffer(message);
				break;
		}

		console.log('[CCM] Sent %s:', command, data);
	}
}

module.exports = CCM;
