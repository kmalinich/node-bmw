#!/usr/bin/env node

var dbus_interface = require('./dbus-interface.js');
var bus_modules    = require('../lib/bus-modules.js');

// DBUS connection
var dbus_connection = new dbus_interface();

// Events
process.on('SIGINT', on_signal_int);
dbus_connection.on('data', on_dbus_data);

function on_signal_int() {
	dbus_connection.shutdown(() => {
		process.exit();
	});
}

function on_dbus_data(data) {
	if (data.src == 0x00 && data.dst == 0x00) {
		console.log(data);
	}
	else {
		console.log('[dbus-reader] %s, %s,', data.src, data.dst, data.msg);
	}
}

function dodbus() {
	console.log('[dbus-reader] Sending IHKA packet.');
	dbus_connection.send({
		src: 'DIA',
		dst: 'IHKA',
		msg: [0x0B, 0x03],
	});
}

// dbus_connection.startup();
// setInterval(dodbus, 1000);
