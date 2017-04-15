const serialport = require('serialport');

var queue_write  = [];
var active_write = false;

// Local data
var serial_port = new serialport(config.interface.kbus, {
	autoOpen : false,
	parity   : 'even',
	rtscts   : true,
});

/*
 * Event handling
 */

// On port error
serial_port.on('error', function(error) {
	console.error('[KBUS:PORT]', error);
});

// On port open
serial_port.on('open', function() {
	console.log('[KBUS:PORT] Opened [%s]', config.interface.kbus);

	serial_port.set({
		cts : true,
		dsr : false,
		rts : true,
	}, function() {
		console.log('[KBUS:PORT] Options set');
	});
});

// On port close
serial_port.on('close', function() {
	console.log('[KBUS:PORT] Closed [%s]', config.interface.kbus);
});

// Send the data to the parser
serial_port.on('data', (data) => {
	for (var byte = 0; byte < data.length; byte++) {
		omnibus.kbus.protocol.parser(data[byte]);
	}
});


// Return false if there's still something to write
function queue_busy() {
	if (typeof queue_write[0] !== 'undefined' && queue_write.length !== 0) {
		active_write = true;
	}
	else {
		active_write = false;
	}

	// console.log('[KBUS::QUE] Queue busy: %s', active_write);
	return active_write;
}

// Write the next message to the serial port
function write_message() {
	// Only write data if port is open
	if (!serial_port.isOpen) {
		console.log('[KBUS:RITE] Chilling until port is open');
		return;
	}

	if (queue_busy()) {
		serial_port.write(queue_write[0], (error) => {
			if (error) { console.log('[KBUS:RITE] Failed : ', queue_write[0], error); }

			serial_port.drain((error) => {
				// console.log('[KBUS::DRN] %s message(s) remain(s)', queue_write.length);

				if (error) {
					console.log('[KBUS::DRN] Failed : ', queue_write[0], error);
				}
				else {
					// console.log('[KBUS:RITE] Success : ', queue_write[0]);

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

module.exports = {
	/*
	 * Functions
	 */
	// Open serial port
	startup : (callback) => {
		// Last time any data did something
		status.kbus.last_event = now();

		// Open port if it is closed
		if (!serial_port.isOpen) {
			serial_port.open((error) => {
				if (error) {
					console.log('[KBUS:PORT]', error);
					callback();
				}
				else {
					console.log('[KBUS:PORT] Opened');

					callback();
				}
			});
		}
		else {
			console.log('[KBUS:PORT] Already open');
			callback();
		}
	},

	// Close serial port
	shutdown : (callback) => {
		// Close port if it is open
		if (serial_port.isOpen) {
			serial_port.close((error) => {
				if (error) {
					console.log('[KBUS:PORT]', error);
					callback();
				}
				else {
					console.log('[KBUS:PORT] Closed');
					callback();
				};
			});
		}
		else {
			console.log('[KBUS:PORT] Already closed');
			callback();
		}
	},

	// Insert a message into the write queue
	send : (msg) => {
		// Generate KBUS message with checksum, etc
		queue_write.push(omnibus.kbus.protocol.create(msg));

		// console.log('[KBUS:SEND] Pushed data into write queue');
		if (active_write === false) {
			// console.log('[KBUS:SEND] Starting queue write');
			write_message();
		}
	},
};
