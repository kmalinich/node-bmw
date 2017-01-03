var bus_modules   = require('../lib/bus-modules.js');
var clc           = require('cli-color');
var event_emitter = require('events');
var ibus_protocol = require('./ibus-protocol.js');
var serialport    = require('serialport');
var util          = require('util');

var ibus_interface = function(omnibus) {
	// Self reference
	var _self = this;

	// Read/write queues
	var queue_read  = [];
	var key_read    = 0;
	var active_read = false;

	var queue_write = [];
	var key_write   = 0;
	var active_write = false;


	// Exposed data
	this.active_read  = active_read;
	this.active_write = active_write;
	this.queue_read   = queue_read;
	this.queue_write  = queue_write;
	this.send_message = send_message;
	this.shutdown     = shutdown;
	this.startup      = startup;

	// Local data
	var device      = '/dev/bmw';
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
		console.error('[     INTF] Port error : %s', error);
	});

	// On port open
	serial_port.on('open', function() {
		console.log('[     INTF] Port open [%s]', device);

		// Request ignition status
		omnibus.IKE.request('ignition');
	});

	// On port close
	serial_port.on('close', function() {
		console.log('[     INTF] Port closed [%s]', device);
		ibus_parser = null;
	});

	// When the parser sends a fully-formed message back
	serial_port.on('data', omnibus.data_handler.check_data);


	/*
	 * Functions
	 */

	// Open serial port
	function startup(callback) {
		console.log('[     INTF] Starting up');

		// Open port if it is closed
		if (!serial_port.isOpen()) {
			console.log('[INTF:PORT] Opening');
			serial_port.open((error) => {
				if (error) {
					console.log('[INTF:PORT] Error opening: ', error);
					callback();
				}
				else {
					console.log('[INTF:PORT] Opened');
					callback();
				}
			});
		}
		else {
			console.log('[INTF:PORT] Already open');
			callback();
		}
	}

	// Close serial port
	function shutdown(callback) {
		console.log('[     INTF] Shutting down');

		// Close port if it is open
		if (serial_port.isOpen()) {
			serial_port.close((error) => {
				if (error) {
					console.log('[INTF:PORT] Error closing: ', error);
					callback();
				}
				else {
					console.log('[INTF:PORT] Closted');
					callback();
				};
			});
		}
		else {
			console.log('[INTF:PORT] Already closed');
			callback();
		}
	}

	// Write the next message to the serial port
	function write_message() {
		// Only write data if port is open
		if (serial_port.isOpen()) {
			if (typeof queue_write[key_write] !== 'undefined' && queue_write[key_write]) {
				active_write = false;

				serial_port.write(queue_write[key_write], (error) => {
					if (error) {
						console.log('[INTF:RITE] Failed : ', queue_write[key_write], error);
						// callback(false);
					}

					serial_port.drain((error) => {
						console.log('[INTF:RITE] Success : ', queue_write[key_write]);
						delete queue_write[key_write];
						key_write = ++key_write;
						// callback(true);
						if (typeof queue_write[key_write] !== 'undefined' && queue_write[key_write]) {
							write_message();
						}
						else {
							active_write = false;
							console.log('[INTF:RITE] Finished queue');
						}
					});
				});
			}
		}
		else {
			// Chill for a bit, then try again
			console.log('[INTF:RITE] Chilling until port is open');
			setTimeout(() => {
				if (typeof queue_write[key_write] !== 'undefined' && queue_write[key_write]) {
					write_message();
				}
				else {
					active_write = false;
					console.log('[INTF:RITE] Finished queue write');
				}
			}, 100);
		}
	}

	// Insert a message into the write queue
	function send_message(msg, callback) {
		var data_buffer = ibus_protocol.create_ibus_message(msg);
		queue_write.push(data_buffer);
		console.log('[INTF:SEND] Pushed data into write queue');
		if (active_write === false) {
			console.log('[INTF:SEND] Starting queue write');
			write_message();
		}
	}
}

util.inherits(ibus_interface, event_emitter);
module.exports = ibus_interface;
