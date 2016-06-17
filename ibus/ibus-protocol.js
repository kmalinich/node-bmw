var util      = require('util');
var Transform = require('stream').Transform;
util.inherits(ibus_protocol, Transform);

var Log = require('log');
var log = new Log('info');
var clc = require('cli-color');

function ibus_protocol(options) {
	options = options || {};

	if (!(this instanceof ibus_protocol))
		return new ibus_protocol(options);

	Transform.call(this, options);
	this._buffer       = new Buffer(0);
	this._processId    = 0;
	this._isProcessing = false;
}

ibus_protocol.prototype._transform = function(chunk, encoding, done) {        
	var _self = this;

	if(_self._isProcessing === true) {
		log.error('[ibus_protocol]', clc.red('Error. This _transform function should NOT be running..'));
	}

	_self._isProcessing = true;

	log.debug('[ibus_protocol]', clc.white('Processing: '), _self._processId);
	log.debug('[ibus_protocol]', 'Current buffer: ', _self._buffer);
	log.debug('[ibus_protocol]', 'Current chunk: ', chunk);

	_self._processId++;

	_self._buffer = Buffer.concat([_self._buffer, chunk]);

	var cchunk = _self._buffer;

	log.debug('[ibus_protocol]', 'Concated chunk: ', cchunk);

	if (cchunk.length < 5) {
		// chunk too small, gather more data
	} else {
		log.debug('[ibus_protocol]', 'Analyzing: ', cchunk);

		// gather messages from current chunk
		var messages = [];

		var endOfLastMessage = -1;

		var mSrc;
		var mLen;
		var mDst;
		var mMsg;
		var mCrc;

		// look for messages in current chunk
		for (var i = 0; i < cchunk.length - 5; i++) {

			// BEGIN MESSAGE
			mSrc = cchunk[i + 0];
			mLen = cchunk[i + 1];
			mDst = cchunk[i + 2];

			// test to see if have enough data for a complete message
			if (cchunk.length >= (i + 2 + mLen)) {

				mMsg = cchunk.slice(i + 3, i + 3 + mLen - 2);
				mCrc = cchunk[i + 2 + mLen - 1];

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

					// mark end of last message
					endOfLastMessage = (i + 2 + mLen);

					// skip ahead
					i = endOfLastMessage - 1;
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
		if (endOfLastMessage !== -1) {
			// Push the remaining chunk from the end of the last valid Message
			_self._buffer = cchunk.slice(endOfLastMessage);

			log.debug('[ibus_protocol]',clc.yellow('Sliced data: '), endOfLastMessage, _self._buffer);
		} else {
			// Push the entire chunk
			if (_self._buffer.length > 500) {
				// Chunk too big? (overflow protection)
				log.warning('[ibus_protocol]','dropping some data..');
				_self._buffer = cchunk.slice(chunk.length - 300);
			}
		}
	}

	log.debug('[ibus_protocol]','Buffered messages size: ', _self._buffer.length);

	_self._isProcessing = false;

	done();
};

ibus_protocol.create_ibus_message = function(msg) {
	// 1 + 1 + 1 + msgLen + 1
	var packetLength = 4 + msg.msg.length;
	var buf = new Buffer(packetLength);

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
};

module.exports = ibus_protocol;
