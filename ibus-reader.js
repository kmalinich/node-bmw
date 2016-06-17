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
	var module_src = bus_modules.get_module_name(data.src);
	var module_dst = bus_modules.get_module_name(data.dst);
	console.log('[ibus-reader] %s, %s,', module_src, module_dst, data.msg);
}

function init() {
	ibus_connection.startup();
}

init();
