#!/usr/bin/env node

// npm libraries
var clc          = require('cli-color');
var dispatcher   = require('httpdispatcher');
var http         = require('http');
var query_string = require('querystring');
var url          = require('url');
var wait         = require('wait.for');
var dbus         = require('dbus-native');

// IBUS libraries
var ibus_interface = require('./ibus/ibus-interface.js');
var data_handler   = require('./ibus/data-handler.js');

// Module libraries
var CDC = require('./modules/CDC.js');
var GM  = require('./modules/GM.js');
var IKE = require('./modules/IKE.js');
var LCM = require('./modules/LCM.js');

// WebSocket libraries
var socket_server = require('./lib/socket-server.js');
var api_server    = http.createServer(api_handler);

// Everything connection handle
var omnibus             = {};
omnibus.bus_modules     = require('./lib/bus-modules.js');
omnibus.status          = require('./lib/status.js'); // Vehicle status object
omnibus.ibus_connection = new ibus_interface();       // IBUS connection handle
omnibus.CDC             = new CDC(omnibus);
omnibus.GM              = new GM(omnibus);
omnibus.IKE             = new IKE(omnibus);
omnibus.LCM             = new LCM(omnibus);
omnibus.system_bus      = dbus.createConnection();

// Data handler
var data_handler_connection = new data_handler(omnibus);

// Server ports
var api_port       = 3001;
var websocket_port = 3002;

// IBUS data handler
// Should be moved inside socket_server
function on_ibus_data(data) {
  socket_server.ibus_data(data);
}

// API handler function
function api_handler(request, response) {
	console.log('[api-handler] %s request: %s',request.method, request.url);
	dispatcher.dispatch(request, response);
}

function start() {
	// Start IBUS connection
	omnibus.ibus_connection.startup();

	// Start API server
	api_server.listen(api_port, function() {
		console.log('[api-server] Started, port %s', api_port);
	});

	// Start WebSocket server
	socket_server.init(websocket_port, omnibus);
}

// Shutdown function
function shutdown() {
  console.log('[node-bmw] Closing all threads and exiting');

  api_server.close(function() {
    process.exit(function() {
    });
  });

  // Close serial port if open, and exit process  
  omnibus.ibus_connection.shutdown(function() {
    process.exit();
  });
}


// Port 3001 listener for POST requests to modules
// This should be moved into it's own object

// Status GET request
dispatcher.onGet('/status', function(request, response) {
  response.writeHead(200, {'Content-Type': 'application/json'});

  response.end(JSON.stringify(omnibus.status));
});

// GM POST request
dispatcher.onPost('/gm', function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});

  var post = query_string.parse(request.body);
  omnibus.GM.gm_data(post);

  response.end('Got POST message for GM\n');
});

// IKE POST request
dispatcher.onPost('/ike', function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});

  var post = query_string.parse(request.body);
  omnibus.IKE.ike_data(post);

  response.end('Got POST message for IKE\n');
});

// LCM POST request
dispatcher.onPost('/lcm', function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});

  var post = query_string.parse(request.body);
  omnibus.LCM.lcm_data(post);

  response.end('Got POST message for LCM\n');
});

// Error
dispatcher.onError(function(request, response) {
  console.error('[api-handler] Error: 404');
  response.writeHead(404);
  response.end();
});


// Events
process.on('SIGINT', shutdown);
omnibus.ibus_connection.on('data', on_ibus_data);

console.log('[node-bmw] Starting');
start();
