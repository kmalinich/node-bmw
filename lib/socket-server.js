#!/usr/bin/env node

// socket.io library
var socket_io = require('socket.io');

var socket_server = function(omnibus) {
	// Exposed data
	this.ibus2socket = ibus2socket;
	this.startup     = startup;

	var io;


	/*
	 * Functions
	 */

	function startup(callback) {
		console.log('[node:::WS] Started');
		io = new socket_io(omnibus.api_server);
		callback();

		/*
		 * Events
		 */

		io.on('error', function(error) {
			console.log('[node:::WS] Error caught in socket:\'%s\'', error);
		});

		// When a client connects
		io.on('connection', function(socket) {
			socket.emit('connect', { hello: 'world' });
			console.log('[node:::WS] Client connected');

			// Receive message from WebUI and send it over IBUS/KBUS
			socket.on('message', function(data) {
				console.log('[node:::WS] Sending packet');

				// Send the message
				omnibus.ibus.send(JSON.parse(data));
			});

			socket.on('disconnect', function() {
				console.log('[node:::WS] Socket disconnected');
			});
		});

	}

	function ibus2socket(data) {
		// console.log('[node:::WS] Sending data to clients');
		try {
			io.emit('ibus-message', {
				src : omnibus.bus_modules.hex2name(data.src),
				dst : omnibus.bus_modules.hex2name(data.dst),
				msg : JSON.stringify(data.msg),
			});
		}
		catch (e) {
			console.log(e);
		}
	}

	function status2socket() {
		// console.log('[node:::WS] Sending data to clients');
		try {
			io.emit('status', {
				status : omnibus.status,
			});
		}
		catch (e) {
			console.log(e);
		}
	}

}

module.exports = socket_server;
