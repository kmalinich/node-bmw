#!/usr/bin/env node

var MID = function() {
	// Exposed data
	this.parse_in           = parse_in;
	this.parse_out          = parse_out;
	this.send_device_status = send_device_status;

	// Parse data sent to MID module
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
						command = 'device status';
						value   = 'ready';
						break;

					case 0x01:
						command = 'device status';
						value   = 'ready after reset';
						break;
				}
				break;

			default:
				command = 'unknown';
				value   = Buffer.from(data.msg);
				break;
		}

		console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
	}

	// Parse data sent from MID module
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

			case 0x10: // Request: ignition status
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x32: // Volume buttons
				command = 'button';
				switch (data.msg[1]) {
					case 0x10:
						value = 'volume decrease 1 step';
						break;
					case 0x11:
						value = 'volume increase 1 step';
						break;
				}
				break;

			case 0x35: // Broadcast: car memory
				command = 'broadcast';
				value   = 'car memory';
				break;

			case 0x79: // Request: door/flap status
				command = 'request';
				value   = 'door/flap status';
				break;

			default:
				command = 'unknown';
				value   = Buffer.from(data.msg);
				break;
		}

		console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
	}

	// MID->GLO Device status ready
	function send_device_status() {
		// Init variables
		var command = 'device status';
		var data;
		var msg;

		// Handle 'ready' vs. 'ready after reset'
		if (status.mid.reset === true) {
			status.mid.reset = false;
			data = 'ready after reset';
			msg  = [0x02, 0x01];
		}
		else {
			data = 'ready';
			msg  = [0x02, 0x00];
		}

		console.log('[%s->%s] %s:', 'MID', 'GLO', command, data);
		omnibus.ibus.send({
			src: 'MID',
			dst: 'GLO',
			msg: msg,
		});
	}
}

module.exports = MID;
