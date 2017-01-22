#!/usr/bin/env node

var TEL = function() {
	// Exposed data
	this.parse_data = parse_data;

	// Parse data sent from TEL module
	function parse_data(message) {
		// Init variables
		var command;
		var data;

		// Device status
		if (message[0] == 0x02) {
			if (message[1] == 0x00) {
				command = 'device status';
				data    = 'ready';
			}

			else if (message[1] == 0x01) {
				command = 'device status';
				data    = 'ready after reset';
			}
		}

		// Broadcast: indicator status
		else if (message[0] == 0x2B) {
			command = 'broadcast';
			data    = 'indicator status';
		}

		// Ignition status request
		else if (message[0] == 0x10) {
			command = 'request';
			data    = 'ignition status';
		}

		// Door/flap status request
		else if (message[0] == 0x79) {
			command = 'request';
			data    = 'door/flap status';
		}

		else {
			command = 'unknown';
			data    = Buffer.from(message);
		}

		console.log('[TEL]  Sent %s:', command, data);
	}
}

module.exports = TEL;
