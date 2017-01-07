#!/usr/bin/env node

var now = require('performance-now');

function ibus_protocol(omnibus) {
	// Exported
	create_ibus_message = this.create_ibus_message;
	parser              = this.parser;

	// Imported
	this.omnibus = omnibus;

	// Tag last event time
	omnibus.last_event = now();
}

// Emit a data event on each complete IBUS message
ibus_protocol.prototype.parser = function() {
	// Mark last event time
	this.omnibus.last_event = now();

	var data = new Array();

	return function(buffer) {
		this.omnibus.last_event = now();
		console.log('[IBUS:PRSR] Received data:', buffer);
		data.push(buffer);

		if (data.length >= length) {
			// IBUS packet:
			// SRC LEN DST MSG CHK
			var msg_src;
			var msg_len; // Length is the length of the packet after the LEN byte (or the entire thing, minus 2)
			var msg_dst;
			var msg_msg;
			var msg_crc;

			// Data from stream, must be verified
			msg_src = data[0];
			msg_len = data[1];
			msg_dst = data[2];

			var msg_dst_name = this.omnibus.bus_modules.hex2name(msg_dst);
			var msg_src_name = this.omnibus.bus_modules.hex2name(msg_src);

			if (data.length-2 === msg_len) {
				// When we arrive at the complete message,
				// calculate our own CRC and compare it to
				// what the message is claiming it should be

				// Grab message (removing SRC LEN DST and CHK)
				msg_msg = data.slice(3, data.length-1);

				// Grab message CRC (removing SRC LEN DST and MSG)
				msg_crc = data[data.length-1];

				// Calculate CRC of received message
				var calc_crc = 0x00;
				calc_crc = calc_crc^msg_src;
				calc_crc = calc_crc^msg_len;
				calc_crc = calc_crc^msg_dst;

				for (var byte = 0; byte < msg_msg.length; byte++) {
					calc_crc = calc_crc^msg_msg[byte];
				}

				console.log('[MSG PSBLE] %s => %s (%s/%s/%s)', msg_src_name, msg_dst_name, msg_len, data.length, msg_len+2);
				console.log('[MSG PSBLE] Message  : %s', msg_msg);
				console.log('[MSG PSBLE] Data     : %s', data.toString(16));
				console.log('[MSG PSBLE] Checksum : %s/%s', msg_crc.toString(16), calc_crc.toString(16));

				// If the shoe fits..
				if (calc_crc === msg_crc) {
					console.log(' ');
					console.log('[MSG FOUND] ===========================');
					console.log('[MSG FOUND] Source      : %s', msg_src_name);
					console.log('[MSG FOUND] Destination : %s', msg_dst_name);
					console.log('[MSG FOUND] Length      : %s', msg_len);
					console.log('[MSG FOUND] Data        :', new Buffer(msg_msg));
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
						src : {
							name : msg_src_name,
							id   : msg_src,
						},
					};

					// emitter.emit('data', msg_obj);
					this.omnibus.data_handler.check_data(msg_obj);

					// Reset data var
					data = new Array();
				}
			}
			else {
				console.log('[ANALYZING] %s => %s (%s/%s/%s)', msg_src_name, msg_dst_name, msg_len, data.length, msg_len+2);
			}
		}
	}
};

ibus_protocol.prototype.create_ibus_message = function(msg) {
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
};

module.exports = ibus_protocol;
