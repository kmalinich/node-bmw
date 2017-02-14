#!/usr/bin/env node

const serialport = require('serialport');
var dbus = {
	protocol  : require('./dbus-protocol' ), // Protocol
};

// Read/write queues
var queue_read  = [];
var active_read = false;

var queue_write  = [];
var active_write = false;

// Local data
var device      = '/dev/dbus';
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
	console.error('[DBUS:PORT]', error);
});

// On port open
serial_port.on('open', function() {
	console.log('[DBUS:PORT] Opened [%s]', device);
});

// On port close
serial_port.on('close', function() {
	console.log('[DBUS:PORT] Closed [%s]', device);
});

// Send the data to the parser
serial_port.on('data', (data) => {
	dbus.protocol.parser(data);
});


// Return false if there's still something to write
function queue_busy() {
	if (typeof queue_write[0] !== 'undefined' && queue_write.length !== 0) {
		active_write = true;
	}
	else {
		active_write = false;
	}

	// console.log('[DBUS::QUE] Queue busy: %s', active_write);
	return active_write;
}

// Write the next message to the serial port
function write_message() {
	// Only write data if port is open
	if (!serial_port.isOpen()) {
		console.log('[DBUS:RITE] Chilling until port is open');
		return;
	}

	// Do we need to wait longer?
	var time_now = now();
	if (now()-status.dbus.last_event < 20) {
		// Do we still have data?
		if (queue_busy()) {
			// console.log('[DBUS:RITE] Waiting for %s', time_now-status.dbus.last_event);
			setTimeout(() => {
				write_message();
			}, (20-(now()-status.dbus.last_event)));
		}
		else {
			console.log('[DBUS:RITE] Queue done');
		}
	}
	else {
		if (queue_busy()) {
			serial_port.write(queue_write[0], (error) => {
				if (error) { console.log('[DBUS:RITE] Failed : ', queue_write[0], error); }

				serial_port.drain((error) => {
					// console.log('[DBUS::DRN] %s message(s) remain(s)', queue_write.length);

					if (error) {
						console.log('[DBUS::DRN] Failed : ', queue_write[0], error);
					}
					else {
						// console.log('[DBUS:RITE] Success : ', queue_write[0]);

						// Successful write, remove this message from the queue
						queue_write.splice(0, 1);

						// Do we still have data?
						if (queue_busy()) {
							write_message();
						}
					}
				});
			});
		}
	}
}

module.exports = {
	/*
	 * Functions
	 */
	// Open serial port
	startup : (callback) => {
		// Last time any data did something
		status.dbus.last_event = now();

		// Open port if it is closed
		if (!serial_port.isOpen()) {
			serial_port.open((error) => {
				if (error) {
					console.log('[DBUS:PORT]', error);
					callback();
				}
				else {
					console.log('[DBUS:PORT] Opened');
					callback();
				}
			});
		}
		else {
			console.log('[DBUS:PORT] Already open');
			callback();
		}
	},

	// Close serial port
	shutdown : (callback) => {
		// Close port if it is open
		if (serial_port.isOpen()) {
			serial_port.close((error) => {
				if (error) {
					console.log('[DBUS:PORT]', error);
					callback();
				}
				else {
					console.log('[DBUS:PORT] Closed');
					callback();
				};
			});
		}
		else {
			console.log('[DBUS:PORT] Already closed');
			callback();
		}
	},

	// Insert a message into the write queue
	send : (msg) => {
		// Generate DBUS message with checksum, etc
		queue_write.push(dbus.protocol.create(msg));

		// console.log('[DBUS:SEND] Pushed data into write queue');
		if (active_write === false) {
			// console.log('[DBUS:SEND] Starting queue write');
			write_message();
		}
	},
};
