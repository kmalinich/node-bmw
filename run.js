#!/usr/bin/env node

// npm libraries
var clc           = require('cli-color');
var dispatcher    = require('httpdispatcher');
var http          = require('http');
var query_string  = require('querystring');
var url           = require('url');
var wait          = require('wait.for');

// IBUS libraries
var ibus_interface = require('./ibus/ibus-interface.js');
var bus_modules    = require('./lib/bus-modules.js');
var GM             = require('./modules/GM.js');
var LCM            = require('./modules/LCM.js');

// WebSocket libraries
var socket_server = require('./lib/socket-server.js');

// IBUS connection handle
var ibus_connection = new ibus_interface();
var GM_connection   = new GM(ibus_connection);
var LCM_connection  = new LCM(ibus_connection);


// Startup function
function startup() {
	// Open serial port
	ibus_connection.startup();
}

// Shutdown function
function shutdown() {
	// Terminate connection
	ibus_connection.shutdown(function() {
		process.exit();
	});
}

function on_ibus_data(data) {
	var module_src = bus_modules.get_module_name(data.src);
	var module_dst = bus_modules.get_module_name(data.dst);
	// console.log('[ibus-reader] %s, %s,', module_src, module_dst, data.msg);
	socket_server.ibus_data(data);
}

// Events
process.on('SIGINT', shutdown);
ibus_connection.on('data', on_ibus_data);


// Start IBUS connection
startup();

// Start WebSocket server
socket_server.init(3002);


// Port 3001 listener for POST requests to modules
// This should be moved into it's own object

// GM POST request
dispatcher.onPost('/gm', function(request, response) {
	console.log('/gm POST');
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
	console.log(post);
	GM_connection.gm_bitmask_encode(post);

	response.end('Got POST message for GM\n');
});

// LCM POST request
dispatcher.onPost('/lcm', function(request, response) {
	console.log('/lcm POST');
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
	console.log(post);
	LCM_connection.lcm_bitmask_encode(post);

	response.end('Got POST message for LCM\n');
});

// Error
dispatcher.onError(function(req, res) {
	console.error('Error: 404');
	res.writeHead(404);
	res.end();
});

// Create web server
http.createServer(function (req, res) {
	console.log('%s Request: %s', req.method, req.url);
	dispatcher.dispatch(req, res);
}).listen(3001, '0.0.0.0');
