var data = new Array();

module.exports = {
	// Emit a data event on each complete DBUS message
	parser : (buffer) => {
		// Mark last event time
		status.dbus.last_event = now();
		data.push(buffer.readUInt16LE(0, buffer.length));
		console.log(buffer);
		console.log(data);

		if (data.length >= 4) {
			// DBUS packet:
			// DST LEN MSG CHK
			var msg_dst;
			var msg_len; // Length is the length of the entire packet (this is different from IBUS/KBUS)
			var msg_msg;
			var msg_crc;

			// Data from stream, must be verified
			msg_dst = data[0];
			msg_len = data[1];

			var msg_dst_name = bus_modules.hex2name(msg_dst);

			if (data.length === msg_len) {
				// When we arrive at the complete message,
				// calculate our own CRC and compare it to
				// what the message is claiming it should be

				// Grab message (removing DST LEN and CHK)
				msg_msg = data.slice(2, data.length-1);

				// Grab message CRC (removing DST LEN and MSG)
				msg_crc = data[data.length-1];

				// Calculate CRC of received message
				var calc_crc = 0x00;
				calc_crc = calc_crc^msg_dst;
				calc_crc = calc_crc^msg_len;

				for (var byte = 0; byte < msg_msg.length; byte++) {
					calc_crc = calc_crc^msg_msg[byte];
				}

				console.log('[MSG PSBLE] %s (%s/%s/%s)', msg_dst_name, msg_len, data.length, msg_len+2);
				console.log('[MSG PSBLE] Message  : %s', msg_msg);
				console.log('[MSG PSBLE] Data     : %s', data.toString(16));
				console.log('[MSG PSBLE] Checksum : %s/%s', msg_crc.toString(16), calc_crc.toString(16));

				// If the shoe fits..
				if (calc_crc === msg_crc) {
					console.log(' ');
					console.log('[MSG FOUND] ===========================');
					console.log('[MSG FOUND] Destination : %s', msg_dst_name);
					console.log('[MSG FOUND] Length      : %s', msg_len);
					console.log('[MSG FOUND] Data        :', Buffer.from(msg_msg));
					console.log('[MSG FOUND] Checksum    : %s', msg_crc.toString(16));
					console.log('[MSG FOUND] ===========================');
					console.log(' ');

					var msg_obj = {
						crc : msg_crc,
						dst : {
							name : msg_dst_name,
							id   : msg_dst,
						},
						len : msg_len,
						msg : msg_msg,
					};

					// emitter.emit('data', msg_obj);
					// omnibus.data_handler.check_data(msg_obj);

					// Reset data var
					data = new Array();
				}
			}
			// else {
			// 	console.log('[ANALYZING] %s (%s/%s/%s)', msg_dst_name, msg_len, data.length, msg_len+2);
			// }
		}
	},

	create : (msg) => {
		//   1 + 1 + n + 1
		// DST LEN MSG CHK
		// ... or packet length + 3

		var buffer = Buffer.alloc((msg.msg.length+3));

		// Convert module names to hex codes
		buffer[0] = bus_modules.name2hex(msg.dst);
		buffer[1] = msg.msg.length+3;

		for (var i = 0; i < msg.msg.length; i++) {
			buffer[i+2] = msg.msg[i];
		}

		var crc = 0x00;
		for (var i = 0; i < msg.msg.length+2; i++) {
			crc ^= buffer[i];
		}

		buffer[msg.msg.length+2] = crc;

		return buffer;
	},
};
