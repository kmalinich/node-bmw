#!/usr/bin/env node

// socket.io library
var socket_io = require('socket.io');

var socket_server = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.ibus2socket = ibus2socket;
	this.startup     = startup;

	var io;


	/*
	 * Functions
	 */

	function startup(callback) {
		console.log('[       WS] Starting up');
		io = new socket_io(omnibus.api_server);
		callback();

		/*
		 * Events
		 */

		io.on('error', function(error) {
			console.log('[       WS] Error caught in socket:\'%s\'', error);
		});

		// When a client connects
		io.on('connection', function(socket) {
			socket.emit('connect', { hello: 'world' });
			console.log('[       WS] Client connected');

			// Receive message from WebUI and send it over IBUS/KBUS
			socket.on('message', function(data) {
				// console.log('[       WS] Message received');

				// Parse incoming JSON into object
				var ibus_data = JSON.parse(data);

				var ibus_packet = {
					src : parseInt(ibus_data.src, 16),
					dst : parseInt(ibus_data.dst, 16),
					msg : new Buffer(ibus_data.msg),
				}

				// Get source and destination module name (for logging and to double-check)
				var src_name = omnibus.bus_modules.get_module_name(ibus_data.src);
				var dst_name = omnibus.bus_modules.get_module_name(ibus_data.dst);

				// Send the message
				// console.log('[       WS] [%s->%s] sending packet:', src_name, dst_name, ibus_packet.msg);

				omnibus.ibus_connection.send_message(ibus_packet);
			});

			socket.on('disconnect', function() {
				console.log('[       WS] Socket disconnected');
			});
		});

	}

	function ibus2socket(data) {
		// console.log('[       WS] Sending data to clients');
		try {
			io.emit('ibus-message', {
				src : omnibus.bus_modules.get_module_name(data.src),
				dst : omnibus.bus_modules.get_module_name(data.dst),
				msg : JSON.stringify(data.msg),
			});
		}
		catch (e) {
			console.log(e);
		}
	}

}

module.exports = socket_server;
