#!/usr/bin/env node

var dbus_interface = require('./dbus-interface.js');
var bus_modules    = require('../lib/bus-modules.js');

// data
var dbus_connection = new dbus_interface();

// events
process.on('SIGINT', on_signal_int);
dbus_connection.on('data', on_dbus_data);

function on_signal_int() {
	dbus_connection.shutdown(() => {
		process.exit();
	});
}

function on_dbus_data(data) {
	var module_dst = bus_modules.hex2name(data.dst);
	console.log('[dbus-reader] %s,', module_dst, data.msg);
}

function init() {
	dbus_connection.startup();
}

function dodbus() {
	var packet      = [0x0b, 0x03];
	var dbus_packet = {
		dst: 0x5B,
		msg: new Buffer(packet),
	}

	// Send the message
	console.log('[dbus-reader] Sending IHKA packet.');
	dbus_connection.send_message(dbus_packet);
}


init();

setInterval(dodbus, 2000);
