#!/usr/bin/env node

var kbus_interface = require('./kbus-interface.js');
var bus_modules    = require('../lib/bus-modules.js');

// KBUS connection
var kbus_connection = new kbus_interface();

// Events
process.on('SIGINT', on_signal_int);
kbus_connection.on('data', on_kbus_data);

function on_signal_int() {
	kbus_connection.shutdown(() => {
		process.exit();
	});
}

function on_kbus_data(data) {
	var module_src = bus_modules.hex2name(data.src);
	var module_dst = bus_modules.hex2name(data.dst);
	if (data.src == 0x00 && data.dst == 0x00) {
		console.log(data);
	}
	else {
		console.log('[kbus-reader] %s, %s,', data.src, data.dst, data.msg);
	}
}

function dokbus() {
	console.log('[kbus-reader] Sending IHKA packet.');
	kbus_connection.send({
		src: 'DIA',
		dst: 'IHKA',
		msg: [0x0B, 0x03],
	});
}

// kbus_connection.startup();
// setInterval(dokbus, 1000);
