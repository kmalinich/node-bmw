var module_name = 'dspc';

// Parse data sent to DSPC module
function parse_in(data) {
	switch (data.msg[0]) {
		case 0x01: // Request: device status
			data.command = 'req';
			data.value   = 'device status';

			// Send the ready packet since this module doesn't actually exist
			omnibus[module_name.toUpperCase()].send_device_status();
			break;

		case 0x02: // Device status
			switch (data.msg[1]) {
				case 0x00:
					data.command = 'device status';
					data.value   = 'ready';
					break;

				case 0x01:
					data.command = 'device status';
					data.value   = 'ready after reset';
					break;
			}
			break;

		default:
			data.command = 'unk';
			data.value   = Buffer.from(data.msg);
			break;
	}

	log.out(data);
}

// Parse data sent from DSPC module
function parse_out(data) {
	switch (data.msg[0]) {
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

module.exports = {
	parse_in           : () => { parse_in(data); },
	parse_out          : () => { parse_out(data); },
	send_device_status : () => { bus_commands.send_device_status(module_name); },
};
