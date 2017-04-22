const serialport = require('serialport');
const log_src = 'ibus';

var queue_write  = [];
var active_write = false;

if (config.interface.ibus !== null) {
	// Local data
	var serial_port = new serialport(config.interface.ibus, {
		autoOpen : false,
		parity   : 'even',
		rtscts   : true,
	});

	/*
	 * Event handling
	 */

	// On port error
	serial_port.on('error', (error) => {
		log.msg({
			src : log_src,
			msg : 'Port error: '+error,
		});
	});

	// Send the data to the parser
	serial_port.on('data', (data) => {
		for (var byte = 0; byte < data.length; byte++) {
			omnibus.ibus.protocol.parser(data[byte]);
		}
	});

	serial_port.on('close', () => {
		log.msg({
			src : log_src,
			msg : 'Port closed: '+config.interface.ibus,
		});
	});
}


// Return false if there's still something to write
function queue_busy() {
	active_write = typeof queue_write[0] !== 'undefined' && queue_write.length !== 0;

	// log.msg({
	// 	src : log_src,
	// 	msg : 'Queue busy: '+active_write,
	// });
	return active_write;
}

// Write the next message to the serial port
function write_message() {
	// Only write data if port is open
	if (!serial_port.isOpen) {
		log.msg({
			src : log_src,
			msg : 'Waiting for port to open',
		});
		return;
	}

	if (queue_busy()) {
		serial_port.write(queue_write[0], (error) => {
			if (error) {
				log.msg({
					src : log_src,
					msg : 'Write failed: '+error+' '+queue_write[0],
				});
			}

			serial_port.drain((error) => {
				// log.msg({
				// 	src : log_src,
				// 	msg : queue_write.length+' message(s) remain(s)',
				// });

				if (error) {
					log.msg({
						src : log_src,
						msg : 'Drain failed: '+error+' '+queue_write[0],
					});
				}
				else {
					// log.msg({
					// 	src : log_src,
					// 	msg : 'Drain success: '+queue_write[0],
					// });

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
		status.ibus.last_event = now();

		if (config.interface.ibus === null) {
			callback();
			return;
		}

		// Open port if it is closed
		if (!serial_port.isOpen) {
			serial_port.open((error) => {
				if (error) {
					log.msg({
						src : log_src,
						msg : 'Port error: '+error,
					});
					callback();
				}
				else {
					// On port open
					log.msg({
						src : log_src,
						msg : 'Port opened: '+config.interface.ibus,
					});

					serial_port.set({
						cts : true,
						dsr : true,
						rts : true,
					}, () => {
						log.msg({
							src : log_src,
							msg : 'Port options set',
						});
						callback();
						omnibus.IKE.request('ignition');
						bus_commands.request_device_status('IKE', 'RAD');
					});
				}
			});
		}
		else {
			log.msg({
				src : log_src,
				msg : 'Port already open',
			});
			callback();
		}
	},

	// Close serial port
	shutdown : (callback) => {
		if (config.interface.ibus === null) {
			callback();
			return;
		}

		// Close port if it is open
		if (serial_port.isOpen) {
			serial_port.close((error) => {
				if (error) {
					log.msg({
						src : log_src,
						msg : 'Port error: '+error,
					});
					if (typeof callback === 'function') { callback(); }
				}
				else {
					// On port close
					if (typeof callback === 'function') { callback(); }
				};
			});
		}
		else {
			log.msg({
				src : log_src,
				msg : 'Port already closed',
			});
			if (typeof callback === 'function') { callback(); }
		}
	},

	// Insert a message into the write queue
	send : (msg) => {
		if (config.interface.ibus === null) {
			return;
		}

		// Generate KBUS message with checksum, etc
		queue_write.push(omnibus.ibus.protocol.create(msg));

		// log.msg({
		// 	src : log_src,
		// 	msg : 'Send: Pushed data into write queue',
		// });

		if (!active_write) {
			// log.msg({
			// 	src : log_src,
			// 	msg : 'Send: Starting write queue',
			// });
			write_message();
		}
	},
};
