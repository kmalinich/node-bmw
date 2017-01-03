#!/usr/bin/env node

var ibus_interface = require('./ibus-interface.js');
var bus_modules    = require('../lib/bus-modules.js');

// data
var ibus_connection = new ibus_interface();

// events
process.on('SIGINT', on_signal_int);
ibus_connection.on('data', on_ibus_data);

function on_signal_int() {
	ibus_connection.shutdown(() => {
		process.exit();
	});
}

function on_ibus_data(data) {
	var module_src = bus_modules.get_module_name(data.src);
	var module_dst = bus_modules.get_module_name(data.dst);
	if (data.src == 0x00 && data.dst == 0x00) {
		console.log(data);
	}
	else {
		console.log('[ibus-reader] %s, %s,', data.src, data.dst, data.msg);
	}
}

function init() {
	ibus_connection.startup();
}

init();

function doibus() {
	var packet      = [0x0b, 0x03];
	var ibus_packet = {
		src: 0x3F,
		dst: 0x5B,
		msg: new Buffer(packet),
	}

	// Send the message
	console.log('[ibus-reader] Sending IHKA packet.');
	ibus_connection.send_message(ibus_packet);
}


//setInterval(doibus, 1000);
