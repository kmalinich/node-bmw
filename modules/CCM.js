var CCM = function() {
	// Exposed data
	this.parse_out = parse_out;

	// Parse data sent from CCM module
	function parse_out(data) {
		return;
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x02: // Broadcast: device status
				if (data.msg[1] == 0x00) {
					command = 'device status';
					value   = 'ready';
				}

				else if (data.msg[1] == 0x01) {
					command = 'device status';
					value   = 'ready after reset';
				}
				break;

			case 0x10: // Request: ignition status
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x1A: // Broadcast: check control message
				command = 'check control message';
				value   = ''+data.msg+'';
				break;

			case 0x51: // Broadcast: check control sensors
				command = 'check control sensors';
				switch (data.msg[1]) {
					case 0x00:
						value = 'none';
						break;
					case 0x04:
						value = 'key in ignition';
						break;
					case 0x12:
						value = 'seatbelt not fastened';
						break;
					default:
						value = Buffer.from(data.msg[1]);
						break;
				}
				break;

			case 0x73: // Request: immobiliser status
				command = 'request';
				value   = 'immobiliser status';
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
}

module.exports = CCM;
