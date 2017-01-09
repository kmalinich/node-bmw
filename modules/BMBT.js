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

// Set a bit in a bitmask
function bit_set(num, bit) {
	num |= bit;
	return num;
}

var BMBT = function(omnibus) {
	// Self reference
	var _self = this;

	// Reset bit
	var reset = true;

	// Exposed data
	this.parse_in             = parse_in;
	this.parse_out            = parse_out;
	this.power_on_if_ready    = power_on_if_ready;
	this.request_rad_status   = request_rad_status;
	this.send_button          = send_button;
	this.send_cassette_status = send_cassette_status;
	this.send_device_status   = send_device_status;

	// Request RAD status every 10 seconds
	if (omnibus.status.vehicle.ignition == 'run' || omnibus.status.vehicle.ignition == 'accessory') {
		request_rad_status();
	}
	setInterval(() => {
		if (omnibus.status.vehicle.ignition == 'run' || omnibus.status.vehicle.ignition == 'accessory') {
			request_rad_status();
		}
	}, 10000);

	// Send device status every 10 seconds
	if (omnibus.status.vehicle.ignition == 'run' || omnibus.status.vehicle.ignition == 'accessory') {
		send_device_status();
	}
	setInterval(() => {
		if (omnibus.status.vehicle.ignition == 'run' || omnibus.status.vehicle.ignition == 'accessory') {
			send_device_status();
		}
	}, 10000);

	// Send the power on button command if needed/ready
	function power_on_if_ready() {
		// Debug logging
		// console.log('[ node-bmw] BMBT.power_on_if_ready(): evaluating');
		// console.log('[ node-bmw] BMBT.power_on_if_ready(): ignition      : \'%s\'', omnibus.status.vehicle.ignition);
		// console.log('[ node-bmw] BMBT.power_on_if_ready(): audio_control : \'%s\'', omnibus.status.audio.audio_control);
		// console.log('[ node-bmw] BMBT.power_on_if_ready(): dsp_ready     : \'%s\'', omnibus.status.audio.dsp_ready);
		// console.log('[ node-bmw] BMBT.power_on_if_ready(): rad_ready     : \'%s\'', omnibus.status.audio.rad_ready);

		if (
			(omnibus.status.vehicle.ignition == 'run' || omnibus.status.vehicle.ignition == 'accessory') &&
			omnibus.status.audio.audio_control == 'off' &&
			omnibus.status.audio.dsp_ready == true &&
			omnibus.status.audio.rad_ready == true
		) {
			send_button('power');
		}
	}

	// Parse data sent to BMBT module
	function parse_in(data) {
		// Init variables
		var src      = data.src.id;
		var dst      = data.dst;
		var message  = data.msg;

		var command;
		var value;

		switch (message[0]) {
			case 0x01: // Request: device status
				command = 'request';
				value   = 'device status';

				// Send the ready packet since this module doesn't actually exist
				send_device_status();
				break;

			case 0x02: // Device status
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

			case 0x4a: // Cassette control
				command = 'cassette control';
				value   = message[1];

				send_cassette_status();
				break;

			default:
				command = 'unknown';
				value   = new Buffer(data.msg);
				break;
		}

		console.log('[%s<-%s] %s:', data.dst.name, data.src.name, command, value);
	}

	// Parse data sent from BMBT module
	function parse_out(data) {
		// Init variables
		var src     = data.src.id;
		var dst     = data.dst;
		var message = data.msg;

		var command;
		var value;

		switch (message[0]) {
			case 0x01: // Request: device status
				command = 'request';
				value   = 'device status';
				break;

			case 0x02: // Device status
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

			case 0x32: // Broadcast: volume control
				command = 'broadcast';
				value   = 'volume control';
				break;

			case 0x4b: // Cassette status
				command = 'cassette status';
				value   = 'no tape';
				break;

			case 0x47: // Broadcast: BM status
				command = 'broadcast';
				value   = 'BM status';
				break;

			case 0x48: // Broadcast: BM button
				command = 'broadcast';
				value   = 'BM button';
				break;

			case 0x5d: // Request: light dimmer status
				command = 'request';
				value   = 'light dimmer status';
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

		console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
	}

	// Request status from RAD module
	function request_rad_status() {
		// Init variables
		var command = 'request device status';
		var src     = 0xF0; // BMBT
		var dst     = 0x68; // RAD

		var msg = [0x01];

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus.send_message(ibus_packet);

		// console.log('[BMBT->RAD] Sent %s:', command);
	}

	// Send ready or ready after reset
	function send_device_status() {
		// Init variables
		var command = 'device status';
		var src     = 0xF0; // BMBT
		var dst     = 0xBF; // GLO

		var data;
		var msg;

		// Handle 'ready' vs. 'ready after reset'
		if (reset == true) {
			data  = 'ready after reset';
			reset = false;
			msg   = [0x02, 0x01];
		}
		else {
			data  = 'ready';
			msg   = [0x02, 0x00];
		}

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(msg),
		}

		omnibus.ibus.send_message(ibus_packet);

		console.log('[BMBT->GLO] Sent %s:', command, data);
	}

	// Say we have no tape in the player
	function send_cassette_status() {
		// Init variables
		var src     = 0xF0; // BMBT
		var dst     = 0x68; // RAD
		var command = 0x4B; // Cassette status
		var packet  = [command, 0x05]; // No tape

		// Send message
		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(packet),
		}

		// Send the message
		console.log('[BMBT->RAD] Sending cassette status: no tape');

		omnibus.ibus.send_message(ibus_packet);
	}

	// Emulate button presses
	function send_button(button) {
		// Init variables
		var src     = 0xF0; // BMBT
		var dst     = 0x68; // RAD
		var command = 0x48; // Button action

		var button_down = 0x00;
		var button_hold;
		var button_up;

		// Switch statement to determine button, then encode bitmask
		switch (button) {
			case 'power':
				// Get down value of button
				button_down = bit_set(button_down, bit_1);
				button_down = bit_set(button_down, bit_2);

				// Generate hold and up values
				button_hold = bit_set(button_down, bit_6);
				button_up   = bit_set(button_down, bit_7);

				break;
		}

		console.log('[BMBT->RAD] Sending button down: %s', button);

		var packet_down = [command, button_down];
		var packet_up   = [command, button_up];

		// Send message
		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(packet_down),
		}

		// Send the down message
		omnibus.ibus.send_message(ibus_packet);

		// Prepare and send the up message after 150ms
		setTimeout(() => {
			console.log('[BMBT->RAD] Sending button up: %s', button);

			// Send message
			var ibus_packet = {
				src: src,
				dst: dst,
				msg: new Buffer(packet_up),
			}

			// Send the up message
			omnibus.ibus.send_message(ibus_packet);
		}, 150);
	}
}

module.exports = BMBT;
