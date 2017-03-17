var VID = function() {
	// Exposed data
	this.parse_out = parse_out;

	// Parse data sent from VID module
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

			case 0x12: // Request: IKE sensor status
				data.command = 'req';
				data.value   = 'IKE sensor status';
				break;

			case 0x14: // Country coding request
				data.command = 'req';
				data.value   = 'country coding';
				break;

			case 0x16: // Odometer request
				data.command = 'req';
				data.value   = 'odometer';
				break;

			case 0x4F: // RGB control (of LCD screen in dash)
				data.command = 'con';

				// On/off + input
				// Again, this is actually bitmask, but.. it's late
				// 0x00 : off
				// 0x01 : GT
				// 0x02 : TV
				// 0x04 : NAVJ
				// 0x10 : on
				switch (data.msg[1]) {
					case 0x00:
						data.value = 'LCD off';
						break;
					case 0x11:
						data.value = 'LCD on TV';
						break;
					case 0x12:
						data.value = 'LCD on GT';
						break;
					case 0x14:
						data.value = 'LCD on NAVJ';
						break;
					default:
						data.value = 'LCD on unknown \''+Buffer.from([data.msg[1]])+'\'';
						break;
				}

				// Assemble string
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
		}

		log.out(data);
	}
}

module.exports = VID;
