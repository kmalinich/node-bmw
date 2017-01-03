#!/usr/bin/env node

// npm libraries
const http              = require('http');
const http_dispatcher   = require('httpdispatcher');
const query_string      = require('querystring');
const url               = require('url');
const lib_socket_server = require('./lib/socket-server.js')
const wait              = require('wait.for');

// IBUS libraries
const data_handler   = require('./ibus/data-handler.js');
const ibus_interface = require('./ibus/ibus-interface.js');

// Other custom libraries
const kodi = require('./lib/kodi.js');
const HDMI = require('./lib/HDMI.js');

// Module libraries
const ABG  = require('./modules/ABG.js');
const ANZV = require('./modules/ANZV.js');
const BMBT = require('./modules/BMBT.js');
const CCM  = require('./modules/CCM.js');
const CDC  = require('./modules/CDC.js');
const DSP  = require('./modules/DSP.js');
const DSPC = require('./modules/DSPC.js');
const EWS  = require('./modules/EWS.js');
const GM   = require('./modules/GM.js');
const GT   = require('./modules/GT.js');
const HAC  = require('./modules/HAC.js');
const IHKA = require('./modules/IHKA.js');
const IKE  = require('./modules/IKE.js');
const LCM  = require('./modules/LCM.js');
const MFL  = require('./modules/MFL.js');
const MID  = require('./modules/MID.js');
const PDC  = require('./modules/PDC.js');
const RAD  = require('./modules/RAD.js');
const RLS  = require('./modules/RLS.js');
const SES  = require('./modules/SES.js');
const SHD  = require('./modules/SHD.js');
const TEL  = require('./modules/TEL.js');
const VID  = require('./modules/VID.js');

// Everything connection object
const omnibus = {};

omnibus.bus_modules     = require('./lib/bus-modules.js');
omnibus.status          = require('./lib/status.js');  // Vehicle status object
omnibus.data_handler    = new data_handler(omnibus);   // Data handler
omnibus.ibus_connection = new ibus_interface(omnibus); // IBUS connection handle

omnibus.ABG  = new ABG(omnibus);
omnibus.ANZV = new ANZV(omnibus);
omnibus.BMBT = new BMBT(omnibus);
omnibus.CCM  = new CCM(omnibus);
omnibus.CDC  = new CDC(omnibus);
omnibus.DSP  = new DSP(omnibus);
omnibus.DSPC = new DSPC(omnibus);
omnibus.EWS  = new EWS(omnibus);
omnibus.GM   = new GM(omnibus);
omnibus.GT   = new GT(omnibus);
omnibus.HAC  = new HAC(omnibus);
omnibus.IHKA = new IHKA(omnibus);
omnibus.IKE  = new IKE(omnibus);
omnibus.LCM  = new LCM(omnibus);
omnibus.MFL  = new MFL(omnibus);
omnibus.MID  = new MID(omnibus);
omnibus.PDC  = new PDC(omnibus);
omnibus.RAD  = new RAD(omnibus);
omnibus.RLS  = new RLS(omnibus);
omnibus.SES  = new SES(omnibus);
omnibus.SHD  = new SHD(omnibus);
omnibus.TEL  = new TEL(omnibus);
omnibus.VID  = new VID(omnibus);

omnibus.kodi = new kodi(omnibus);
omnibus.HDMI = new HDMI(omnibus);

omnibus.api_server    = http.createServer(api_handler);
omnibus.socket_server = new lib_socket_server(omnibus);

// HTTP/WS config
var api_port        = 3001;
var api_socket_key_last = 0;
var api_socket_map      = {};
var websocket_port  = 3002;


// Global startup
function startup() {
  console.log('[ node-bmw] Starting up');
  // Start API server
  startup_api_server(() => {
    console.log('[      API] Started up, port %s', api_port);
    // Start WebSocket server
    omnibus.socket_server.startup(() => {
      console.log('[       WS] Started up');
      // Start HDMI CEC
      omnibus.HDMI.startup(() => {
        console.log('[     HDMI] Started up');
        // Start IBUS connection
        omnibus.ibus_connection.startup(() => {
          console.log('[     INTF] Started up');
        });
      });
    });
  });
}

// Global shutdown
function shutdown() {
  console.log('[ node-bmw] Shutting down');
  // Close serial port if open, and exit process
  omnibus.ibus_connection.shutdown(() => {
    console.log('[     INTF] Shut down');
    omnibus.HDMI.shutdown(() => {
      console.log('[     HDMI] Shut down');
      // socket server? .. nah, it's the api server. er..
      shutdown_api_server(() => {
        console.log('[      API] Shut down');
        process.exit();
      });
    });
  });
}


// Port 3001 listener for POST requests to modules
// This REALLY REALLY REALLY REALLY should be moved into it's own object

var dispatcher = new http_dispatcher();

function startup_api_server(callback) {
  // error handling breh
  omnibus.api_server.listen(api_port, () => {
    console.log('[      API] Started up, port %s', api_port);

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
  console.log('[      API] Shutting down');

  // Loop through all sockets and destroy them
  Object.keys(api_socket_map).forEach((api_socket_key) => {
    socket_map[api_socket_key].destroy();
  });

  // Tell server to close
  omnibus.api_server.close();

  // API server close event
  omnibus.api_server.on('close', () => {
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
