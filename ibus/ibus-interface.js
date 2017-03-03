const serialport = require('serialport');
var byte_length  = serialport.parsers.ByteLength;

// Read/write queues
var queue_read  = [];
var active_read = false;

var queue_write  = [];
var active_write = false;

// Local data
var device      = '/dev/ibus';
var serial_port = new serialport(device, {
	autoOpen : false,
	parity   : 'even',
});

var parser = serial_port.pipe(new byte_length({length: 1}));

/*
 * Event handling
 */

// On port error
serial_port.on('error', function(error) {
	console.error('[IBUS:PORT]', error);
});

// On port open
serial_port.on('open', function() {
	console.log('[IBUS:PORT] Opened [%s]', device);
});

// On port close
serial_port.on('close', function() {
	console.log('[IBUS:PORT] Closed [%s]', device);
});

// Send the data to the parser
serial_port.on('data', (data) => {
	omnibus.protocol.parser(data);
});


// Return false if there's still something to write
function queue_busy() {
	if (typeof queue_write[0] !== 'undefined' && queue_write.length !== 0) {
		active_write = true;
	}
	else {
		active_write = false;
	}

	// console.log('[IBUS::QUE] Queue busy: %s', active_write);
	return active_write;
}

// Write the next message to the serial port
function write_message() {
	// Only write data if port is open
	if (!serial_port.isOpen) {
		console.log('[IBUS:RITE] Chilling until port is open');
		return;
	}

	// Do we need to wait longer?
	var time_now = now();
	if (now()-status.ibus.last_event < 20) {
		// Do we still have data?
		if (queue_busy()) {
			// console.log('[IBUS:RITE] Waiting for %s', time_now-status.ibus.last_event);
			setTimeout(() => {
				write_message();
			}, (20-(now()-status.ibus.last_event)));
		}
		else {
			console.log('[IBUS:RITE] Queue done');
		}
	}
	else {
		if (queue_busy()) {
			serial_port.write(queue_write[0], (error) => {
				if (error) { console.log('[IBUS:RITE] Failed : ', queue_write[0], error); }

				serial_port.drain((error) => {
					// console.log('[IBUS::DRN] %s message(s) remain(s)', queue_write.length);

					if (error) {
						console.log('[IBUS::DRN] Failed : ', queue_write[0], error);
					}
					else {
						// console.log('[IBUS:RITE] Success : ', queue_write[0]);

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
		status.ibus.last_event = now();

		// Open port if it is closed
		if (!serial_port.isOpen) {
			serial_port.open((error) => {
				if (error) {
					console.log('[IBUS:PORT]', error);
					callback();
				}
				else {
					console.log('[IBUS:PORT] Opened');
					omnibus.IKE.request('ignition');
					callback();
				}
			});
		}
		else {
			console.log('[IBUS:PORT] Already open');
			callback();
		}
	},

	// Close serial port
	shutdown : (callback) => {
		// Close port if it is open
		if (serial_port.isOpen) {
			serial_port.close((error) => {
				if (error) {
					console.log('[IBUS:PORT]', error);
					callback();
				}
				else {
					console.log('[IBUS:PORT] Closed');
					callback();
				};
			});
		}
		else {
			console.log('[IBUS:PORT] Already closed');
			callback();
		}
	},

	// Insert a message into the write queue
	send : (msg) => {
		// Generate IBUS message with checksum, etc
		queue_write.push(omnibus.protocol.create(msg));

		// console.log('[IBUS:SEND] Pushed data into write queue');
		if (active_write === false) {
			// console.log('[IBUS:SEND] Starting queue write');
			write_message();
		}
	},
};
