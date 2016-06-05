#!/usr/bin/env node

// Color terminal output
var clc = require('cli-color');
var wait = require('wait.for');

// Libraries
var ibus_interface = require('../ibus-interface.js');
var ibus_modules   = require('../ibus-modules.js');

// Serial device path
var device = '/dev/tty.SLAB_USBtoUART';

// IBUS connection handle
var ibus_connection = new ibus_interface(device);

// Bitmasks in hex
var bit_0 = 0x01;
var bit_1 = 0x02;
var bit_2 = 0x04;
var bit_3 = 0x08;
var bit_4 = 0x10;
var bit_5 = 0x20;
var bit_6 = 0x40;
var bit_7 = 0x80;

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

// Send message to LCM
function lcm_send(packet) {
  var src = 0x3F; // DIA
  var dst = 0xBF; // GLO
  var cmd = 0x0C; // Set IO status 

  // Add the command to the beginning of the LCM hex array
  packet.unshift(cmd);

  var ibus_packet = {
    src: src,
    dst: dst,
    msg: new Buffer(packet),
  }

  // Send the message
  console.log('Sending LCM packet');
  ibus_connection.send_message(ibus_packet);
}

// Test if a bit in a bitmask is set
function bit_test(num, bit) {
  if ((num & bit) != 0) {
    return true;
  } else {
    return false;
  }
}

// Set a bit in a bitmask
function bit_set(num, bit) {
  num |= bit;
  return num;
}

// Encode the LCM bitmask string from an input of true/false values
function lcm_bitmask_encode(array) {
  // Initialize bitmask variables
  var bitmask_0 = 0x00;
  var bitmask_1 = 0x00;
  var bitmask_2 = 0x00;
  var bitmask_3 = 0x00;
  var bitmask_4 = 0x00;
  var bitmask_5 = 0x00;
  var bitmask_6 = 0x00;
  var bitmask_7 = 0x00;

  // '1st switch w/o autolevel (stuck on)', bitmask_1, bit_2);

  // Set the various bitmask values according to the input array
  if(array.brake_switch     ) { bitmask_0 = bit_set(bitmask_0, bit_6) ; }

  if(array.hazard_switch    ) { bitmask_1 = bit_set(bitmask_1, bit_4) ; }

  if(array.switch_pos_1     ) { bitmask_2 = bit_set(bitmask_2, bit_5) ; }
  if(array.parking_right    ) { bitmask_2 = bit_set(bitmask_2, bit_6) ; }
  if(array.parking_left     ) { bitmask_2 = bit_set(bitmask_2, bit_7) ; }

  if(array.switch_pos_2     ) { bitmask_3 = bit_set(bitmask_2, bit_3) ; }
  if(array.cold_monitoring  ) { bitmask_3 = bit_set(bitmask_2, bit_5) ; }

  if(array.cluster_led_off  ) { bitmask_4 = bit_set(bitmask_4, bit_1) ; }
  if(array.hazard_led_off   ) { bitmask_4 = bit_set(bitmask_4, bit_2) ; }
  if(array.brake_left       ) { bitmask_4 = bit_set(bitmask_4, bit_3) ; }
  if(array.brake_right      ) { bitmask_4 = bit_set(bitmask_4, bit_4) ; }
  if(array.high_right       ) { bitmask_4 = bit_set(bitmask_4, bit_5) ; }
  if(array.high_left        ) { bitmask_4 = bit_set(bitmask_4, bit_6) ; }

  if(array.halo_left        ) { bitmask_5 = bit_set(bitmask_5, bit_0) ; }
  if(array.tail_left        ) { bitmask_5 = bit_set(bitmask_5, bit_1) ; }
  if(array.fog_left         ) { bitmask_5 = bit_set(bitmask_5, bit_2) ; }
  if(array.reverse_left     ) { bitmask_5 = bit_set(bitmask_5, bit_3) ; }
  if(array.low_left         ) { bitmask_5 = bit_set(bitmask_5, bit_4) ; }
  if(array.low_right        ) { bitmask_5 = bit_set(bitmask_5, bit_5) ; }
  if(array.fog_right        ) { bitmask_5 = bit_set(bitmask_5, bit_6) ; }

  if(array.vertical_aim     ) { bitmask_6 = bit_set(bitmask_6, bit_1) ; }
  if(array.license          ) { bitmask_6 = bit_set(bitmask_6, bit_2) ; }
  if(array.halo_right       ) { bitmask_6 = bit_set(bitmask_6, bit_5) ; }
  if(array.turn_front_right ) { bitmask_6 = bit_set(bitmask_6, bit_6) ; }
  if(array.turn_rear_left   ) { bitmask_6 = bit_set(bitmask_6, bit_7) ; }

  if(array.turn_rear_right  ) { bitmask_7 = bit_set(bitmask_7, bit_1) ; }
  if(array.tail_right       ) { bitmask_7 = bit_set(bitmask_7, bit_3) ; }
  if(array.turn_front_left  ) { bitmask_7 = bit_set(bitmask_7, bit_6) ; }
  if(array.reverse_right    ) { bitmask_7 = bit_set(bitmask_7, bit_7) ; }

  // Assemble the output array
  var output = [
    bitmask_0,
    bitmask_1,
    bitmask_2,
    bitmask_3,
    bitmask_4,
    bitmask_5,
    bitmask_6,
    bitmask_7
  ];

	console.log(output);
  return output;
}

