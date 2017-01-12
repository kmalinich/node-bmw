#!/usr/bin/env node

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
		send_device_status();
		request_rad_status();
	}
	setInterval(() => {
		if (omnibus.status.vehicle.ignition == 'run' || omnibus.status.vehicle.ignition == 'accessory') {
			send_device_status();
			request_rad_status();
		}
	}, 10000);

	// Send the power on button command if needed/ready
	function power_on_if_ready() {
		// Debug logging
		// console.log('[ node-bmw] BMBT.power_on_if_ready(): evaluating');
		// console.log('[ node-bmw] BMBT.power_on_if_ready(): ignition          : \'%s\'', omnibus.status.vehicle.ignition);
		// console.log('[ node-bmw] BMBT.power_on_if_ready(): dsp.ready         : \'%s\'', omnibus.status.dsp.ready);
		// console.log('[ node-bmw] BMBT.power_on_if_ready(): rad.audio_control : \'%s\'', omnibus.status.rad.audio_control);
		// console.log('[ node-bmw] BMBT.power_on_if_ready(): rad.ready         : \'%s\'', omnibus.status.rad.ready);

		if (
			(omnibus.status.vehicle.ignition == 'run' || omnibus.status.vehicle.ignition == 'accessory') &&
			omnibus.status.rad.audio_control === 'off' &&
			omnibus.status.dsp.ready === true &&
			omnibus.status.rad.ready === true
		) {
			send_button('power');
		}
	}

	// Parse data sent to BMBT module
	function parse_in(data) {
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x01: // Request: device status
				command = 'request';
				value   = 'device status';

				// Send the ready packet since this module doesn't actually exist
				send_device_status();
				break;

			case 0x02: // Device status
				switch (data.msg[1]) {
					case 0x00:
						value = 'ready';
						break;
					case 0x01:
						value = 'ready after reset';
						break;
				}
				break;

			case 0x4A: // Cassette control
				command = 'cassette control';
				value   = data.msg[1];

				send_cassette_status();
				break;

			default:
				command = 'unknown';
				value   = new Buffer(data.msg);
				break;
		}

		console.log('[%s>%s] %s:', data.src.name, data.dst.name, command, value);
	}

	// Parse data sent from BMBT module
	function parse_out(data) {
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x01: // Request: device status
				command = 'request';
				value   = 'device status';
				break;

			case 0x02: // Device status
				omnibus.status.bmbt.ready = true;
				command = 'device status';
				switch (data.msg[1]) {
					case 0x00:
						value   = 'ready';
						break;
					case 0x01:
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

			case 0x4B: // Cassette status
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

			case 0x5D: // Request: light dimmer status
				command = 'request';
				value   = 'light dimmer status';
				break;

			case 0x79: // Request: door/flap status
				command = 'request';
				value   = 'door/flap status';
				break;

			default:
				command = 'unknown';
				value   = new Buffer(data.msg);
				break;
		}

		console.log('[%s>%s] %s:', data.src.name, data.dst.name, command, value);
	}

	// Request status from RAD module
	function request_rad_status() {
		// Init variables
		var command = 'request device status';

		omnibus.ibus.send({
			src: 'BMBT',
			dst: 'RAD',
			msg: [0x01],
		});

		// console.log('[BMBT->RAD] Sent %s:', command);
	}

	// Send ready or ready after reset
	function send_device_status() {
		// Init variables
		var command = 'device status';

		var data;
		var msg;

		// Handle 'ready' vs. 'ready after reset'
		if (omnibus.status.bmbt.reset === true) {
			omnibus.status.bmbt.reset = false;
			data  = 'ready after reset';
			msg   = [0x02, 0x01];
		}
		else {
			data = 'ready';
			msg  = [0x02, 0x00];
		}

		omnibus.ibus.send({
			src: 'BMBT',
			dst: 'GLO',
			msg: msg,
		});

		console.log('[BMBT->GLO] Sent %s:', command, data);
	}

	// Say we have no tape in the player
	function send_cassette_status() {
		console.log('[BMBT->RAD] Sending cassette status: no tape');
		omnibus.ibus.send({
			src: 'BMBT',
			dst: 'RAD',
			msg: [0x4B, 0x05],
		});
	}

	// Emulate button presses
	function send_button(button) {
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

		// Init variables
		var command     = 0x48; // Button action
		var packet_down = [command, button_down];
		var packet_up   = [command, button_up];

		omnibus.ibus.send({
			src: 'BMBT',
			dst: 'RAD',
			msg: packet_down,
		});

		// Prepare and send the up message after 150ms
		setTimeout(() => {
			console.log('[BMBT->RAD] Sending button up: %s', button);
      omnibus.ibus.send({
        src: 'BMBT',
        dst: 'RAD',
        msg: packet_up,
      });
		}, 150);
	}
}

module.exports = BMBT;
