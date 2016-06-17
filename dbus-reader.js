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
	var log_string = 'dbus_read,'+bus_modules.get_module_name(data.src)+','+bus_modules.get_module_name(data.dst)+','+data.msg+',';
	//console.log(log_string,data.msg);

	console.log(log_string,data.msg[0],data.msg);
}

function init() {
	dbus_connection.startup();
}

init();
