#!/usr/bin/env node

// IBUS libraries
var ibus_interface = require('./ibus-interface.js');
var ibus_modules   = require('./ibus-modules.js');
var LCM            = require('./modules/LCM.js');

// npm libraries
var clc          = require('cli-color');
var dispatcher   = require('httpdispatcher');
var http         = require('http');
var query_string = require('querystring');
var url          = require('url');
var wait         = require('wait.for');

// IBUS connection handle
var ibus_connection = new ibus_interface();
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

// Start IBUS connection
startup();

// Static content
dispatcher.setStatic('');
dispatcher.setStaticDirname('/');

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
