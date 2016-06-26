var util      = require('util');
var Transform = require('stream').Transform;
util.inherits(dbus_protocol, Transform);

var Log = require('log');
var log = new Log('info');
var clc = require('cli-color');

function dbus_protocol(options) {
	options = options || {};

	if (!(this instanceof dbus_protocol))
		return new dbus_protocol(options);

	Transform.call(this, options);
	this._buffer       = new Buffer(0);
	this._processId    = 0;
	this._is_processing = false;
}

dbus_protocol.prototype._transform = function(chunk, encoding, done) {        
	var _self = this;

	if(_self._is_processing === true) {
		log.error('[dbus_protocol]', clc.red('Error. This _transform function should NOT be running..'));
	}

	_self._is_processing = true;

	log.debug('[dbus_protocol]', clc.white('Processing: '), _self._processId);
	log.debug('[dbus_protocol]', 'Current buffer: ',        _self._buffer);
	log.debug('[dbus_protocol]', 'Current chunk: ',         chunk);

	_self._processId++;

	_self._buffer = Buffer.concat([_self._buffer, chunk]);

	var cchunk = _self._buffer;

	log.debug('[dbus_protocol]', 'Concated chunk: ', cchunk);

	if (cchunk.length < 5) {
		// chunk too small, gather more data
	} else {
		log.debug('[dbus_protocol]', 'Analyzing: ', cchunk);

		// gather messages from current chunk
		var messages = [];

		var end_of_last_message = -1;

		var mDst;
		var mLen;
		var mMsg;
		var mCrc;

		// look for messages in current chunk
		for (var i = 0; i < cchunk.length - 5; i++) {

			// BEGIN MESSAGE
			mLen = cchunk[i + 1];
			mDst = cchunk[i + 2];

			// test to see if have enough data for a complete message
			if (cchunk.length >= (i + 2 + mLen)) {

				mMsg = cchunk.slice(i + 3, i + 3 + mLen - 2);
				mCrc = cchunk[i + 2 + mLen - 1];

				var crc = 0x00;

				crc = crc ^ mDst;
				crc = crc ^ mLen;

				for (var j = 0; j < mMsg.length; j++) {
					crc = crc ^ mMsg[j];
				}

				if (crc === mCrc) {
					messages.push({
						'id'  : Date.now(),
						'dst' : mDst.toString(16),
						'len' : mLen.toString(16),
						'msg' : mMsg,
						'crc' : mCrc.toString(16)
					});

					// mark end of last message
					end_of_last_message = (i + 2 + mLen);

					// skip ahead
					i = end_of_last_message - 1;
				}
			}
			// END MESSAGE
		}

		if (messages.length > 0) {
			messages.forEach(function(message) {
				_self.emit('message', message);
			});
		}

		// Push the remaining data back to the stream
		if (end_of_last_message !== -1) {
			// Push the remaining chunk from the end of the last valid Message
			_self._buffer = cchunk.slice(end_of_last_message);

			log.debug('[dbus_protocol]', clc.yellow('Sliced data: '), end_of_last_message, _self._buffer);
		} else {
			// Push the entire chunk
			if (_self._buffer.length > 500) {
				// Chunk too big? (overflow protection)
				log.warning('[dbus_protocol]','dropping some data..');
				_self._buffer = cchunk.slice(chunk.length - 300);
			}
		}
	}

	log.debug('[dbus_protocol]', 'Buffered messages size: ', _self._buffer.length);

	_self._is_processing = false;

	done();
};

dbus_protocol.create_dbus_message = function(msg) {
	// DBUS does not have a 'source' value. (unlike IBUS). The sender is implied.
	//
	// DBUS packet length value is length of entire telegram,
	// whereas IBUS packet length value is the length of the telegram afterwards.
	//
	// DBUS: C8 10 A0 89 12 98 51 50 05 21 12 20 06 23 37 7E
	//       RX LA [----data-segment--------------------] CS
	//
	// IBUS: C8 0F 3F A0 89 12 98 51 50 05 21 12 20 06 23 37 5E
	//       TX LL RX [----data-segment--------------------] CS
	// 
	// IBUS:
	// TX = Sender address
	// LL = Length of following bytes (packet length - 2)
	// RX = Receiver address
	// ..Data..
	// CS = Checksum
	// 
	// DBUS:
	// RX = Receiver address
	// LA = Length of all bytes (entire packet)
	// ..Data..
	// CS = Checksum

	// Add 3 to the the length of the data portion to get the length of the entire telegram.
	// (We are adding RX, LA, and CS)
	var packet_length = 3 + msg.msg.length;
	var buf           = new Buffer(packet_length);

	buf[0] = msg.dst;
	buf[1] = packet_length; 

	for (var i = 0; i < msg.msg.length; i++) {
		buf[2 + i] = msg.msg[i];
	}

	var crc = 0x00;
	for (var i = 0; i < buf.length - 1; i++) {
		crc ^= buf[i];
	}

	buf[2 + msg.msg.length] = crc;

	return buf;
};

module.exports = dbus_protocol;
