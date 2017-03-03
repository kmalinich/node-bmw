var RAD = function() {
	// Exposed data
	this.led       = led;
	this.parse_out = parse_out;

	// Parse data sent from RAD module
	function parse_out(data) {
		// Init variables
		var command;
		var value;

		// Device status
		switch (data.msg[0]) {
			case 0x01: // Request: device status
				command = 'request';
				value   = 'device status';
				break;

			case 0x02: // Device status
				status.rad.ready = true;
				command = 'device status';

				switch (data.msg[1]) {
					case 0x00:
						value  = 'ready';
						break;
					case 0x01:
						value = 'ready after reset';

						// Attempt to send BMBT power button
						setTimeout(() => {
							omnibus.BMBT.power_on_if_ready();
						}, 2000);
						break;
				}
				break;

			case 0x10: // Ignition status request
				command = 'request';
				value   = 'ignition status';
				break;

			case 0x14: // Country coding request
				command = 'request';
				value   = 'country coding';
				break;

			case 0x16: // Odometer request
				command = 'request';
				value   = 'odometer';
				break;

			case 0x21: // Update menu text
				command = 'update';
				value   = 'menu text';
				break;

			case 0x23: // Update display text
				command = 'update';
				value   = 'display text';
				break;

			case 0x32: // Volume control
				command = 'volume control';
				value   = data.msg[1];
				break;

			case 0x36: // Audio control (i.e. source)
				command = 'audio control';

				switch (data.msg[1]) {
					case 0xAF:
						value = 'off';
						status.rad.audio_control = value;
						break;

					case 0xA1:
						value = 'tuner/tape';
						status.rad.audio_control = value;
						break;

					default:
						value = data.msg[1];
						status.rad.audio_control = value;
						break;
				}
				break;

			case 0x38: // CD control status request
				command = 'CD control status'
				value   = 'request';
				break;

			case 0x4A: // Cassette control
				command = 'cassette control';
				value   =  data.msg[1];
				break;

			case 0x46: // LCD control
				command = 'LCD control';
				value   = 'request';

				switch (data.msg[1]) {
					case 0x0E:
						value = 'off';
						break;

					default:
						value = data.msg[1];
						break;
				}
				break;

			case 0x79: // Door/flap status request
				command = 'request';
				value   = 'door/flap status';
				break;

			default:
				command = 'unknown';
				value   = Buffer.from(data.msg);
		}

		console.log('[%s>%s] %s:', data.src.name, data.dst.name, command, value);
	}

	// Turn on/off/flash the RAD LED by encoding a bitmask from an input object
	function led(object) {
		// Bitmask
		// 0x00 = all off
		// 0x01 = solid red
		// 0x02 = flash red
		// 0x04 = solid yellow
		// 0x08 = flash yellow
		// 0x10 = solid green
		// 0x20 = flash green

		// Initialize output byte
		var byte = 0x00;

		if (object.solid_red)    { byte = bitmask.bit_set(byte, bitmask.bit[0]); }
		if (object.flash_red)    { byte = bitmask.bit_set(byte, bitmask.bit[1]); }
		if (object.solid_yellow) { byte = bitmask.bit_set(byte, bitmask.bit[2]); }
		if (object.flash_yellow) { byte = bitmask.bit_set(byte, bitmask.bit[3]); }
		if (object.solid_green)  { byte = bitmask.bit_set(byte, bitmask.bit[4]); }
		if (object.flash_green)  { byte = bitmask.bit_set(byte, bitmask.bit[5]); }

		// Send message
		console.log('[node::RAD] Sending \'RAD LED\' packet');
		omnibus.ibus.send({
			src: 'TEL',
			dst: 'OBC',
			msg: [command, byte], // Turn on radio LED
		});
	}
}

module.exports = RAD;
