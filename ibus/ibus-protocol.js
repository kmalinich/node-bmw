'use strict';

module.exports = {
	parser: function() {
		var _self = this;
		var data  = new Buffer(0);

		return function(emitter, buffer) {
			data = Buffer.concat([data, buffer]);

			while (data.length >= 5) {
				var out = data.slice(0, length);
				data    = data.slice(length);

				emitter.emit('data', out);
			}
		};
	},

	ye_olde_parser : function() {
		console.log('[ibus_protocol] Processing chunk #     : ', _self._process_id);
		console.log('[ibus_protocol] Current buffer         : ', _self._buffer);
		console.log('[ibus_protocol] Current chunk          : ', chunk);

		_self._process_id++;

		_self._buffer = Buffer.concat([_self._buffer, chunk]);

		var current_chunk = _self._buffer;

		console.log('[ibus_protocol] Concated chunk         : ', current_chunk);

		// If current chunk is long enough
		// This assumption is based on the IBUS protocol
		//
		// Each message must have at least 5 parts:
		// SRC LEN DST DATA CHK
		if (current_chunk.length > 4) {
			console.log('[ibus_protocol] Analyzing chunk        : ', current_chunk);

			// Gather messages from current chunk
			var messages = [];

			var end_of_last_message = -1;

			var mSrc;
			var mLen;
			var mDst;
			var mMsg;
			var mCrc;

			// Look for messages in current chunk
			for (var i = 0; i < current_chunk.length - 5; i++) {
				mSrc = current_chunk[i + 0];
				mLen = current_chunk[i + 1];
				mDst = current_chunk[i + 2];

				// Test to see if have enough data for a complete message
				if (current_chunk.length >= (i + 2 + mLen)) {

					mMsg = current_chunk.slice(i + 3, i + 3 + mLen - 2);
					mCrc = current_chunk[i + 2 + mLen - 1];

					var crc = 0x00;

					crc = crc ^ mSrc;
					crc = crc ^ mLen;
					crc = crc ^ mDst;

					for (var j = 0; j < mMsg.length; j++) {
						crc = crc ^ mMsg[j];
					}

					if (crc === mCrc) {
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
					console.log('[ibus_protocol] Emitting message       : ', message.src, message.len, message.dst, message.msg, message.crc);
					_self.emit('message', message);
				});
			}

			// Push the remaining data back to the stream
			if (end_of_last_message !== -1) {
				// Push the remaining chunk from the end of the last valid message
				_self._buffer = current_chunk.slice(end_of_last_message);

				console.log('[ibus_protocol] Sliced data            : ', end_of_last_message, _self._buffer);
			}
		}

		console.log('[ibus_protocol]', 'Buffered messages size : ', _self._buffer.length);
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
