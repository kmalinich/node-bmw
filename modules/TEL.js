var module_name = __filename.slice(__dirname.length + 1, -3);

// Parse data sent from TEL module
function parse_out(data) {
	switch (data.msg[0]) {
		case 0x2B: // Broadcast: Indicator status
			data.command = 'bro';
			data.value   = 'indicator status';
			break;

		case 0x2C: // Broadcast: Telephone status
			data.command = 'bro';
			data.value   = 'telephone status TODO';

			// Bit0
			// 0 = Handsfree off
			// 1 = Handsfree on

			// Bit1
			// 0 = Telephone menu on board monitor or MID
			// 1 = active call

			// Bit2
			// 0 = Incoming call : false
			// 1 = Incoming call : true

			// Bit3
			// 0 - Phone screen disabled : false
			// 1 = Phone screen disabled : true

			// Bit4
			// 0 = Phone off
			// 1 = Phone on

			// Bit5
			// 0 = Phone inactive
			// 1 = Phone active

			// Bit6
			// 0 = Adapter not installed
			// 1 = Adapter installed
			break;

		default:
			data.command = 'unk';
			data.value   = Buffer.from(data.msg);
	}

	log.out(data);
}

module.exports = {
  parse_out          : (data) => { parse_out(data); },
  send_device_status : (module_name) => { bus_commands.send_device_status(module_name); },
}
