//var debug = true;
var debug = false;

var input_buffer   = new Array();
var process_buffer = new Array();
var error_current = 0;

function process() {
	// Grab current length
	const process_msg_len = process_buffer.length;

	// IBUS packet:
	// SRC LEN DST MSG CHK
	var msg_src;
	var msg_len; // Length is the length of the packet after the LEN byte (or the entire thing, minus 2)
	var msg_dst;
	var msg_msg;
	var msg_crc;

	// Data from stream, must be verified
	msg_src = process_buffer[0];
	msg_len = process_buffer[1];
	msg_dst = process_buffer[2];

	var msg_dst_name = bus_modules.hex2name(msg_dst);
	var msg_src_name = bus_modules.hex2name(msg_src);
	if (debug === true) {
		console.log('[MSG PSBLE] %s => %s', msg_src_name, msg_dst_name);
	}

	// Invalid message
	if (msg_dst_name === 'UNKNOWN') {
		error_current = error_current+1;
		if (debug === true) {
			console.log('[IBUS:PROT] error_current is now %s - invalid destination %s', error_current, msg_dst);
		}
		return 0;
	}

	if (msg_src_name === 'UNKNOWN') {
		error_current = error_current+1;
		if (debug === true) {
			console.log('[IBUS:PROT] error_current is now %s - invalid source %s', error_current, msg_src);
		}
		return 0;
	}

	// Don't have the whole message yet
	if (process_buffer.length-2 !== msg_len) {
		return 0;
	}

	// When we arrive at the complete message,
	// calculate our own CRC and compare it to
	// what the message is claiming it should be

	// Grab message (removing SRC LEN DST and CHK)
	msg_msg = process_buffer.slice(3, process_buffer.length-1);

	// Grab message CRC (removing SRC LEN DST and MSG)
	msg_crc = process_buffer[process_buffer.length-1];

	// Calculate CRC of received message
	var calc_crc = 0x00;
	calc_crc = calc_crc^msg_src;
	calc_crc = calc_crc^msg_len;
	calc_crc = calc_crc^msg_dst;

	for (var byte = 0; byte < msg_msg.length; byte++) {
		calc_crc = calc_crc^msg_msg[byte];
	}

	if (debug === true) {
		console.log('[MSG PSBLE] %s => %s (%s/%s/%s)', msg_src_name, msg_dst_name, msg_len, process_buffer.length, msg_len+2);
		console.log('[MSG PSBLE] Message  : %s', msg_msg);
		console.log('[MSG PSBLE] Data     : %s', process_buffer.toString(16));
		console.log('[MSG PSBLE] Checksum : %s/%s', msg_crc.toString(16), calc_crc.toString(16));
	}

	// If the shoe doesn't fit..
	if (calc_crc !== msg_crc) {
		error_current = error_current+1;
		if (debug === true) {
			console.log('[IBUS:PROT] error_current is now %s', error_current);
		}
		return 0;
	}

	if (debug === true) {
		console.log(' ');
		console.log('[MSG FOUND] ===========================');
		console.log('[MSG FOUND] Source      : %s', msg_src_name);
		console.log('[MSG FOUND] Destination : %s', msg_dst_name);
		console.log('[MSG FOUND] Length      : %s', msg_len);
		console.log('[MSG FOUND] Data        :', Buffer.from(msg_msg));
		console.log('[MSG FOUND] Checksum    : %s', msg_crc.toString(16));
		console.log('[MSG FOUND] ===========================');
		console.log(' ');
	}

	var msg_obj = {
		bus : 'ibus',
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

	// Skip GLO destination messages from IBUS, if KBUS is present
	if (msg_obj.dst.name != 'GLO') {
		omnibus.data_handler.check_data(msg_obj);
	}
	else if (msg_obj.dst.name == 'GLO' && config.interface.kbus === null) {
		omnibus.data_handler.check_data(msg_obj);
	}

	// Return true!
	error_current = 0;
	return process_msg_len;
};

// Exported functions
module.exports = {
	// Emit a data event on each complete IBUS message
	parser : (buffer) => {
		//status.ibus.last_event = now();

		if (debug === true) {
			console.log('n-buffer   :', buffer);
			console.log('i-buffer.l : %s', input_buffer.length);
			console.log('p-buffer.l : %s', process_buffer.length);
		}

		input_buffer.push(buffer);
		if (input_buffer.length < 5) {
			return;
		}

		// Buffer overflow?
		if (input_buffer.length > 80) {
			if (debug === true) {
				console.log('[IBUS:PROT] Input buffer too large (%s); clearing', input_buffer.length);
			}
			error_current  = 0;
			input_buffer   = [];
			process_buffer = [];
		}

		// If it's been too long since success, reset input_buffer
		if (error_current > 5) {
			if (debug === true) {
				console.log('[IBUS:PROT] Too many errors (%s); clearing input buffer', error_current);
			}
			error_current  = 0;
			input_buffer   = [];
			process_buffer = [];
			return;
		};

		process_buffer = input_buffer;
		var process_length = process();

		if (process_length === 0) {
			return;
		}

		if (debug === true) {
			console.log('[IBUS:PROT] PARSE OK - Splicing %s length', process_length);
		}

		// Mark last event time
		status.ibus.last_event = now();

		// Successful parse, remove this message from the queue
		input_buffer.splice(0, process_length);
	},

	create : (msg) => {
		//   1 + 1 + 1 + n + 1
		// SRC LEN DST MSG CHK
		// ... or packet length + 4

		var buffer = Buffer.alloc((msg.msg.length+4));

		// Convert module names to hex codes
		buffer[0] = bus_modules.name2hex(msg.src);
		buffer[1] = msg.msg.length+2;
		buffer[2] = bus_modules.name2hex(msg.dst);

		for (var i = 0; i < msg.msg.length; i++) {
			buffer[i+3] = msg.msg[i];
		}

		var crc = 0x00;
		for (var i = 0; i < buffer.length - 1; i++) {
			crc ^= buffer[i];
		}

		buffer[msg.msg.length+3] = crc;

		return buffer;
	},
};
