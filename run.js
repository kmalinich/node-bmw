#!/usr/bin/env node

console.log('[ node-bmw] Starting');

// npm libraries
const dispatcher   = new (require('httpdispatcher'));
const http         = require('http');
const query_string = require('querystring');

// Everything connection object
const omnibus = {};

// Last time data was fired
omnibus.last_event = 0;

omnibus.bus_modules = new (require('./lib/bus-modules.js'));
omnibus.config      = require('./lib/config.js');  // Config
omnibus.status      = require('./lib/status.js');  // Global status object

// Data bus module libraries
omnibus.ABG  = new (require('./modules/ABG.js'))(omnibus);
omnibus.ANZV = new (require('./modules/ANZV.js'))(omnibus);
omnibus.BMBT = new (require('./modules/BMBT.js'))(omnibus);
omnibus.CCM  = new (require('./modules/CCM.js'))(omnibus);
omnibus.CDC  = new (require('./modules/CDC.js'))(omnibus);
omnibus.DSP  = new (require('./modules/DSP.js'))(omnibus);
omnibus.DSPC = new (require('./modules/DSPC.js'))(omnibus);
omnibus.EWS  = new (require('./modules/EWS.js'))(omnibus);
omnibus.GM   = new (require('./modules/GM.js'))(omnibus);
omnibus.GT   = new (require('./modules/GT.js'))(omnibus);
omnibus.HAC  = new (require('./modules/HAC.js'))(omnibus);
omnibus.IHKA = new (require('./modules/IHKA.js'))(omnibus);
omnibus.IKE  = new (require('./modules/IKE.js'))(omnibus);
omnibus.LCM  = new (require('./modules/LCM.js'))(omnibus);
omnibus.MFL  = new (require('./modules/MFL.js'))(omnibus);
omnibus.MID  = new (require('./modules/MID.js'))(omnibus);
omnibus.PDC  = new (require('./modules/PDC.js'))(omnibus);
omnibus.RAD  = new (require('./modules/RAD.js'))(omnibus);
omnibus.RLS  = new (require('./modules/RLS.js'))(omnibus);
omnibus.SES  = new (require('./modules/SES.js'))(omnibus);
omnibus.SHD  = new (require('./modules/SHD.js'))(omnibus);
omnibus.TEL  = new (require('./modules/TEL.js'))(omnibus);
omnibus.VID  = new (require('./modules/VID.js'))(omnibus);

// Custom libraries
omnibus.kodi = new (require('./lib/kodi.js'))(omnibus);
omnibus.HDMI = new (require('./lib/HDMI.js'))(omnibus);

// API/WebSocket libraries
omnibus.api_server    = http.createServer(api_handler);
omnibus.socket_server = new (require('./lib/socket-server.js'))(omnibus);

// IBUS libraries
omnibus.data_handler    = new (require('./ibus/data-handler.js'))(omnibus);   // Data handler
omnibus.ibus_connection = new (require('./ibus/ibus-interface.js'))(omnibus); // IBUS connection handle

// HTTP/WS config
var api_port            = 3001;
var api_socket_key_last = 0;
var api_socket_map      = {};
var websocket_port      = 3002;


// Global startup
function startup() {
  // Start API server
  startup_api_server(() => {
    // Start WebSocket server
    omnibus.socket_server.startup(() => {
      // Start HDMI CEC
      omnibus.HDMI.startup(() => {
        // Start IBUS connection
        omnibus.ibus_connection.startup(() => {
					console.log('[ node-bmw] Started');
        });
      });
    });
  });
}

// Global shutdown
function shutdown() {
  console.log('[ node-bmw] Stopping');
  // Close serial port if open, and exit process
  omnibus.ibus_connection.shutdown(() => {
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
  omnibus.api_server.listen(api_port, () => {
    console.log('[      API] Started, port %s', api_port);
    // Only call back if callback is a function
    if (typeof callback === 'function') { callback(); }

    omnibus.api_server.on('connection', (api_socket) => {
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
  omnibus.api_server.close();

  // API server close event
  omnibus.api_server.on('close', () => {
		console.log('[      API] Stopped');
    // Only call back if callback is a function
    if (typeof callback === 'function') { callback(); }
  });
}

// API handler function
function api_handler(request, response) {
  //console.log('[      API] %s request: %s', request.method, request.url);
  dispatcher.dispatch(request, response);
}

// Status GET request
dispatcher.onGet('/status', (request, response) => {
  response.writeHead(200, {'Content-Type': 'application/json'});

  response.end(JSON.stringify(omnibus.status));
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
  console.error('[      API] Error: 404');
  response.writeHead(404);
  response.end();
});


// Shutdown events/signals
process.on('SIGTERM', () => {
  console.log('[ node-bmw] Received SIGTERM, launching shutdown()');
  shutdown();
});

process.on('SIGINT', () => {
  console.log('[ node-bmw] Received SIGINT, launching shutdown()');
  shutdown();
});

process.on('SIGPIPE', () => {
  console.log('[ node-bmw] Received SIGPIPE, launching shutdown()');
  shutdown();
});

process.on('exit', () => {
  console.log('[ node-bmw] Shutdown complete');
});


startup();
