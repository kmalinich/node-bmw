#!/usr/bin/env node

var GT = function() {
	// Exposed data
	this.parse_data = parse_data;

	// Parse data sent from GT module
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

		// Ignition status request
		else if (message[0] == 0x10) {
			command = 'request';
			data    = 'ignition status';
		}

		// OBC value request
		else if (message[0] == 0x41) {
			command = 'request';
			data    = 'OBC value';
		}

		else if (message[0] == 0x5A) {
			command = 'request';
			data    = 'lamp status';
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

		// console.log('[GT]   Sent %s:', command, data);
	}
}

module.exports = GT;
