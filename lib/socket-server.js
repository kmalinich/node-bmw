#!/usr/bin/env node

var socket_server = function() {
	var data          = null;
	var timer_id      = null;
	var sockets       = [];
	var socket_server = null;
	var ws            = require('websocket.io');
	var http          = require('http');
	var fs            = require('fs');
	var url           = require('url');
	var domain        = require('domain');
	var req_domain    = domain.create();
	var socket_domain = domain.create();
	var http_domain   = domain.create();

	var socket_listen = function(port, ibus_connection) {
		console.log('[socket-server] Starting WebSocket server on port %s', port);

		socket_domain.on('error', function(err) {
			console.log('[socket-server] Error caught in socket domain:' + err);
		});

		socket_domain.run(function() { 
			socket_server = ws.listen(port);

			// Events
			socket_server.on('listening', function() {
				console.log('[socket-server] listening.');
			});

			// When a client connects, push them into the sockets array.
			socket_server.on('connection', function(socket) {
				console.log('[socket-server] Client connected.');
				sockets.push(socket);

				if (data == null) {
					console.log('[socket-server] Client data was null.');
				}

				socket.on('message', function(data) { 
					console.log('[socket-server] Message received.');

					// This whole apparatus is genuinely terrible but it actually works if you strictly use decimal...
					// I need to write some code for the webui to parse/handle the hex, pass it over the socket to this,
					// then assemble the ibus packet and send it.

					// Split string into array of strings
					var ibus_json_msg = ibus_json.msg.split(' ');
					// Convert array of strings into array of numbers
					var ibus_msg = [];
					for (var i = 0; i < ibus_json_msg.length; i++) {
						ibus_msg.push(parseInt(ibus_json_msg[i]));
					}

					var ibus_packet = JSON.parse(data);
					console.log(ibus_packet);

					var ibus_packet = {
						src: ibus_json.src,
						dst: ibus_json.dst,
						msg: new Buffer(ibus_msg),
					}

					// Send the message
					console.log('[socket-server] Sending IBUS packet.');
					ibus_connection.send_message(ibus_packet);
				});

				socket.on('close', function() {
					try {
						socket.close();
						socket.destroy();
						console.log('[socket-server] Socket closed.');

						for (var i = 0; i < sockets.length; i++) {
							if (sockets[i] == socket) {
								sockets.splice(i, 1);
								console.log('[socket-server] Removing socket from collection. Collection length: ' + sockets.length);
								break;
							}
						}

						if (sockets.length == 0) {
							clear_interval(timer_id);
							data = null;
						}
					}

					catch (e) {
						console.log(e);
					}

				});

			});  
		});      
	};

	ibus_data = function(data) {
		// If anybody's connected...
		if (sockets.length) {
			//console.log('[socket-server] Sending data: %s, %s', module_src, module_dst, data);
			// console.log('[socket-server] Sending IBUS data to clients.');

			// Loop through all active sockets and send the data
			for (i=0; i<sockets.length; i++) {
				try {
					sockets[i].send(JSON.stringify(data));
				}   
				catch (e) {
					console.log(e);                
				}
			}
		}
	};

	init = function(socket_port, ibus_connection) {
		socket_listen(socket_port, ibus_connection);
	};

	return {
		init      : init,
		ibus_data : ibus_data
	};

}();

module.exports = socket_server;
