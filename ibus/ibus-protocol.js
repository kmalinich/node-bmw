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
			console.log('[parser] Current buffer         : ', data);

			if (data.length >= length) {
				console.log('[parser] Analyzing chunk        : ', data);

				// Gather messages from current chunk
				var messages = [];

				var end_of_last_message = -1;

				var mSrc;
				var mLen;
				var mDst;
				var mMsg;
				var mCrc;

				// Look for messages in current chunk
				for (var i = 0; i < data.length - 5; i++) {
					mSrc = data[i + 0];
					mLen = data[i + 1];
					mDst = data[i + 2];

					// Test to see if have enough data for a complete message
					if (data.length >= (i + 2 + mLen)) {
						mMsg = data.slice(i + 3, i + 3 + mLen - 2);
						mCrc = data[i + 2 + mLen - 1];

						var crc = 0x00;

						crc = crc ^ mSrc;
						crc = crc ^ mLen;
						crc = crc ^ mDst;

						for (var j = 0; j < mMsg.length; j++) {
							crc = crc ^ mMsg[j];
						}

						// THIS IS IMPORTANT!!
						// The IKE sensor status will look like 80 0a bf 13 00 00 00 00 00 00 
						// and at some point, the checksum will look correct to the parser
						// So f**k that, no 0x00 checksums
						 if (crc === mCrc && crc != 0x00) {
							messages.push({
								'id'  : Date.now(),
								'src' : mSrc.toString(16),
								'len' : mLen.toString(16),
								'dst' : mDst.toString(16),
								'msg' : mMsg,
								'crc' : mCrc.toString(16)
							});

							// Mark end of last message
							end_of_last_message = (i + 2 + mLen);

							// Skip ahead
							i = end_of_last_message - 1;
						}
					}
				}

				if (messages.length > 0) {
					messages.forEach(function(message) {
						//var out = data.slice(0, length);
						//data = data.slice(length);
						emitter.emit('data', message);

						console.log('[parser] Emitting message       : ', message.src, message.len, message.dst, message.msg, message.crc);
					});
				}

				// Push the remaining data back to the stream
				if (end_of_last_message !== -1) {
					// Push the remaining chunk from the end of the last valid message
					data = data.slice(end_of_last_message);

					console.log('[parser] Sliced data            : ', end_of_last_message, data);
				}
			}

			//console.log('[parser]', 'Buffered messages size : ', _self._buffer.length);
		}
	},

	create_ibus_message : function(msg) {
		// 1 + 1 + 1 + msgLen + 1
		var packetLength = 4 + msg.msg.length;
		var buf          = new Buffer(packetLength);

		buf[0] = msg.src;
		buf[1] = msg.msg.length + 2;
		buf[2] = msg.dst;

		for (var i = 0; i < msg.msg.length; i++) {
			buf[3 + i] = msg.msg[i];
		}

		var crc = 0x00;
		for (var i = 0; i < buf.length - 1; i++) {
			crc ^= buf[i];
		}

		buf[3 + msg.msg.length] = crc;

		return buf;
	}
};
