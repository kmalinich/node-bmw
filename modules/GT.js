var module_name = 'gt';

// Parse data sent from GT module
function parse_out(data) {
	switch (data.msg[0]) {
		case 0x2B: // Broadcast: Indicator status
			data.command = 'bro';
			data.value   = 'indicator status';
			break;

		case 0x58: // Broadcast: Headlight wipe interval
			data.command = 'bro';
			data.value   = 'headlight wipe interval';
			break;

		default:
			data.command = 'unk';
			data.value   = Buffer.from(data.msg);
	}

	log.out(data);
}

module.exports = {
	parse_out          : () => { parse_out(data); },
	send_device_status : () => { bus_commands.send_device_status(module_name); },
};
