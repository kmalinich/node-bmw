var bus_modules   = require('../lib/bus-modules.js');
var clc           = require('cli-color');
var event_emitter = require('events');
var ibus_protocol = require('./ibus-protocol.js');
var serialport    = require('serialport');
var util          = require('util');

var ibus_interface = function(omnibus) {
	// self reference
	var _self = this;

	// exposed data
	this.get_interface = get_interface;
	this.startup       = startup;
	this.shutdown      = shutdown;
	this.send_message  = send_message;

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

		parser = new ibus_protocol();
		parser.on('message', on_message);
		serial_port.pipe(parser);

		// Request ignition status
		//omnibus.IKE.request('ignition');	
	});

	// On port close
	serial_port.on('close', function() {
		console.log('[INTF] Port closed [%s]', device);
		parser = null;
	});

	// On data RX
	//serial_port.on('data', function(data) {
	//	 console.log('[INTF] Data on port: ', data);
	//});

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

	function get_interface() {
		return serial_port;
	}

	function on_message(msg) {
		// console.log('[INTF] Raw message: ', msg.src, msg.len, msg.dst, msg.msg, '[' + msg.msg.toString('ascii') + ']', msg.crc);
		_self.emit('data', msg);
	}

	function send_message(msg) {
		var data_buffer = ibus_protocol.create_ibus_message(msg);

		// console.log('[send_message] Src :', bus_modules.get_module_name(msg.src.toString(16)));
		// console.log('[send_message] Dst :', bus_modules.get_module_name(msg.dst.toString(16)));
		// console.log('[INTF] Send message: ', data_buffer);

		serial_port.write(data_buffer, function(error, resp) {
			if (error) {
				console.log('[INTF] Failed to write: ' + error);
			}

			//console.log('[INTF]', clc.red('Wrote to device:'), data_buffer, resp);

			serial_port.drain(function(error) {
				// console.log(clc.white('Data drained'));
			});

			_self.emit('message_sent');
		});
	}

};

util.inherits(ibus_interface, event_emitter);
module.exports = ibus_interface;
