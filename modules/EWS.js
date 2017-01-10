#!/usr/bin/env node

// npm libraries
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

var EWS = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.parse_out = parse_out;
	this.request   = request;

	// Request various things from EWS
	function request(value) {
		var cmd;
		console.log('[ node-bmw] Requesting \'%s\'', value);

		switch (value) {
			case 'immobiliserstatus':
				// cmd = [0x73, 0x00, 0x00, 0x80];
				cmd = [0x73];
				break;
		}

		omnibus.ibus.send({
			src: 'CCM',
			dst: 'EWS',
			msg: cmd,
		});
	}

	// Parse data sent from EWS module
	function parse_out(data) {
		// Init variables
		var src      = data.src.id;
		var dst      = data.dst;
		var message  = data.msg;

		var command;
		var value;

		switch (message[0]) {

			case 0x02: // Broadcast: device status
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

			case 0x10: // Request: ignition status
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x14: // Country coding request
				command = 'request';
				value   = 'country coding';
				break;

			case 0x16: // Odometer request
				command = 'request';
				value   = 'odometer';
				break;

			case 0x74: // Broadcast: immobiliser status
				// Init variables
				var value_1;
				var value_2;

				// Bitmask for message[1]
				// 0x00 = no key detected
				// 0x01 = immobilisation deactivated
				// 0x04 = valid key detected

				// Key detected/vehicle immobilised
				switch (message[1]) {
					case 0x00:
						value = 'no key';
						omnibus.status.immobilizer.key_present = false;
						break;
					case 0x01:
						value = 'immobilisation deactivated';
						// omnibus.status.immobilizer.key_present = null;
						omnibus.status.immobilizer.immobilized = false;
						break;
					case 0x04:
						value = 'valid key';
						omnibus.status.immobilizer.key_present = true;
						omnibus.status.immobilizer.immobilized = false;
						break;
					default:
						value = new Buffer([message[1]]);
						break;
				}
				command = 'key presence';
				console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
				value = null;

				// Key number 255/0xFF = no key, vehicle immobilized
				if (message[2] == 0xFF) {
					omnibus.status.immobilizer.key_number  = null;
					// omnibus.status.immobilizer.immobilized = true;
				}
				else {
					omnibus.status.immobilizer.key_number = message[2];
				}
				command = 'key number';
				console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, message[2]);
				value = null;
				break;

			case 0xA0: // Broadcast: diagnostic command acknowledged
				command = 'diagnostic command';
				value   = 'acknowledged';
				break;

			case 0xA2: // Broadcast: diagnostic command rejected
				command = 'diagnostic command';
				value   = 'rejected';
				break;

			case 0xFF: // Broadcast: diagnostic command not acknowledged
				command = 'diagnostic command';
				value   = 'not acknowledged';
				break;

			case 0x79: // Request: door/flap status
				command = 'request';
				value   = 'door/flap status';
				break;

			default:
				command = 'unknown';
				value   = new Buffer(message);
				break;
		}

		if (value !== null) {
			console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
		}
	}
}

module.exports = EWS;
