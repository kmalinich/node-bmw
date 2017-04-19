var IHKA = function() {
	// Exposed data
	this.parse_out = parse_out;

	// Parse data sent from IHKA module
	function parse_out(data) {
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x02: // Broadcast: device status
				command = 'device status';
				switch (data.msg[1]) {
					case 0x00:
						value = 'ready';
						break;
					case 0x01:
						value = 'ready after reset';
						break;
					default:
						value = 'unknown';
				}
				break;
			case 0x10: // Request: ignition status
				command = 'request';
				value   = 'ignition status';
				break;
			case 0x12: // Request: IKE sensor status
				command = 'request';
				value   = 'temperature';
				break;
			case 0x71: // Request: rain sensor status
				command = 'request';
				value   = 'rain sensor status';
				break;
			case 0x79: // Door/flap status request
				command = 'request';
				value   = 'door/flap status';
				break;
			case 0x83: // AC compressor status
				command = 'broadcast';
				value   = 'AC compressor status';
				break;
			case 0xA0: // Diagnostic command replies
				command = 'diagnostic command';
				value   = 'acknowledged: '+data.msg;
				break;
			case 0xA2:
				command = 'diagnostic command';
				value   = 'rejected';
				break;
			case 0xFF:
				command = 'diagnostic command';
				value   = 'not acknowledged';
				break;
			default:
				command = 'unknown';
				value   = Buffer.from(data.msg);
		}

		console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
	}
}

module.exports = IHKA;
