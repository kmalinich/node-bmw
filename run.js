#!/usr/bin/env node

// IBUS libraries
var ibus_interface = require('./ibus/ibus-interface.js');
var bus_modules    = require('./lib/bus-modules.js');
var GM             = require('./modules/GM.js');
var LCM            = require('./modules/LCM.js');

// IBUS connection handle
var ibus_connection = new ibus_interface();
var GM_connection   = new GM(ibus_connection);
var LCM_connection  = new LCM(ibus_connection);

// npm libraries
var clc          = require('cli-color');
var dispatcher   = require('httpdispatcher');
var http         = require('http');
var query_string = require('querystring');
var url          = require('url');
var wait         = require('wait.for');


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

// Start IBUS connection
startup();

// Static content
dispatcher.setStatic('');
dispatcher.setStaticDirname('/');

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

dispatcher.beforeFilter(/\//, function(req, res, chain) { // Any URL
	// console.log("Before filter");
	chain.next(req, res, chain);
});

dispatcher.afterFilter(/\//, function(req, res, chain) { // Any URL
	// console.log("After filter");
	chain.next(req, res, chain);
});

// Error
dispatcher.onError(function(req, res) {
	console.error('Error: 404');
	res.writeHead(404);
	res.end();
});

http.createServer(function (req, res) {
	console.log('%s Request: %s', req.method, req.url);
	dispatcher.dispatch(req, res);
}).listen(8080, '0.0.0.0');
