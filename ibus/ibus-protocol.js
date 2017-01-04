'use strict';

module.exports = {
	raw: function(emitter, buffer) {
		emitter.emit('data', buffer);
	},

	// Emit a data event every `length` bytes
	parser: function(length) {
		var data = new Buffer(0);

		return function(emitter, buffer) {
			data = Buffer.concat([data, buffer]);
			// console.log('[parser] Current buffer         : ', data);

			if (data.length >= length) {
				// console.log('[parser] Analyzing chunk        : ', data);

				// Gather messages from current chunk
				var messages = [];

				var end_of_last_message = -1;

				var msg_src;
				var msg_len;
				var msg_dst;
				var msg_msg;
				var msg_crc;

				// Look for messages in current chunk
				for (var i = 0; i < data.length - 5; i++) {
					msg_src = data[i+0];
					msg_len = data[i+1];
					msg_dst = data[i+2];

					// Test to see if have enough data for a complete message
					if (data.length >= (i+2+msg_len)) {
						msg_msg = data.slice(i+3, i+3+msg_len-2);
						msg_crc = data[i+2+msg_len-1];

						var crc = 0x00;

						crc = crc^msg_src;
						crc = crc^msg_len;
						crc = crc^msg_dst;

						for (var j = 0; j < msg_msg.length; j++) {
							crc = crc^msg_msg[j];
						}

						// THIS IS IMPORTANT!!
						// The IKE sensor status will look like 80 0a bf 13 00 00 00 00 00 00
						// and at some point, the checksum will look correct to the parser
						// So f**k that, no 0x00 checksums
						if (crc === msg_crc && crc !== 0x00) {
							messages.push({
								'id'  : Date.now(),
								'src' : msg_src.toString(16),
								'len' : msg_len.toString(16),
								'dst' : msg_dst.toString(16),
								'msg' : msg_msg,
								'crc' : msg_crc.toString(16)
							});

							// Mark end of last message
							end_of_last_message = (i + 2 + msg_len);

							// Skip ahead
							i = end_of_last_message - 1;
						}
					}
				}

				if (messages.length > 0) {
					messages.forEach((message) => {
						// var out = data.slice(0, length);
						// data    = data.slice(length);
						emitter.emit('data', message);

						// console.log('[parser] Emitting message       : ', message.src, message.len, message.dst, message.msg, message.crc);
					});
				}

				// Push the remaining data back to the stream
				if (end_of_last_message !== -1) {
					// Push the remaining chunk from the end of the last valid message
					data = data.slice(end_of_last_message);

					// console.log('[parser] Sliced data            : ', end_of_last_message, data);
				}
			}

			// console.log('[parser]', 'Buffered messages size : ', _self._buffer.length);
		}
	},

	create_ibus_message : function(msg) {
		//   1 + 1 + 1 + n + 1
		// SRC LEN DST MSG CHK
		// ... or packet length + 4

		var buffer = new Buffer((msg.msg.length+4));

		buffer[0] = msg.src;
		buffer[1] = msg.msg.length + 2;
		buffer[2] = msg.dst;

		for (var i = 0; i < msg.msg.length; i++) {
			buffer[3 + i] = msg.msg[i];
		}

		var crc = 0x00;
		for (var i = 0; i < buffer.length - 1; i++) {
			crc ^= buffer[i];
		}

		buffer[3 + msg.msg.length] = crc;

		return buffer;
	}
};