// Decode the LCM bitmask string and output an array of true/false values
function lcm_bitmask_decode(array) {
  var bitmask_0 = array[0];
  var bitmask_1 = array[1];
  var bitmask_2 = array[2];
  var bitmask_3 = array[3];
  var bitmask_4 = array[4];
  var bitmask_5 = array[5];
  var bitmask_6 = array[6];
  var bitmask_7 = array[7];

  // 0
  var brake_switch     = bit_test(bitmask_0, bit_6);

  // 1
  // '1st switch w/o autolevel (stuck on)', 0x04);
  var hazard_switch    = bit_test(bitmask_1, bit_4);

  // 2
  var switch_pos_1     = bit_test(bitmask_2, bit_5);
  var parking_right    = bit_test(bitmask_2, bit_6);
  var parking_left     = bit_test(bitmask_2, bit_7);

  // 3
  var switch_pos_2     = bit_test(bitmask_2, bit_3);
  var cold_monitoring  = bit_test(bitmask_2, bit_5);

  // 4
  var cluster_led_off  = bit_test(bitmask_4, bit_1);
  var hazard_led_off   = bit_test(bitmask_4, bit_2);
  var brake_left       = bit_test(bitmask_4, bit_3);
  var brake_right      = bit_test(bitmask_4, bit_4);
  var high_right       = bit_test(bitmask_4, bit_5);
  var high_left        = bit_test(bitmask_4, bit_6);

  // 5
  var halo_left        = bit_test(bitmask_5, bit_0);
  var tail_left        = bit_test(bitmask_5, bit_1);
  var fog_left         = bit_test(bitmask_5, bit_2);
  var reverse_left     = bit_test(bitmask_5, bit_3);
  var low_left         = bit_test(bitmask_5, bit_4);
  var low_right        = bit_test(bitmask_5, bit_5);
  var fog_right        = bit_test(bitmask_5, bit_6);

  // 6
  var vertical_aim     = bit_test(bitmask_6, bit_1);
  var license          = bit_test(bitmask_6, bit_2);
  var halo_right       = bit_test(bitmask_6, bit_5);
  var turn_front_right = bit_test(bitmask_6, bit_6);
  var turn_rear_left   = bit_test(bitmask_6, bit_7);

  // 7
  var turn_rear_right  = bit_test(bitmask_7, bit_1);
  var tail_right       = bit_test(bitmask_7, bit_3);
  var turn_front_left  = bit_test(bitmask_7, bit_6);
  var reverse_right    = bit_test(bitmask_7, bit_7);

  // This bit always lights up the rear fog LED in the cluster no matter where in the buffer it is
  // var result = wait.for(bit_sample, 'Rfog', 0x10);

  var output = {
    'tail_left'        : tail_left,
    'tail_right'       : tail_right,
    'brake_switch'     : brake_switch,
    'cluster_led_off'  : cluster_led_off,
    'fog_left'         : fog_left,
    'fog_right'        : fog_right,
    'halo_left'        : halo_left,
    'halo_right'       : halo_right,
    'hazard_led_off'   : hazard_led_off,
    'hazard_switch'    : hazard_switch,
    'high_left'        : high_left,
    'high_right'       : high_right,
    'license'          : license,
    'low_left'         : low_left,
    'low_right'        : low_right,
    'reverse_left'     : reverse_left,
    'reverse_right'    : reverse_right,
    'brake_left'       : brake_left,
    'brake_right'      : brake_right,
    'turn_front_left'  : turn_front_left,
    'turn_front_right' : turn_front_right,
    'turn_rear_left'   : turn_rear_left,
    'turn_rear_right'  : turn_rear_right,
    'switch_pos_1'     : running_lamps_1,
    'parking_right'    : parking_right,
    'parking_left'     : parking_left,
    'switch_pos_2'     : switch_pos_2,
    'cold_monitoring'  : cold_monitoring,
  }

  return output;
}

