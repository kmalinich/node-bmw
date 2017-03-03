var VID = function() {
	// Exposed data
	this.parse_out = parse_out;

	// Parse data sent from VID module
	function parse_out(data) {
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x02: // Broadcast: device status
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

			case 0x12: // Request: IKE sensor status
				command = 'request';
				value   = 'IKE sensor status';
				break;

			case 0x14: // Country coding request
				command = 'request';
				value   = 'country coding';
				break;

			case 0x16: // Odometer request
				command = 'request';
				value   = 'odometer';
				break;

			case 0x4F: // RGB control (of LCD screen in dash)
				command = 'RGB control';

				// Init variables
				var value;

				// On/off + input
				// Again, this is actually bitmask, but.. it's late
				// 0x00 : off
				// 0x01 : GT
				// 0x02 : TV
				// 0x04 : NAVJ
				// 0x10 : on
				switch (data.msg[1]) {
					case 0x00:
						value = 'LCD off';
						break;
					case 0x11:
						value = 'LCD on TV';
						break;
					case 0x12:
						value = 'LCD on GT';
						break;
					case 0x14:
						value = 'LCD on NAVJ';
						break;
					default:
						value = Buffer.from([data.msg[1]]);
						break;
				}

				// Assemble string
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
				value   = Buffer.from(data.msg);
		}

		console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
	}
}

module.exports = VID;
