#!/usr/bin/env node

// Global libraries
convert = require('node-unit-conversion');
moment  = require('moment');
now     = require('performance-now');
os      = require('os');
suncalc = require('suncalc');

// Global objects
bitmask     = require('bitmask');
bus_modules = require('bus-modules');
hex         = require('hex');
json        = require('json');
log         = require('log-output');

// API config - should be moved into API object
const dispatcher        = new (require('httpdispatcher'));
const http              = require('http');
const query_string      = require('querystring');
var api_socket_key_last = 0;
var api_socket_map      = {};
socket_server           = require('socket-server');
api_server              = http.createServer(api_handler);
var api_header          = {
	'Content-Type'  : 'application/json',
	'Cache-Control' : 'no-cache',
}

function load_modules(callback) {
	// Everything connection object
	omnibus = {
		// IBUS libraries - these should be combined
		data_handler : require('data-handler'), // Data handler/router
		data_send    : require('data-send'),    // Data sender (sorts based on dest module)

		ibus : {
			protocol  : require('ibus-protocol'), // Protocol
			interface : require('ibus-interface'), // Connection
		},

		kbus : {
			protocol  : require('kbus-protocol'), // Protocol
			interface : require('kbus-interface'), // Connection
		},

		dbus : {
			protocol  : require('dbus-protocol'), // Protocol
			interface : require('dbus-interface'), // Connection
		},

		// Custom libraries
		BT   : require('BT'),
		HDMI : require('HDMI'),
		kodi : require('kodi'),

		// Data bus module libraries
		GM  : require('GM'),
		LCM : require('LCM'),
		IKE : require('IKE'),

		ABG  : new (require('ABG')),
		ANZV : new (require('ANZV')),
		BMBT : new (require('BMBT')),
		CCM  : new (require('CCM')),
		CDC  : new (require('CDC')),
		DSP  : new (require('DSP')),
		DSPC : new (require('DSPC')),
		EWS  : new (require('EWS')),
		GT   : new (require('GT')),
		HAC  : new (require('HAC')),
		IHKA : new (require('IHKA')),
		MFL  : new (require('MFL')),
		MID  : new (require('MID')),
		NAV  : new (require('NAV')),
		PDC  : new (require('PDC')),
		RAD  : new (require('RAD')),
		RLS  : new (require('RLS')),
		SES  : new (require('SES')),
		SHD  : new (require('SHD')),
		TEL  : new (require('TEL')),
		VID  : new (require('VID')),
	};

	if (typeof callback === 'function') { callback(); }
}


// Global startup
function startup() {
	log.msg({
		src : 'run',
		msg : 'Starting',
	});

	json.read_config(() => { // Read JSON config file
		json.read_status(() => { // Read JSON status file
			json.reset_modules(() => { // Reset modules vars pertinent to launching app
				json.reset_status(() => { // Reset status vars pertinent to launching app
					load_modules(() => { // Load IBUS module node modules

						omnibus.dbus.interface.startup(() => { // Open DBUS serial port
							omnibus.kbus.interface.startup(() => { // Open KBUS serial port
								omnibus.ibus.interface.startup(() => { // Open IBUS serial port

									startup_api_server(() => { // Open API server
										socket_server.startup(() => { // Config WebSocket server
											omnibus.HDMI.startup(() => { // Open HDMI-CEC
												omnibus.BT.autoconfig(() => { // Open Bluetooth connection
													omnibus.kodi.autoconfig(() => { // Open Kodi websocket
														log.msg({
															src : 'run',
															msg : 'Started',
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
}

// Global shutdown
function shutdown() {
	log.msg({
		src : 'run',
		msg : 'Shutting down',
	});

	omnibus.HDMI.shutdown(() => { // Close HDMI-CEC
		omnibus.kodi.shutdown(() => { // Close Kodi websocket/clean up
			shutdown_api_server(() => { // Close API server

				omnibus.dbus.interface.shutdown(() => { // Close DBUS serial port
					omnibus.kbus.interface.shutdown(() => { // Close KBUS serial port
						omnibus.ibus.interface.shutdown(() => { // Close IBUS serial port

							json.write_config(() => { // Write JSON config file
								json.reset_modules(() => { // Reset modules vars pertinent to launching app
									json.reset_status(() => { // Reset status vars pertinent to launching app
										json.write_status(() => { // Write JSON status file
											process.exit();
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
}


// Port 3001 listener for POST requests to modules
// This REALLY REALLY REALLY REALLY should be moved into it's own object

function startup_api_server(callback) {
	// error handling breh
	api_server.listen(config.api.port, () => {
		log.msg({
			src : 'API',
			msg : 'API server up, port '+config.api.port,
		});

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
		log.msg({
			src : 'API',
			msg : 'Stopped',
		});
		if (typeof callback === 'function') { callback(); }
	});
}

// API handler function
function api_handler(request, response) {
	//console.log('[node::API] %s request: %s', request.method, request.url);
	dispatcher.dispatch(request, response);
}

// Config GET request
dispatcher.onGet('/config', (request, response) => {
	response.writeHead(200, api_header);
	response.end(JSON.stringify(config));
});

// Config POST request
dispatcher.onPost('/config', (request, response) => {
	//console.log(JSON.parse(request.body));
	config = JSON.parse(request.body);
	json.write_config(() => { // Write JSON config file
		response.writeHead(200, api_header);
		response.end(JSON.stringify({ status : 'ok' }));
	});
});

// Status GET request
dispatcher.onGet('/status', (request, response) => {
	response.writeHead(200, api_header);
	response.end(JSON.stringify(status));
});

// GM POST request
dispatcher.onPost('/gm', (request, response) => {
	omnibus.GM.api_command(query_string.parse(request.body));
	response.writeHead(200, api_header);
	response.end(JSON.stringify({ status : 'ok' }));
});

// IKE POST request
dispatcher.onPost('/ike', (request, response) => {
	omnibus.IKE.api_command(query_string.parse(request.body));
	response.writeHead(200, api_header);
	response.end(JSON.stringify({ status : 'ok' }));
});

// HDMI POST request
dispatcher.onPost('/hdmi', (request, response) => {
	omnibus.HDMI.command(query_string.parse(request.body).command);
	response.writeHead(200, api_header);
	response.end(JSON.stringify({ status : 'ok' }));
});

// LCM POST request
dispatcher.onPost('/lcm', (request, response) => {
	omnibus.LCM.api_command(query_string.parse(request.body));
	response.writeHead(200, api_header);
	response.end(JSON.stringify({ status : 'ok' }));
});

// Error
dispatcher.onError((request, response) => {
	console.error('[node::API] Error: 404');
	response.writeHead(404);
	response.end();
});


// Shutdown events/signals
process.on('SIGTERM', () => {
	log.msg({
		src : 'run',
		msg : 'Received SIGTERM, launching shutdown()',
	});
	shutdown();
});

process.on('SIGINT', () => {
	log.msg({
		src : 'run',
		msg : 'Received SIGINT, launching shutdown()',
	});
	shutdown();
});

process.on('SIGPIPE', () => {
	log.msg({
		src : 'run',
		msg : 'Received SIGPIPE, launching shutdown()',
	});
	shutdown();
});

process.on('exit', () => {
	log.msg({
		src : 'run',
		msg : 'Shut down',
	});
});

startup();
