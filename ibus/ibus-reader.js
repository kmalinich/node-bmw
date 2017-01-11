#!/usr/bin/env node

var ibus_interface = require('./ibus-interface.js');
var bus_modules    = require('../lib/bus-modules.js');

// IBUS connection
var ibus_connection = new ibus_interface();

// Events
process.on('SIGINT', on_signal_int);
ibus_connection.on('data', on_ibus_data);

function on_signal_int() {
	ibus_connection.shutdown(() => {
		process.exit();
	});
}

function on_ibus_data(data) {
	var module_src = bus_modules.hex2name(data.src);
	var module_dst = bus_modules.hex2name(data.dst);
	if (data.src == 0x00 && data.dst == 0x00) {
		console.log(data);
	}
	else {
		console.log('[ibus-reader] %s, %s,', data.src, data.dst, data.msg);
	}
}

function doibus() {
	console.log('[ibus-reader] Sending IHKA packet.');
	ibus_connection.send({
		src: 'DIA',
		dst: 'IHKA',
		msg: [0x0B, 0x03],
	});
}

// ibus_connection.startup();
// setInterval(doibus, 1000);
