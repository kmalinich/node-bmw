var bus_modules   = require('../lib/bus-modules.js');
var clc           = require('cli-color');
var event_emitter = require('events');
var ibus_protocol = require('./ibus-protocol.js');
var serialport    = require('serialport');
var util          = require('util');

var ibus_interface = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.startup      = startup;
	this.shutdown     = shutdown;
	this.send_message = send_message;

	// Local data
	var device      = '/dev/ttyUSB0';
	var queue       = [];
	var serial_port = new serialport(device, {
		autoOpen : false,
		lock     : false,
		parity   : 'even',
		parser   : ibus_protocol.parser(5), 
		rtscts   : true,
	});

	/*
	 * Event handling
	 */

	// On port error
	serial_port.on('error', function(error) {
		console.error('[  INTF  ] Port error : %s', error);
	});

	// On port open
	serial_port.on('open', function() {
		console.log('[  INTF  ] Port open [%s]', device);

		// Request ignition status
		omnibus.IKE.request('ignition');
		omnibus.IKE.request('sensor');
		omnibus.IKE.request('odometer');
		omnibus.IKE.request('vin');
	});

	// On port close
	serial_port.on('close', function() {
		console.log('[  INTF  ] Port closed [%s]', device);
		ibus_parser = null;
	});

	// When the parser sends a fully-formed message back
	serial_port.on('data', omnibus.data_handler.check_data);

	// Open serial port
	function startup() {
		console.log('[  INTF  ] Starting');

		// Open port if it is closed
		if (!serial_port.isOpen()) {
			console.log('[  INTF  ] Opening port');
			serial_port.open();
		}
	}

	// Close serial port
	function shutdown(callback) {
		console.log('[  INTF  ] Ending');

		// Close port if it is open
		if (serial_port.isOpen()) {
			console.log('[  INTF  ] Closing port');
			serial_port.close();
		}

		callback();
	}

	function send_message(msg) {
		var data_buffer = ibus_protocol.create_ibus_message(msg);

		// console.log('[INTF::SEND] SRC : ', bus_modules.get_module_name(msg.src.toString(16)));
		// console.log('[INTF::SEND] DST : ', bus_modules.get_module_name(msg.dst.toString(16)));
		// console.log('[INTF::SEND] MSG : ', data_buffer);

		serial_port.write(data_buffer, function(error, resp) {
			if (error) {
				console.log('[INTF::SEND] Failed to write : ', error);
			}

			// console.log('[  INTF  ]', clc.red('Wrote to device:'), data_buffer, resp);

			serial_port.drain(function(error) {
				// console.log('[INTF::SEND] Data drained');
			});

			_self.emit('message_sent');
		});
	}
};

util.inherits(ibus_interface, event_emitter);
module.exports = ibus_interface;
