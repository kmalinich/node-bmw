const event_emitter = require('events');
const now           = require('performance-now')
const serialport    = require('serialport');
// Use of util.inherits like this is discouraged - FIX IT
const util          = require('util');

var ibus_interface = function(omnibus) {
	// Self reference
	var _self = this;

	var ibus_protocol = new (require('./ibus-protocol.js'))(omnibus);

	// Read/write queues
	var queue_read  = [];
	var active_read = false;

	var queue_write  = [];
	var active_write = false;

	// Last time any data did something
	omnibus.last_event = 0;

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
		parity   : 'even',
		parser   : serialport.parsers.byteLength(1),
	});

	/*
	 * Event handling
	 */

	// On port error
	serial_port.on('error', function(error) {
		console.error('[INTF:PORT]', error);
	});

	// On port open
	serial_port.on('open', function() {
		console.log('[INTF:PORT] Opened [%s]', device);

		// Get some data
		omnibus.IKE.obc_refresh();
	});

	// On port close
	serial_port.on('close', function() {
		console.log('[INTF:PORT] Closed [%s]', device);
	});

	// Send the data to the parser
	serial_port.on('data', (data) => {
		ibus_protocol.parser(data);
	});


	/*
	 * Functions
	 */

	// Open serial port
	function startup(callback) {
		// Open port if it is closed
		if (!serial_port.isOpen()) {
			serial_port.open((error) => {
				if (error) {
					console.log('[INTF:PORT]', error);
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
		// Close port if it is open
		if (serial_port.isOpen()) {
			serial_port.close((error) => {
				if (error) {
					console.log('[INTF:PORT]', error);
					callback();
				}
				else {
					console.log('[INTF:PORT] Closed');
					callback();
				};
			});
		}
		else {
			console.log('[INTF:PORT] Already closed');
			callback();
		}
	}

	// Return false if there's still something to write
	function queue_busy() {
		if (typeof queue_write[0] !== 'undefined' && queue_write.length !== 0) {
			active_write = true;
		}
		else {
			active_write = false;
		}

		// console.log('[INTF::QUE] Queue busy: %s', active_write);
		return active_write;
	}

	// Write the next message to the serial port
	function write_message() {
		// Only write data if port is open
		if (!serial_port.isOpen()) {
			console.log('[INTF:RITE] Chilling until port is open');
			return;
		}

		if (!queue_busy()) {
			console.log('[INTF:RITE] Queue done (1st)');
			return;
		}

		// Do we need to wait longer?
		var time_now = now();
		if (time_now-omnibus.last_event < 1.4) {
			console.log('[INTF:RITE] Waiting for the bus');
			// Do we still have data?
			if (queue_busy()) {
				write_message();
			}
			else {
				console.log('[INTF:RITE] Queue done (2nd)');
			}
		}
		else {
			serial_port.write(queue_write[0], (error) => {
				if (error) { console.log('[INTF:RITE] Failed : ', queue_write[0], error); }

				serial_port.drain((error) => {
					// console.log('[INTF::DRN] %s message(s) remain(s)', queue_write.length);

					if (error) {
						console.log('[INTF::DRN] Failed : ', queue_write[0], error);
					}
					else {
						// console.log('[INTF:RITE] Success : ', queue_write[0]);

						// Successful write, remove this message from the queue
						queue_write.splice(0, 1);

						// Do we still have data?
						if (queue_busy()) {
							write_message();
						}
						else {
							console.log('[INTF:RITE] Queue done (3rd)');
						}
					}
				});
			});
		}
	}

	// Insert a message into the write queue
	function send_message(msg, callback) {
		var data_buffer = ibus_protocol.create_ibus_message(msg);
		queue_write.push(data_buffer);

		// console.log('[INTF:SEND] Pushed data into write queue');
		if (active_write === false) {
			console.log('[INTF:SEND] Starting queue write');
			write_message();
		}
	}
}

util.inherits(ibus_interface, event_emitter);
module.exports = ibus_interface;
