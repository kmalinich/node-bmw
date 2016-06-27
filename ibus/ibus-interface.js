var serialport    = require('serialport');
var clc           = require('cli-color');
var util          = require('util');
var event_emitter = require('events').EventEmitter;
var ibus_protocol = require('./ibus-protocol.js');
var bus_modules   = require('../lib/bus-modules.js');

var Log           = require('log');
var log           = new Log('info');

log.on('line', function(line){
	console.log(line);
});

var ibus_interface = function(device_path) {

	// self reference
	var _self = this;

	// exposed data
	this.get_interface = get_interface;
	this.init_ibus     = init_ibus;
	this.close_ibus    = close_ibus;
	this.startup       = startup;
	this.shutdown      = shutdown;
	this.send_message  = send_message;

	// local data
	var serial_port;
	var parser;
	var device             = device_path;
	var last_activity_time = process.hrtime();
	var queue              = [];

	// implementation
	function init_ibus() {
		device      = '/dev/ttyUSB0'; 
		serial_port = new serialport.SerialPort(device, {
			baudRate : 9600,
			dataBits : 8,
			parity   : 'even',
			parser   : serialport.parsers.raw,
			rtscts   : true,
			stopBits : 1,
			vmin     : 100,
			vtime    : 0,
		}, false);

		serial_port.open(function(error) {
			if (error) {
				log.error('[ibus-interface] Failed to open: ' + error);
			} else {
				console.log('[ibus-interface] Port open [' + device + ']');
				_self.emit('port_open');

				serial_port.on('data', function(data) {
					//log.debug('[ibus-interface] Data on port: ', data);

					last_activity_time = process.hrtime();
				});

				serial_port.on('error', function(err) {
					log.error("[ibus-interface] Error", err);
					shutdown(startup);
				});

				parser = new ibus_protocol();
				parser.on('message', on_message);

				serial_port.pipe(parser);

				watch_for_empty_bus(process_write_queue);
			}
		});
	}

	function get_ht_diff_time(time) {
		// ts = [seconds, nanoseconds]
		var ts = process.hrtime(time);
		// convert seconds to miliseconds and nanoseconds to miliseconds as well
		return (ts[0] * 1000) + (ts[1] / 1000000);
	};

	function watch_for_empty_bus(workerFn) {        
		if (get_ht_diff_time(last_activity_time) >= 20) {
			workerFn(function success() {
				// operation is ready, resume looking for an empty bus
				setImmediate(watch_for_empty_bus, workerFn);
			});
		} else {
			// keep looking for an empty bus
			setImmediate(watch_for_empty_bus, workerFn);
		}
	}

	function process_write_queue(ready) {
		// noop on empty queue
		if (queue.length <= 0) {
			ready();
			return;
		}

		// process 1 message
		var data_buffer = queue.pop();

		log.debug(clc.blue('[ibus-interface] Write queue length: '), queue.length);

		serial_port.write(data_buffer, function(error, resp) {
			if (error) {
				log.error('[ibus-interface] Failed to write: ' + error);
			} else {
				// console.log('[ibus-interface]', clc.white('Wrote to device:'), data_buffer, resp);

				serial_port.drain(function(error) {
					log.debug(clc.white('Data drained'));

					// this counts as an activity, so mark it
					last_activity_time = process.hrtime();

					ready();
				});
				_self.emit('message_sent');
			}

		});
	}

	function close_ibus(callb) {
		serial_port.close(function(error) {
			if (error) {
				log.error('[ibus-interface] Error closing port: ', error);
				callb();
			} else {
				console.log('[ibus-interface] Port closed [' + device + ']');
				parser = null;
				callb();
			}
		});
	}

	function get_interface() {
		return serial_port;
	}

	function startup() {
		console.log('[ibus-interface] Starting IBUS interface.');
		init_ibus();
	}

	function shutdown(callb) {
		console.log('[ibus-interface] Shutting down IBUS device.');
		close_ibus(callb);
	}

	function on_message(msg) {
		log.debug('[ibus-interface] Raw message: ', msg.src, msg.len, msg.dst, msg.msg, '[' + msg.msg.toString('ascii') + ']', msg.crc);
		_self.emit('data', msg);
	}

	function send_message(msg) {
		var data_buffer = ibus_protocol.create_ibus_message(msg);

		// console.log('[send_message] Src :', bus_modules.get_module_name(msg.src.toString(16)));
		// console.log('[send_message] Dst :', bus_modules.get_module_name(msg.dst.toString(16)));
		log.debug('[ibus-interface] Send message: ', data_buffer);

		if (queue.length > 1000) {
			log.warning('[ibus-interface] Queue too large, dropping message..', data_buffer);
			return;
		}

		queue.unshift(data_buffer);
	}

};

util.inherits(ibus_interface, event_emitter);
module.exports = ibus_interface;