// All the possible values to send to the LCM
var array_of_possible_values = {
  tail_left        : true,
  tail_right       : true,
  brake_switch     : true,
  cluster_led_off  : true,
  fog_left         : true,
  fog_right        : true,
  halo_left        : true,
  halo_right       : true,
  hazard_led_off   : true,
  hazard_switch    : true,
  high_left        : true,
  high_right       : true,
  license          : true,
  low_left         : true,
  low_right        : true,
  reverse_left     : true,
  reverse_right    : true,
  brake_left       : true,
  brake_right      : true,
  turn_front_left  : true,
  turn_front_right : true,
  turn_rear_left   : true,
  turn_rear_right  : true,
  switch_pos_1     : true,
  parking_right    : true,
  parking_left     : true,
  switch_pos_2     : true,
  cold_monitoring  : true,
}

function go() {
  var array = {
		brake_left       : false,
		brake_right      : false,
		brake_switch     : false,
		cluster_led_off  : false,
		cold_monitoring  : false,
		fog_left         : false,
		fog_right        : false,
		halo_left        : false,
		halo_right       : false,
		hazard_led_off   : false,
		hazard_switch    : false,
		high_left        : false,
		high_right       : false,
		license          : false,
		low_left         : false,
		low_right        : false,
		parking_left     : false,
		parking_right    : false,
		reverse_left     : false,
		reverse_right    : false,
		switch_pos_1     : false,
		switch_pos_2     : true,
		tail_left        : false,
		tail_right       : false,
		turn_front_left  : false,
		turn_front_right : false,
		turn_rear_left   : false,
		turn_rear_right  : false,
	}

	lcm_send(lcm_bitmask_encode(array));
}

// Run shutdown() on SIGINT
process.on('SIGINT', shutdown);
// Run go() on port_open
//ibus_connection.on('port_open', go);

startup();


//shutdown();



// Require the HTTP module
var http = require('http');
var dispatcher = require('httpdispatcher');

// Create a server
var server = http.createServer(handleRequest);

// Listening HTTP port
const PORT = 8080; 

function handleRequest(request, response){
	try {
		// Log the request on console
		console.log('Request URL: '+request.url);

		// Dispatch
		dispatcher.dispatch(request, response);
	} catch(err) {
		console.log(err);
	}
}

//For all your static (js/css/images/etc.) set the directory name (relative path).
dispatcher.setStatic('resources');

// Shutdown app
dispatcher.onGet("/shutdown", function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Server shutdown');
	shutdown();
});

// A sample GET request    
dispatcher.onGet("/lcm", function(req, res) {
	var output = {};
	for (var prop in req.params) {
		output[''+prop+''] = true;
	}
	lcm_send(lcm_bitmask_encode(output));
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('LCM command sent\n');
});    

// A sample POST request
dispatcher.onPost("/post1", function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Got POST Data\n');
});

//Lets start our server
server.listen(PORT, function(){
	// Callback triggered when server is successfully listening. Hurray!
	console.log("Server listening on: http://localhost:%s", PORT);
});
