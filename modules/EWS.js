var EWS = function() {
	// Exposed data
	this.parse_out = parse_out;
	this.request   = request;

	// Request various things from EWS
	function request(value) {
		var cmd;
		console.log('[node::EWS] Requesting \'%s\'', value);

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
						status.immobilizer.key_present = false;
						break;
					case 0x01:
						value = 'immobilisation deactivated';
						// status.immobilizer.key_present = null;
						status.immobilizer.immobilized = false;
						break;
					case 0x04:
						value = 'valid key';
						status.immobilizer.key_present = true;
						status.immobilizer.immobilized = false;
						break;
					default:
						value = Buffer.from([message[1]]);
						break;
				}
				command = 'key presence';
				console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
				value = null;

				// Key number 255/0xFF = no key, vehicle immobilized
				if (message[2] == 0xFF) {
					status.immobilizer.key_number  = null;
					// status.immobilizer.immobilized = true;
				}
				else {
					status.immobilizer.key_number = message[2];
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
				value   = Buffer.from(message);
				break;
		}

		if (value !== null) {
			console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
		}
	}
}

module.exports = EWS;
