#!/usr/bin/env node

// Global libraries
now = require('performance-now');

// Global objects
bitmask     = require('./lib/bitmask');
bus_modules = require('./lib/bus-modules');
hex         = require('./lib/hex');
json        = require('./lib/json');
log         = require('./lib/log');

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
socket_server           = require('./lib/socket-server');
api_server              = http.createServer(api_handler);
var api_header          = {
  'Content-Type'  : 'application/json',
  'Cache-Control' : 'no-cache',
}


// Global startup
function startup() {
  log.msg({
    src : 'run',
    msg : 'Starting up',
  });

	json.read_config(() => { // Read JSON config file
		json.read_status(() => { // Read JSON status file
			startup_api_server(() => { // Open API server
				socket_server.startup(() => { // Config WebSocket server
					omnibus.HDMI.startup(() => { // Open HDMI-CEC
						omnibus.ibus.startup(() => { // Open serial port
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
}

// Global shutdown
function shutdown() {
  log.msg({
    src : 'run',
    msg : 'Shutting down',
  });

  omnibus.ibus.shutdown(() => { // Close serial port
    omnibus.HDMI.shutdown(() => { // Close HDMI-CEC
      shutdown_api_server(() => { // Close API server
        json.write_config(() => { // Write JSON config file
          json.write_status(() => { // Write JSON status file
            process.exit();
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
    console.log('[node::API] Started, port %s', config.api.port);
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

// Status GET request
dispatcher.onGet('/status', (request, response) => {
  response.writeHead(200, api_header);
  response.end(JSON.stringify(status));
});

// GM POST request
dispatcher.onPost('/gm', (request, response) => {
  omnibus.GM.gm_data(query_string.parse(request.body));
  response.writeHead(200, api_header);
  response.end(JSON.stringify({ status : 'ok' }));
});

// IKE POST request
dispatcher.onPost('/ike', (request, response) => {
  omnibus.IKE.ike_data(query_string.parse(request.body));
  response.writeHead(200, api_header);
  response.end(JSON.stringify({ status : 'ok' }));
});

// LCM POST request
dispatcher.onPost('/lcm', (request, response) => {
  omnibus.LCM.lcm_data(query_string.parse(request.body));
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
