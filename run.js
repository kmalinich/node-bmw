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
var data_handler   = require('./ibus/data-handler.js');
var bus_modules    = require('./lib/bus-modules.js');
var GM             = require('./modules/GM.js');
var IKE            = require('./modules/IKE.js');
var LCM            = require('./modules/LCM.js');

// WebSocket libraries
var socket_server = require('./lib/socket-server.js');

// Vehicle status object
var vehicle_status = require('./lib/vehicle-status.js');

// IBUS connection handle
var ibus_connection   = new ibus_interface();

// IBUS module connection handles
// var GM_connection     = new GM(ibus_connection);
var LCM_connection    = new LCM(ibus_connection);
var IKE_connection    = new IKE(ibus_connection, vehicle_status);

// Data handler
//var ibus_data_handler = new ibus_data(ibus_connection, bus_modules, GM_connection, IKE_connection, LCM_connection);
var data_handler_connection = new data_handler(ibus_connection, bus_modules, vehicle_status, IKE_connection, LCM_connection);


// Startup function
function startup() {
	// Start IBUS connection
	ibus_connection.startup();

	// Start WebSocket server
	socket_server.init(3002, ibus_connection);
}

// Shutdown function
function shutdown() {
	// Terminate connection
	ibus_connection.shutdown(function() {
		process.exit();
	});
}

function on_ibus_data(data) {
	socket_server.ibus_data(data);
	//ibus_data_handler.check_data(data);
}

// Events
process.on('SIGINT', shutdown);
ibus_connection.on('data', on_ibus_data);



// Start things up 
// Start IBUS connection
ibus_connection.startup();
// Start WebSocket server
socket_server.init(3002, ibus_connection);

// Port 3001 listener for POST requests to modules
// This should be moved into it's own object

// Vehicle status get request
dispatcher.onGet('/status', function(request, response) {
	console.log('[get-handler] /status');
	response.writeHead(200, {'Content-Type': 'application/json'});

	response.end(JSON.stringify(vehicle_status));
});

// GM POST request
dispatcher.onPost('/gm', function(request, response) {
	console.log('[post-handler] /gm');
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
	GM_connection.gm_bitmask_encode(post);

	response.end('Got POST message for GM\n');
});

// IKE POST request
dispatcher.onPost('/ike', function(request, response) {
	console.log('[post-handler] /ike');
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
	IKE_connection.ike_data(post);

	response.end('Got POST message for IKE\n');
});

// LCM POST request
dispatcher.onPost('/lcm', function(request, response) {
	console.log('[post-handler] /lcm');
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
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
	//console.log('%s Request: %s', req.method, req.url);
	dispatcher.dispatch(req, res);
}).listen(3001, '0.0.0.0');
