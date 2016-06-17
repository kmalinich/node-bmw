#!/usr/bin/env node

var ibus_interface = require('./ibus/ibus-interface.js');
var bus_modules    = require('./lib/bus-modules.js');

// data
var ibus_connection = new ibus_interface();

// events
process.on('SIGINT', on_signal_int);
ibus_connection.on('data', on_ibus_data);

function on_signal_int() {
	ibus_connection.shutdown(function() {
		process.exit();
	});
}

function on_ibus_data(data) {
	var log_string = 'ibus_read,'+bus_modules.get_module_name(data.src)+','+bus_modules.get_module_name(data.dst)+','+data.msg+',';
	//console.log(log_string,data.msg);

	console.log(log_string,data.msg[0],data.msg);
}

function init() {
	ibus_connection.startup();
}

init();
