#!/usr/bin/env node

var bus_modules = require('../lib/bus-modules.js');

var data_array = [0x80, 0x0A, 0xBF, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x43, 0x65, 0x18, 0x0A, 0x68, 0x39, 0x40, 0x09, 0x02, 0x01, 0x00, 0x03, 0x02, 0x08, 0x30, 0x19, 0x80, 0x1A, 0x37, 0x08, 0x4B, 0x45, 0x59, 0x20, 0x49, 0x4E, 0x20, 0x49, 0x47, 0x4E, 0x49, 0x54, 0x49, 0x4F, 0x4E, 0x20, 0x4C, 0x4F, 0x43, 0x4B, 0xE2, 0x3F, 0x23, 0xD0, 0x09, 0x00, 0x02, 0x00, 0x40, 0x01, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0x72, 0x4E, 0x21, 0x90, 0x01, 0x00, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x28, 0x16, 0x00, 0x00, 0x00, 0x13 ];

var length = 5;
var data   = new Array();

function add_data(buffer) {
	// console.log('[parser] Received buffer        : 0x%s', buffer.toString(16));

	data.push(buffer);
	if (data.length >= length) {
		// Gather messages from current chunk
		var messages = [];

		var end_of_last_message = -1;

		var msg_src;
		var msg_len;
		var msg_dst;
		var msg_msg;
		var msg_crc;

		// Look for messages in current chunk
		for (var i = 0; i < data.length-5; i++) {
			msg_src = data[i+0];
			msg_len = data[i+1];
			msg_dst = data[i+2];

			console.log('[ANALYZING] ===========================');
			console.log('[ANALYZING] Current size          : %s', data.length-5);
			console.log('[ANALYZING] Potential source      : 0x%s', msg_src.toString(16));
			console.log('[ANALYZING] Potential destination : 0x%s', msg_dst.toString(16));
			console.log('[ANALYZING] Potential length      : 0x%s', msg_len);
			console.log('[ANALYZING] ============================');
			console.log(' ');

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
				console.log('[MSG FOUND] Message found');
				console.log('[MSG FOUND] Source      : 0x%s', message.src.toString(16));
				console.log('[MSG FOUND] Destination : 0x%s', message.dst.toString(16));
				console.log('[MSG FOUND] Length      : 0x%s', message.len);
				console.log('[MSG FOUND] Data        : %s', message.msg.toString(16));
				console.log('[MSG FOUND] Checksum    : 0x%s', message.crc.toString(16));
				console.log(' ');

				// console.log('[parser] Emitting message       :', message.src, message.len, message.dst, message.msg, message.crc);
			});
		}

		// Push the remaining data back to the stream
		if (end_of_last_message !== -1) {
			// Push the remaining chunk from the end of the last valid message
			data = data.slice(end_of_last_message);
			// console.log('[parser] Sliced data            :', end_of_last_message, data);
		}
	}
	else {
		console.log('[ SKIPPING] Not enough for potential message');
	}
}

function dodata() {
	setTimeout((data_array) => {
		//var data_chunk = new Buffer(data_array[0]);
		var data_chunk = data_array[0];

		// console.log('adding data 0x%s', data_chunk.toString(16));

		add_data(data_chunk);
		data_array.splice(0, 1);
		if (typeof data_array[0] !== 'undefined' && data_array.length !== 0) {
			dodata();
		}
	}, 1000, data_array);
}

console.log('data array has %s entries', data_array.length);
dodata();
