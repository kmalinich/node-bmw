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

		omnibus.ibus.interface.send({
			src: 'CCM',
			dst: 'EWS',
			msg: cmd,
		});
	}

	// Parse data sent from EWS module
	function parse_out(data) {
		switch (data.msg[0]) {
			case 0x02: // Broadcast: device status
				switch (data.msg[1]) {
					case 0x00:
						data.command = 'bro';
						data.value   = 'device status ready';
						break;

					case 0x01:
						data.command = 'bro';
						data.value   = 'device status ready after reset';
						break;
				}
				break;

			case 0x10: // Request: ignition status
				data.command = 'req';
				data.value   = 'ignition status';
				break;

			case 0x14: // Country coding request
				data.command = 'req';
				data.value   = 'country coding';
				break;

			case 0x16: // Odometer request
				data.command = 'req';
				data.value   = 'odometer';
				break;

			case 0x74: // Broadcast: immobiliser status
				data.command = 'bro';

				// Bitmask for data.msg[1]
				// 0x00 = no key detected
				// 0x01 = immobilisation deactivated
				// 0x04 = valid key detected

				// Key detected/vehicle immobilised
				switch (data.msg[1]) {
					case 0x00:
						data.value = 'no key';
						status.immobilizer.key_present = false;
						break;
					case 0x01:
						data.value = 'immobilisation deactivated';
						// status.immobilizer.key_present = null;
						status.immobilizer.immobilized = false;
						break;
					case 0x04:
						data.value = 'valid key';
						status.immobilizer.key_present = true;
						status.immobilizer.immobilized = false;
						break;
					default:
						data.value = Buffer.from([data.msg[1]]);
						break;
				}

				data.value = 'key presence : \''+data.value+'\'';
				log.out(data);

				// Start over again
				data.value = null;

				// Key number 255/0xFF = no key, vehicle immobilized
				if (data.msg[2] == 0xFF) {
					status.immobilizer.key_number = null;
					// status.immobilizer.immobilized = true;
				}
				else {
					status.immobilizer.key_number = data.msg[2];
				}

				data.value = 'key number : \''+status.immobilizer.key_number+'\'';
				break;

			case 0xA0: // Broadcast: diagnostic command acknowledged
				data.command = 'bro';
				data.value   = 'diagnostic command acknowledged';
				break;

			case 0xA2: // Broadcast: diagnostic command rejected
				data.command = 'bro';
				data.value   = 'diagnostic command rejected';
				break;

			case 0xFF: // Broadcast: diagnostic command not acknowledged
				data.command = 'bro';
				data.value   = 'diagnostic command not acknowledged';
				break;

			case 0x79: // Request: door/flap status
				data.command = 'req';
				data.value   = 'door/flap status';
				break;

			default:
				data.command = 'unk';
				data.value   = Buffer.from(data.msg);
				break;
		}

		log.out(data);
	}
}

module.exports = EWS;
