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


var ANZV = function(omnibus) {

	// Self reference
	var _self = this;

	// Exposed data
	this.parse_data = parse_data;


	// Parse data sent by real ANZV module
	function parse_data(message) {
		// Init variables
		var command;

		// Device status
		if (message[0] == 0x02) {
			if      (message[1] == 0x00) { command = 'device status: ready'; }
			else if (message[1] == 0x01) { command = 'device status: ready after reset'; }
		}

		// Ignition status request
		else if (message[0] == 0x10) {
			command = 'ignition status request';
		}

		// Door/flap status request
		else if (message[0] == 0x79) {
			command = 'door/flap status request';
		}

		else {
			command = new Buffer(message);
		}	

		console.log('[ANZV] Sent %s', command);
	}
}

module.exports = ANZV;
