#!/usr/bin/env node

// npm libraries
var http         = require('http');
var query_string = require('querystring');
var url          = require('url');
var wait         = require('wait.for');

var http_dispatcher = require('httpdispatcher');
var dispatcher      = new http_dispatcher();

// IBUS libraries
var data_handler   = require('./ibus/data-handler.js');
var ibus_interface = require('./ibus/ibus-interface.js');

// Other custom libraries
//var BT   = require('./lib/BT.js');
var kodi = require('./lib/kodi.js');

// Module libraries
var ABG  = require('./modules/ABG.js');
var ANZV = require('./modules/ANZV.js');
var BMBT = require('./modules/BMBT.js');
var CCM  = require('./modules/CCM.js');
var CDC  = require('./modules/CDC.js');
var DSP  = require('./modules/DSP.js');
var DSPC = require('./modules/DSPC.js');
var EWS  = require('./modules/EWS.js');
var GM   = require('./modules/GM.js');
var GT   = require('./modules/GT.js');
var HAC  = require('./modules/HAC.js');
var IHKA = require('./modules/IHKA.js');
var IKE  = require('./modules/IKE.js');
var LCM  = require('./modules/LCM.js');
var MFL  = require('./modules/MFL.js');
var MID  = require('./modules/MID.js');
var PDC  = require('./modules/PDC.js');
var RAD  = require('./modules/RAD.js');
var RLS  = require('./modules/RLS.js');
var SES  = require('./modules/SES.js');
var SHD  = require('./modules/SHD.js');
var TEL  = require('./modules/TEL.js');
var VID  = require('./modules/VID.js');

// Everything connection handle
var omnibus             = {};
omnibus.bus_modules     = require('./lib/bus-modules.js');
omnibus.status          = require('./lib/status.js');  // Vehicle status object
omnibus.data_handler    = new data_handler(omnibus); // Data handler
omnibus.ibus_connection = new ibus_interface(omnibus); // IBUS connection handle
omnibus.ABG             = new ABG(omnibus);
omnibus.ANZV            = new ANZV(omnibus);
omnibus.BMBT            = new BMBT(omnibus);
omnibus.CCM             = new CCM(omnibus);
omnibus.CDC             = new CDC(omnibus);
omnibus.DSP             = new DSP(omnibus);
omnibus.DSPC            = new DSPC(omnibus);
omnibus.EWS             = new EWS(omnibus);
omnibus.GM              = new GM(omnibus);
omnibus.GT              = new GT(omnibus);
omnibus.HAC             = new HAC(omnibus);
omnibus.IHKA            = new IHKA(omnibus);
omnibus.IKE             = new IKE(omnibus);
omnibus.LCM             = new LCM(omnibus);
omnibus.MFL             = new MFL(omnibus);
omnibus.MID             = new MID(omnibus);
omnibus.PDC             = new PDC(omnibus);
omnibus.RAD             = new RAD(omnibus);
omnibus.RLS             = new RLS(omnibus);
omnibus.SES             = new SES(omnibus);
omnibus.SHD             = new SHD(omnibus);
omnibus.TEL             = new TEL(omnibus);
omnibus.VID             = new VID(omnibus);
//omnibus.BT              = new BT(omnibus);
omnibus.kodi            = new kodi(omnibus);
omnibus.socket_server = require('./lib/socket-server.js');

// Server ports
var api_port       = 3001;
var websocket_port = 3002;

// WebSocket libraries
var api_server    = http.createServer(api_handler);

// API handler function
function api_handler(request, response) {
	//console.log('[node-api] %s request: %s', request.method, request.url);
	dispatcher.dispatch(request, response);
}

function start() {
	// Start BT autoconfig
	//omnibus.BT.autoconfig();

	// Start API server
	api_server.listen(api_port, function() {
		console.log('[node-api] Started, port %s', api_port);
	});

	// Start WebSocket server
	omnibus.socket_server.init(websocket_port, omnibus);

	// Start IBUS connection
	omnibus.ibus_connection.startup();
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
	console.error('[API]  Error: 404');
	response.writeHead(404);
	response.end();
});


// Events
process.on('SIGINT', shutdown);

console.log('[node-bmw] Starting');
start();
