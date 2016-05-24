#!/usr/bin/env node

var ibus_interface = require('./ibus-interface.js');
var ibus_modules   = require('./ibus-modules.js');

// config
var device = '/dev/cu.usbserial-47514789';

// data
var ibus_connection = new ibus_interface(device);

// events
process.on('SIGINT', on_signal_int);
ibus_connection.on('data', on_ibus_data);

function on_signal_int() {
	ibus_connection.shutdown(function() {
		process.exit();
	});
}

function on_ibus_data(data) {
	var log_string = 'ibus_read,'+ibus_modules.get_module_name(data.src)+','+ibus_modules.get_module_name(data.dst)+','+data.msg+',';
	console.log(log_string,data.msg);
}

function init() {
	ibus_connection.startup();
}

init();
