#!/usr/bin/env node

var CDC = function() {
	// Exposed data
	this.parse_in           = parse_in;
	this.parse_out          = parse_out;
	this.send_cd_status     = send_cd_status;
	this.send_device_status = send_device_status;

	// Parse data sent to CDC module
	function parse_in(data) {
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x01: // Request: device status
				command = 'request';
				value   = 'device status';

				// Send the ready packet since this module doesn't actually exist
				if (config.emulate.cdc === true) {
					send_device_status();
				}
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

			case 0x38:
				if (config.emulate.cdc === true) {
					command = 'request'
					value   = 'CD control status';

					// Do CDC->LOC CD status stop
					send_cd_status('stop');
				}
				break;

			default:
				command = 'unknown';
				value   = Buffer.from(data.msg);
				break;
		}

		console.log('[%s>%s] %s:', data.src.name, data.dst.name, command, value);
	}

	// Parse data sent from CDC module
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
				status.cdc.ready = true;
				command = 'device status';
				switch (data.msg[1]) {
					case 0x00:
						value = 'ready';
						break;
					case 0x01:
						value = 'ready after reset';
						break;
				}
				break;

			case 0x10: // Request: ignition status
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x16: // Request: odometer
				command = 'request';
				value   = 'odometer';
				break;

			case 0x39: // Broadcast: CD status
				command = 'broadcast';
				value   = 'CD status';
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

		console.log('[%s>%s] %s:', data.src.name, data.dst.name, command, value);
	}

	// CDC->LOC Device status ready
	function send_device_status() {
		var command = 'device status';
		var data;
		var msg;

		// Handle 'ready' vs. 'ready after reset'
		if (status.cdc.reset == true) {
			status.cdc.reset = false;
			data = 'ready after reset';
			msg  = [0x02, 0x01];
		}
		else {
			data = 'ready';
			msg  = [0x02, 0x00];
		}

		omnibus.ibus.send({
			src: 'CDC',
			dst: 'LOC',
			msg: msg,
		});

		console.log('[CDC->LOC] Sent %s:', command, data);
	}

	// CDC->RAD CD status
	function send_cd_status(status) {
		var command = 'CD status';
		var data;
		var msg;

		switch(status) {
			case 'stop':
				data = 'stop';
				msg  = [0x39, 0x00, 0x02, 0x00, 0x01, 0x00, 0x01, 0x01];
				break;
			case 'play':
				data = 'play';
				msg  = [0x39, 0x00, 0x02, 0x00, 0x01, 0x00, 0x01, 0x01];
				break;
		}

		omnibus.ibus.send({
			src: 'CDC',
			dst: 'RAD',
			msg: msg,
		});

		console.log('[CDC->RAD] Sent %s:', command, data);
	}
}

module.exports = CDC;
