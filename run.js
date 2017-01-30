#!/usr/bin/env node

console.log('[node::bmw] Starting');

// Global libraries
now = require('performance-now');

// Global objects
bitmask     = require('./lib/bitmask');
bus_modules = require('./lib/bus-modules');
config      = require('./lib/config');
hex         = require('./lib/hex');
json        = require('./lib/json');
log         = require('./lib/log');
status      = require('./lib/status');

// Everything connection object
omnibus = {
	// IBUS libraries - these should be combined
	data_handler : require('./ibus/data-handler'  ), // Data handler/router
	protocol     : require('./ibus/ibus-protocol' ), // Protocol
	ibus         : require('./ibus/ibus-interface'), // Connection

	// Custom libraries
	BT   : require('./lib/BT'  ),
	HDMI : require('./lib/HDMI'),
	kodi : require('./lib/kodi'),

	// Data bus module libraries
	GM  : require('./modules/GM'),
	LCM : require('./modules/LCM'),
	IKE : require('./modules/IKE'),

	ABG  : new (require('./modules/ABG' )),
	ANZV : new (require('./modules/ANZV')),
	BMBT : new (require('./modules/BMBT')),
	CCM  : new (require('./modules/CCM' )),
	CDC  : new (require('./modules/CDC' )),
	DSP  : new (require('./modules/DSP' )),
	DSPC : new (require('./modules/DSPC')),
	EWS  : new (require('./modules/EWS' )),
	GT   : new (require('./modules/GT'  )),
	HAC  : new (require('./modules/HAC' )),
	IHKA : new (require('./modules/IHKA')),
	MFL  : new (require('./modules/MFL' )),
	MID  : new (require('./modules/MID' )),
	NAV  : new (require('./modules/NAV' )),
	PDC  : new (require('./modules/PDC' )),
	RAD  : new (require('./modules/RAD' )),
	RLS  : new (require('./modules/RLS' )),
	SES  : new (require('./modules/SES' )),
	SHD  : new (require('./modules/SHD' )),
	TEL  : new (require('./modules/TEL' )),
	VID  : new (require('./modules/VID' )),
};

// API config - should be moved into API object
const dispatcher        = new (require('httpdispatcher'));
const http              = require('http');
const query_string      = require('querystring');
var api_socket_key_last = 0;
var api_socket_map      = {};
socket_server = require('./lib/socket-server');
api_server    = http.createServer(api_handler);

// Global startup
function startup() {
	// Start API server
	startup_api_server(() => {
		// Start WebSocket server
		socket_server.startup(() => {
			// Start HDMI CEC
			omnibus.HDMI.startup(() => {
				// Start IBUS connection
				omnibus.ibus.startup(() => {
					console.log('[node::bmw] Started');
				});
			});
		});
	});
}

// Global shutdown
function shutdown() {
	console.log('[node::bmw] Stopping');
	// Close serial port if open, and exit process
	omnibus.ibus.shutdown(() => {
		omnibus.HDMI.shutdown(() => {
			// socket server? .. nah, it's the api server. er..
			shutdown_api_server(() => {
				process.exit();
			});
		});
	});
}


// Port 3001 listener for POST requests to modules
// This REALLY REALLY REALLY REALLY should be moved into it's own object

function startup_api_server(callback) {
	// error handling breh
	api_server.listen(config.api.port, () => {
		console.log('[node::API] Started, port %s', config.api.port);
		// Only call back if callback is a function
		if (typeof callback === 'function') { callback(); }

		api_server.on('connection', (api_socket) => {
			// Generate a new, unique api_socket-key
			var api_socket_key = ++api_socket_key_last;

			// Add api_socket when it is connected
			api_socket_map[api_socket_key] = api_socket;

			// Remove api_socket when it is closed
			api_socket.on('close', () => {
				delete api_socket_map[api_socket_key];
			});
		});
	});
}

// Close API server and kill the sockets
function shutdown_api_server(callback) {
	// Loop through all sockets and destroy them
	Object.keys(api_socket_map).forEach((api_socket_key) => {
		api_socket_map[api_socket_key].destroy();
	});

	// Tell server to close
	api_server.close();

	// API server close event
	api_server.on('close', () => {
		console.log('[node::API] Stopped');
		// Only call back if callback is a function
		if (typeof callback === 'function') { callback(); }
	});
}

// API handler function
function api_handler(request, response) {
	//console.log('[node::API] %s request: %s', request.method, request.url);
	dispatcher.dispatch(request, response);
}

// Status GET request
dispatcher.onGet('/status', (request, response) => {
	response.writeHead(200, {'Content-Type': 'application/json'});

	response.end(JSON.stringify(status));
});

// GM POST request
dispatcher.onPost('/gm', (request, response) => {
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
	omnibus.GM.gm_data(post);

	response.end('Got POST message for GM\n');
});

// IKE POST request
dispatcher.onPost('/ike', (request, response) => {
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
	omnibus.IKE.ike_data(post);

	response.end('Got POST message for IKE\n');
});

// LCM POST request
dispatcher.onPost('/lcm', (request, response) => {
	response.writeHead(200, {'Content-Type': 'text/plain'});

	var post = query_string.parse(request.body);
	omnibus.LCM.lcm_data(post);

	response.end('Got POST message for LCM\n');
});

// Error
dispatcher.onError((request, response) => {
	console.error('[node::API] Error: 404');
	response.writeHead(404);
	response.end();
});


// Shutdown events/signals
process.on('SIGTERM', () => {
	console.log('[node::bmw] Received SIGTERM, launching shutdown()');
	shutdown();
});

process.on('SIGINT', () => {
	console.log('[node::bmw] Received SIGINT, launching shutdown()');
	shutdown();
});

process.on('SIGPIPE', () => {
	console.log('[node::bmw] Received SIGPIPE, launching shutdown()');
	shutdown();
});

process.on('exit', () => {
	console.log('[node::bmw] Shutdown complete');
});

startup();
