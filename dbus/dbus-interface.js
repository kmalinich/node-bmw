var serialport    = require('serialport');
var clc           = require('cli-color');
var util          = require('util');
var event_emitter = require('events').EventEmitter;
var dbus_protocol = require('./dbus-protocol.js');
var bus_modules   = require('../lib/bus-modules.js');
var Log           = require('log');
var log           = new Log('info');

log.on('line', function(line){
	console.log(line);
});

var dbus_interface = function(device_path) {

	// self reference
	var _self = this;

	// exposed data
	this.get_interface = get_interface;
	this.init_dbus     = init_dbus;
	this.close_dbus    = close_dbus;
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
	function init_dbus() {
		device      = '/dev/rfcomm0'; 
		serial_port = new serialport.SerialPort(device, {
			//rtscts   : true,
			baudRate : 9600,
			dataBits : 8,
			parity   : 'even',
			parser   : serialport.parsers.raw,
			stopBits : 1,
		}, false);

		serial_port.open(function(error) {
			if (error) {
				log.error('[dbus_interface] Failed to open: ' + error);
			} else {
				log.info('[dbus_interface] Port open [' + device + ']');
				_self.emit('port_open');

				serial_port.on('data', function(data) {
					//log.debug('[dbus_interface] Data on port: ', data);

					last_activity_time = process.hrtime();
				});

				serial_port.on('error', function(err) {
					log.error("[dbus_interface] Error", err);
					shutdown(startup);
				});

				parser = new dbus_protocol();
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

		log.debug(clc.blue('[dbus_interface] Write queue length: '), queue.length);

		serial_port.write(data_buffer, function(error, resp) {
			if (error) {
				log.error('[dbus_interface] Failed to write: ' + error);
			} else {
				// log.info('[dbus_interface]', clc.white('Wrote to device:'), data_buffer, resp);

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

	function close_dbus(callback) {
		serial_port.close(function(error) {
			if (error) {
				log.error('[dbus_interface] Error closing port: ', error);
				callback();
			} else {
				log.info('[dbus_interface] Port closed [' + device + ']');
				parser = null;
				callback();
			}
		});
	}

	function get_interface() {
		return serial_port;
	}

	function startup() {
		init_dbus();
	}

	function shutdown(callback) {
		log.info('[dbus_interface] Shutting down dbus device..');
		close_dbus(callback);
	}

	function on_message(msg) {
		log.debug('[dbus_interface] Raw message: ', msg.dst, msg.len, msg.msg, '[' + msg.msg.toString('ascii') + ']', msg.crc);
		_self.emit('data', msg);
	}

	function send_message(msg) {
		var data_buffer = dbus_protocol.create_dbus_message(msg);

		// log.info('[send_message] Dst :', bus_modules.get_module_name(msg.dst.toString(16)));
		log.debug('[dbus_interface] Send message: ', data_buffer);

		if (queue.length > 1000) {
			log.warning('[dbus_interface] Queue too large, dropping message..', data_buffer);
			return;
		}

		queue.unshift(data_buffer);
	}

};

util.inherits(dbus_interface, event_emitter);
module.exports = dbus_interface;
