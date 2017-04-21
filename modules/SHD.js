var module_name = 'shd';

// Parse data sent from module
function parse_out(data) {
	switch (data.msg[0]) {
		default:
			data.command = 'unk';
			data.value   = Buffer.from(data.msg);
	}

	log.out(data);
}

module.exports = {
  parse_out          : () => { parse_out(data); },
  send_device_status : () => { bus_commands.send_device_status(module_name); },
}
