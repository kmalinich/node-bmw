#!/usr/bin/env node

var protocol   = require('./kbus-protocol-dbg.js');
var serialport = require('serialport');

// local data
var parser;
var device      = '/dev/kbus';
var queue       = [];
var serial_port = new serialport(device, {
	autoOpen : false,
	baudRate : 9600,
	dataBits : 8,
	parity   : 'even',
	parser   : protocol.parser(5),
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
	console.log(data.toString());
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
