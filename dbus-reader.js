#!/usr/bin/env node

var dbus_interface = require('./dbus/dbus-interface.js');
var bus_modules    = require('./lib/bus-modules.js');

// data
var dbus_connection = new dbus_interface();

// events
process.on('SIGINT', on_signal_int);
dbus_connection.on('data', on_dbus_data);

function on_signal_int() {
	dbus_connection.shutdown(function() {
		process.exit();
	});
}

function on_dbus_data(data) {
	var module_dst = bus_modules.get_module_name(data.dst);
	console.log('[ibus-reader] %s,', module_dst, data.msg);
}

function init() {
	dbus_connection.startup();
}

init();
