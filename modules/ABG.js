var ABG = function() {
	// Exposed data
	this.parse_data = parse_data;

	// Parse data sent from ABG module
	function parse_data(message) {
		// Init variables
		var command;
		var data;

		switch (message[0]) {
			case 0x02: // Device status
				switch (message[1]) {
					case 0x00:
						command = 'device status';
						data    = 'ready';
						break;

					case 0x01:
						command = 'device status';
						data    = 'ready after reset';
						break;
				}
				break;

			case 0x10: // Request: ignition status
				command = 'request';
				data    = 'ignition status';
				break;

			case 0x70: // Broadcast: Remote control central locking status
				command = 'broadcast';
				data    = 'remote control central locking status';
				break;

			case 0x79: // Request: door/flap status
				command = 'request';
				data    = 'door/flap status';
				break;

			default:
				command = 'unknown';
				data    = Buffer.from(message);
				break;
		}

		console.log('[ABG:::???] Sent %s:', command, data);
	}
}

module.exports = ABG;
