var CDC = function() {
	// Exposed data
	this.parse_in           = parse_in;
	this.parse_out          = parse_out;
	this.send_cd_status     = send_cd_status;
	this.send_device_status = send_device_status;

	// Parse data sent to CDC module
	function parse_in(data) {
		// Init variables
		switch (data.msg[0]) {
			case 0x01: // Request: device status
				data.command = 'req';
				data.value = 'device status';

				// Send the ready packet since this module doesn't actually exist
				if (config.emulate.cdc === true) {
					send_device_status();
				}
				break;

			case 0x02: // Device status
				switch (data.msg[1]) {
					case 0x00:
						data.value = 'ready';
						break;
					case 0x01:
						data.value = 'ready after reset';
						break;
				}
				break;

			case 0x38:
				if (config.emulate.cdc === true) {
					data.command = 'req'
					data.value = 'CD control status';

					// Do CDC->LOC CD status stop
					send_cd_status('stop');
				}
				break;

			default:
				data.command = 'unk';
				data.value = Buffer.from(data.msg);
				break;
		}

		// log.out(data);
	}

	// Parse data sent from CDC module
	function parse_out(data) {
		// Init variables
		switch (data.msg[0]) {
			case 0x01: // Request: device status
				data.command = 'req';
				data.value = 'device status';
				break;

			case 0x02: // Device status
				status.cdc.ready = true;
				data.command = 'bro';
				data.value = 'device status ';
				switch (data.msg[1]) {
					case 0x00:
						data.value = data.value+'ready';
						break;
					case 0x01:
						data.value = data.value+'ready after reset';
						break;
				}
				break;

			case 0x10: // Request: ignition status
				data.command = 'req';
				data.value = 'ignition status';
				break;

			case 0x16: // Request: odometer
				data.command = 'req';
				data.value = 'odometer';
				break;

			case 0x39: // Broadcast: CD status
				data.command = 'bro';
				data.value = 'CD status';
				break;

			case 0x79: // Request: door/flap status
				data.command = 'req';
				data.value = 'door/flap status';
				break;

			default:
				data.command = 'unk';
				data.value = Buffer.from(data.msg);
				break;
		}

		log.out(data);
	}

	// CDC->LOC Device status ready
	function send_device_status() {
		var data;
		var msg;

		// Handle 'ready' vs. 'ready after reset'
		if (status.cdc.reset === true) {
			status.cdc.reset = false;
			msg = [0x02, 0x01];
		}
		else {
			msg = [0x02, 0x00];
		}

		omnibus.data_send.send({
			src: 'CDC',
			dst: 'LOC',
			msg: msg,
		});
	}

	// CDC->RAD CD status
	function send_cd_status(status) {
		var data;
		var msg;

		switch(status) {
			case 'stop':
				msg = [0x39, 0x00, 0x02, 0x00, 0x01, 0x00, 0x01, 0x01];
				break;
			case 'play':
				msg = [0x39, 0x00, 0x02, 0x00, 0x01, 0x00, 0x01, 0x01];
				break;
		}

		omnibus.data_send.send({
			src: 'CDC',
			dst: 'RAD',
			msg: msg,
		});
	}
}

module.exports = CDC;
