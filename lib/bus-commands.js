#!/usr/bin/env node

function send_device_status(src) {
	// Init variables
	var data;
	var msg;

	// Handle 'ready' vs. 'ready after reset'
	if (status[src].reset === true) {
		status[src].reset = false;
		msg = [0x02, 0x00];
	}
	else {
		msg = [0x02, 0x01];
	}

	omnibus.data_send.send({
		dst : 'GLO',
		msg : msg,
		src : src.toUpperCase(),
	});
}

module.exports = {
	send_device_status : send_device_status,
};
