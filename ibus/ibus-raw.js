#!/usr/bin/env node

var clc           = require('cli-color');
var serialport    = require('serialport');


// local data
var parser;
var device      = '/dev/ttyUSB0';
var queue       = [];
var serial_port = new serialport(device, {
	autoOpen : false,
	baudRate : 9600,
	dataBits : 8,
	parity   : 'even',
	parser   : serialport.parsers.raw,
	rtscts   : true,
	stopBits : 1,
});

/*
 * Event handling
 */

// On port error
serial_port.on('error', function(error) {
	console.error('[INTF] Port error: %s', error);
});

// On port open
serial_port.on('open', function() {
	console.log('[INTF] Port open [%s]', device);
});

// On port close
serial_port.on('close', function() {
	console.log('[INTF] Port closed [%s]', device);
	parser = null;
});

// On data RX
serial_port.on('data', function(data) {
	console.log(data);
});

// Open serial port
function startup() {
	console.log('[INTF] Starting');

	// Open port if it is closed
	if (!serial_port.isOpen()) {
		console.log('[INTF] Opening port');
		serial_port.open();
	}
}

// Close serial port
function shutdown(callback) {
	console.log('[INTF] Ending');

	// Close port if it is open
	if (serial_port.isOpen()) {
		console.log('[INTF] Closing port');
		serial_port.close();
	}

	callback();
}

startup();
