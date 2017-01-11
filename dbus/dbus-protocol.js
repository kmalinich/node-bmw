#!/usr/bin/env node

var now  = require('performance-now');
var data = new Array();

function dbus_protocol(omnibus) {
	// Exported
	create = this.create;
	parser = this.parser;

	// Imported
	this.omnibus = omnibus;
}

// Emit a data event on each complete IBUS message
dbus_protocol.prototype.parser = function(buffer) {
	// Mark last event time
	this.omnibus.last_event_dbus = now();
	data.push(buffer.readUInt16LE(0, buffer.length));

	if (data.length >= 5) {
		// IBUS packet:
		// SRC LEN DST MSG CHK
		var msg_src;
		var msg_len; // Length is the length of the packet after the LEN byte (or the entire thing, minus 2)
		var msg_msg;
		var msg_crc;

		// Data from stream, must be verified
		msg_src = data[0];
		msg_len = data[1];

		var msg_src_name = this.omnibus.bus_modules.hex2name(msg_src);

		if (data.length-2 === msg_len) {
			// When we arrive at the complete message,
			// calculate our own CRC and compare it to
			// what the message is claiming it should be

			// Grab message (removing SRC LEN and CHK)
			msg_msg = data.slice(2, data.length-1);

			// Grab message CRC (removing SRC LEN and MSG)
			msg_crc = data[data.length-1];

			// Calculate CRC of received message
			var calc_crc = 0x00;
			calc_crc = calc_crc^msg_src;
			calc_crc = calc_crc^msg_len;

			for (var byte = 0; byte < msg_msg.length; byte++) {
				calc_crc = calc_crc^msg_msg[byte];
			}

			// console.log('[MSG PSBLE] %s (%s/%s/%s)', msg_src_name, msg_len, data.length, msg_len+1);
			// console.log('[MSG PSBLE] Message  : %s', msg_msg);
			// console.log('[MSG PSBLE] Data     : %s', data.toString(16));
			// console.log('[MSG PSBLE] Checksum : %s/%s', msg_crc.toString(16), calc_crc.toString(16));

			// If the shoe fits..
			if (calc_crc === msg_crc) {
				// console.log(' ');
				// console.log('[MSG FOUND] ===========================');
				// console.log('[MSG FOUND] Source      : %s', msg_src_name);
				// console.log('[MSG FOUND] Length      : %s', msg_len);
				// console.log('[MSG FOUND] Data        :', new Buffer(msg_msg));
				// console.log('[MSG FOUND] Checksum    : %s', msg_crc.toString(16));
				// console.log('[MSG FOUND] ===========================');
				// console.log(' ');

				var msg_obj = {
					crc : msg_crc,
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
		// else {
		//	console.log('[ANALYZING] %s (%s/%s/%s)', msg_src_name, msg_len, data.length, msg_len+2);
		// }
	}
};

dbus_protocol.prototype.create = function(msg) {
	//   1 + 1 + n + 1
	// DST LEN MSG CHK
	// ... or packet length + 3

	var buffer = Buffer.alloc((msg.msg.length+3));

	// Convert module names to hex codes
	buffer[0] = this.omnibus.bus_modules.name2hex(msg.dst);
	buffer[1] = msg.msg.length+3;

	for (var i = 0; i < msg.msg.length; i++) {
		buffer[i+2] = msg.msg[i];
	}

	var crc = 0x00;
	for (var i = 0; i < buffer.length-1; i++) {
		crc ^= buffer[i];
	}

	buffer[msg.msg.length+2] = crc;

	return buffer;
};

module.exports = dbus_protocol;
