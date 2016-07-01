#!/usr/bin/env node

// npm libraries
var clc          = require('cli-color');
var dispatcher   = require('httpdispatcher');
var http         = require('http');
var query_string = require('querystring');
var url          = require('url');
var wait         = require('wait.for');

// IBUS libraries
var ibus_interface = require('./ibus/ibus-interface.js');
var data_handler   = require('./ibus/data-handler.js');

// Module libraries
var GM  = require('./modules/GM.js');
var IKE = require('./modules/IKE.js');
var LCM = require('./modules/LCM.js');

// WebSocket libraries
var socket_server = require('./lib/socket-server.js');

// Everything connection handle
var omnibus = {};
omnibus.bus_modules     = require('./lib/bus-modules.js');
omnibus.vehicle_status  = require('./lib/vehicle-status.js'); // Vehicle status object
omnibus.ibus_connection = new ibus_interface(); // IBUS connection handle
omnibus.GM_connection   = new GM(omnibus);
omnibus.LCM  = new LCM(omnibus);
omnibus.IKE  = new IKE(omnibus);

// Data handler
var data_handler_connection = new data_handler(omnibus);

// Shutdown function
function shutdown() {
	// Terminate connection
	omnibus.ibus_connection.shutdown(function() {
		process.exit();
	});
}

// IBUS data handler
// Should be moved inside socket_server
function on_ibus_data(data) {
	socket_server.ibus_data(data);
}

// Events
process.on('SIGINT', shutdown);
omnibus.ibus_connection.on('data', on_ibus_data);

// Start IBUS connection
omnibus.ibus_connection.startup();

// Start WebSocket server
socket_server.init(3002, omnibus);

// Port 3001 listener for POST requests to modules
// This should be moved into it's own object

// Vehicle status get request
dispatcher.onGet('/status', function(request, response) {
	console.log('[get-handler] /status');
	response.writeHead(200, {'Content-Type': 'application/json'});

	response.end(JSON.stringify(omnibus.vehicle_status));
});

// GM POST request
dispatcher.onPost('/gm', function(request, response) {
	console.log('[post-handler] /gm');
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
	omnibus.GM_connection.gm_bitmask_encode(post);

	response.end('Got POST message for GM\n');
});

// IKE POST request
dispatcher.onPost('/ike', function(request, response) {
	console.log('[post-handler] /ike');
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
	omnibus.IKE.ike_data(post);

	response.end('Got POST message for IKE\n');
});

// LCM POST request
dispatcher.onPost('/lcm', function(request, response) {
	console.log('[post-handler] /lcm');
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
	omnibus.LCM.lcm_bitmask_encode(post);

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

console.log('[run.js] Started API interface on port 3001');
