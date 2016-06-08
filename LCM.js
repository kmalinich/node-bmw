#!/usr/bin/env node

// IBUS libraries
var ibus_interface = require('./ibus-interface.js');
var ibus_modules   = require('./ibus-modules.js');

// npm libraries
var clc          = require('cli-color');
var dispatcher   = require('httpdispatcher');
var http         = require('http');
var query_string = require('querystring');
var url          = require('url');
var wait         = require('wait.for');

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
  var bitmask_0  = 0x00;
  var bitmask_1  = 0x00;
  var bitmask_2  = 0x00;
  var bitmask_3  = 0x00;
  var bitmask_4  = 0x00;
  var bitmask_5  = 0x00;
  var bitmask_6  = 0x00;
  var bitmask_7  = 0x00;
  var bitmask_8  = 0x00;
  // 9-11 are .. something, don't know yet.
  var bitmask_9  = 0xE4;
  var bitmask_10 = 0xFF;
  var bitmask_11 = 0x00;

  // Set the various bitmask values according to the input array
  if(array.clamp_30a                       ) { bitmask_0 = bit_set(bitmask_0, bit_0) ; }
  if(array.input_fire_extinguisher         ) { bitmask_0 = bit_set(bitmask_0, bit_1) ; }
  if(array.input_preheating_fuel_injection ) { bitmask_0 = bit_set(bitmask_0, bit_2) ; }
  if(array.input_carb                      ) { bitmask_0 = bit_set(bitmask_0, bit_4) ; }
  if(array.clamp_r                         ) { bitmask_0 = bit_set(bitmask_0, bit_6) ; }
  if(array.clamp_30b                       ) { bitmask_0 = bit_set(bitmask_0, bit_7) ; }
  if(array.input_key_in_ignition           ) { bitmask_1 = bit_set(bitmask_1, bit_0) ; }
  if(array.input_seat_belts_lock           ) { bitmask_1 = bit_set(bitmask_1, bit_1) ; }
  if(array.switch_highbeam_flash           ) { bitmask_1 = bit_set(bitmask_1, bit_2) ; }
  if(array.switch_hazard                   ) { bitmask_1 = bit_set(bitmask_1, bit_4) ; }
  if(array.input_kfn                       ) { bitmask_1 = bit_set(bitmask_1, bit_5) ; }
  if(array.input_armoured_door             ) { bitmask_1 = bit_set(bitmask_1, bit_6) ; }
  if(array.input_brake_fluid_level         ) { bitmask_1 = bit_set(bitmask_1, bit_7) ; }
  if(array.switch_brake                    ) { bitmask_2 = bit_set(bitmask_2, bit_0) ; }
  if(array.switch_highbeam                 ) { bitmask_2 = bit_set(bitmask_2, bit_1) ; }
  if(array.switch_fog_front                ) { bitmask_2 = bit_set(bitmask_2, bit_2) ; }
  if(array.switch_fog_rear                 ) { bitmask_2 = bit_set(bitmask_2, bit_4) ; }
  if(array.switch_standing                 ) { bitmask_2 = bit_set(bitmask_2, bit_5) ; }
  if(array.switch_turn_right               ) { bitmask_2 = bit_set(bitmask_2, bit_6) ; }
  if(array.switch_turn_left                ) { bitmask_2 = bit_set(bitmask_2, bit_7) ; }
  if(array.input_air_suspension            ) { bitmask_3 = bit_set(bitmask_3, bit_0) ; }
  if(array.input_hold_up_alarm             ) { bitmask_3 = bit_set(bitmask_3, bit_1) ; }
  if(array.input_washer_fluid_level        ) { bitmask_3 = bit_set(bitmask_3, bit_2) ; }
  if(array.switch_lowbeam_2                ) { bitmask_3 = bit_set(bitmask_3, bit_3) ; }
  if(array.switch_lowbeam_1                ) { bitmask_3 = bit_set(bitmask_3, bit_4) ; }
  if(array.clamp_15                        ) { bitmask_3 = bit_set(bitmask_3, bit_5) ; }
  if(array.input_engine_failsafe           ) { bitmask_3 = bit_set(bitmask_3, bit_6) ; }
  if(array.input_tire_defect               ) { bitmask_3 = bit_set(bitmask_3, bit_7) ; }
  if(array.output_license_rear_left        ) { bitmask_4 = bit_set(bitmask_4, bit_2) ; }
  if(array.output_brake_rear_right         ) { bitmask_4 = bit_set(bitmask_4, bit_4) ; }
  if(array.output_highbeam_front_right     ) { bitmask_4 = bit_set(bitmask_4, bit_5) ; }
  if(array.output_highbeam_front_left      ) { bitmask_4 = bit_set(bitmask_4, bit_6) ; }
  if(array.output_standing_front_left      ) { bitmask_5 = bit_set(bitmask_5, bit_0) ; }
  if(array.output_standing_inner_rear_left ) { bitmask_5 = bit_set(bitmask_5, bit_1) ; }
  if(array.output_fog_front_left           ) { bitmask_5 = bit_set(bitmask_5, bit_2) ; }
  if(array.output_reverse_rear_left        ) { bitmask_5 = bit_set(bitmask_5, bit_3) ; }
  if(array.output_lowbeam_front_left       ) { bitmask_5 = bit_set(bitmask_5, bit_4) ; }
  if(array.output_lowbeam_front_right      ) { bitmask_5 = bit_set(bitmask_5, bit_5) ; }
  if(array.output_fog_front_right          ) { bitmask_5 = bit_set(bitmask_5, bit_6) ; }
  if(array.output_brake_rear_left          ) { bitmask_5 = bit_set(bitmask_5, bit_7) ; }
  if(array.input_vertical_aim              ) { bitmask_6 = bit_set(bitmask_6, bit_1) ; }
  if(array.output_license_rear_right       ) { bitmask_6 = bit_set(bitmask_6, bit_2) ; }
  if(array.output_standing_rear_left       ) { bitmask_6 = bit_set(bitmask_6, bit_3) ; }
  if(array.output_brake_rear_middle        ) { bitmask_6 = bit_set(bitmask_6, bit_4) ; }
  if(array.output_standing_front_right     ) { bitmask_6 = bit_set(bitmask_6, bit_5) ; }
  if(array.output_turn_front_right         ) { bitmask_6 = bit_set(bitmask_6, bit_6) ; }
  if(array.output_turn_rear_left           ) { bitmask_6 = bit_set(bitmask_6, bit_7) ; }
  if(array.output_turn_rear_right          ) { bitmask_7 = bit_set(bitmask_7, bit_1) ; }
  if(array.output_fog_rear_left            ) { bitmask_7 = bit_set(bitmask_7, bit_2) ; }
  if(array.output_standing_inner_rear_right) { bitmask_7 = bit_set(bitmask_7, bit_3) ; }
  if(array.output_standing_rear_right      ) { bitmask_7 = bit_set(bitmask_7, bit_4) ; }
  if(array.output_turn_front_left          ) { bitmask_7 = bit_set(bitmask_7, bit_6) ; }
  if(array.output_reverse_rear_right       ) { bitmask_7 = bit_set(bitmask_7, bit_7) ; }
  if(array.mode_failsafe                   ) { bitmask_8 = bit_set(bitmask_8, bit_0) ; }
  if(array.output_led_switch_hazard        ) { bitmask_8 = bit_set(bitmask_8, bit_2) ; }
  if(array.output_led_switch_light         ) { bitmask_8 = bit_set(bitmask_8, bit_3) ; }
  if(array.output_reverse_rear_trailer     ) { bitmask_8 = bit_set(bitmask_8, bit_5) ; }
  if(array.mode_sleep                      ) { bitmask_8 = bit_set(bitmask_8, bit_6) ; }


  // Suspect	
  // array.clamp_58g
  // array.output_fog_rear_right
  // array.output_fog_rear_trailer

  // ?? 
  // if(array.) { bitmask_0 = bit_set(bitmask_0, bit_3) ; }
  // if(array.) { bitmask_0 = bit_set(bitmask_0, bit_5) ; }
  // if(array.) { bitmask_1 = bit_set(bitmask_1, bit_3) ; }
  // if(array.) { bitmask_2 = bit_set(bitmask_2, bit_3) ; }
  // if(array.) { bitmask_4 = bit_set(bitmask_4, bit_0) ; }
  // if(array.) { bitmask_4 = bit_set(bitmask_4, bit_1) ; }
  // if(array.) { bitmask_4 = bit_set(bitmask_4, bit_3) ; }
  // if(array.) { bitmask_4 = bit_set(bitmask_4, bit_7) ; }
  // if(array.) { bitmask_6 = bit_set(bitmask_6, bit_0) ; }
  // if(array.) { bitmask_7 = bit_set(bitmask_7, bit_0) ; }
  // if(array.) { bitmask_7 = bit_set(bitmask_7, bit_5) ; }
  // if(array.) { bitmask_8 = bit_set(bitmask_8, bit_1) ; }
  // if(array.) { bitmask_8 = bit_set(bitmask_8, bit_4) ; }
  // if(array.) { bitmask_8 = bit_set(bitmask_8, bit_7) ; }

  // Assemble the output array
  var output = [
    bitmask_0,
    bitmask_1,
    bitmask_2,
    bitmask_3,
    bitmask_4,
    bitmask_5,
    bitmask_6,
    bitmask_7,
    bitmask_8,
    bitmask_9,
    bitmask_10,
    bitmask_11,
  ];

  console.log('lcm_bitmask_encode() output: %s', output);
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

  var clamp_15                         = bit_test(bitmask_3, bit_5);
  var clamp_30a                        = bit_test(bitmask_0, bit_0);
  var clamp_30b                        = bit_test(bitmask_0, bit_7);
  var clamp_r                          = bit_test(bitmask_0, bit_6);
  var input_air_suspension             = bit_test(bitmask_3, bit_0);
  var input_armoured_door              = bit_test(bitmask_1, bit_6);
  var input_brake_fluid_level          = bit_test(bitmask_1, bit_7);
  var input_carb                       = bit_test(bitmask_0, bit_4);
  var input_engine_failsafe            = bit_test(bitmask_3, bit_6);
  var input_fire_extinguisher          = bit_test(bitmask_0, bit_1);
  var input_hold_up_alarm              = bit_test(bitmask_3, bit_1);
  var input_key_in_ignition            = bit_test(bitmask_1, bit_0);
  var input_kfn                        = bit_test(bitmask_1, bit_5);
  var input_preheating_fuel_injection  = bit_test(bitmask_0, bit_2);
  var input_seat_belts_lock            = bit_test(bitmask_1, bit_1);
  var input_tire_defect                = bit_test(bitmask_3, bit_7);
  var input_vertical_aim               = bit_test(bitmask_6, bit_1);
  var input_washer_fluid_level         = bit_test(bitmask_3, bit_2);
  var mode_failsafe                    = bit_test(bitmask_8, bit_0);
  var mode_sleep                       = bit_test(bitmask_8, bit_6);
  var output_brake_rear_left           = bit_test(bitmask_5, bit_7);
  var output_brake_rear_middle         = bit_test(bitmask_6, bit_4);
  var output_brake_rear_right          = bit_test(bitmask_4, bit_4);
  var output_fog_front_left            = bit_test(bitmask_5, bit_2);
  var output_fog_front_right           = bit_test(bitmask_5, bit_6);
  var output_fog_rear_left             = bit_test(bitmask_7, bit_2);
  var output_highbeam_front_left       = bit_test(bitmask_4, bit_6);
  var output_highbeam_front_right      = bit_test(bitmask_4, bit_5);
  var output_led_switch_hazard         = bit_test(bitmask_8, bit_2);
  var output_led_switch_light          = bit_test(bitmask_8, bit_3);
  var output_license_rear_left         = bit_test(bitmask_4, bit_2);
  var output_license_rear_right        = bit_test(bitmask_6, bit_2);
  var output_lowbeam_front_left        = bit_test(bitmask_5, bit_4);
  var output_lowbeam_front_right       = bit_test(bitmask_5, bit_5);
  var output_reverse_rear_left         = bit_test(bitmask_5, bit_3);
  var output_reverse_rear_right        = bit_test(bitmask_7, bit_7);
  var output_reverse_rear_trailer      = bit_test(bitmask_8, bit_5);
  var output_standing_front_left       = bit_test(bitmask_5, bit_0);
  var output_standing_front_right      = bit_test(bitmask_6, bit_5);
  var output_standing_inner_rear_left  = bit_test(bitmask_5, bit_1);
  var output_standing_inner_rear_right = bit_test(bitmask_7, bit_3);
  var output_standing_rear_left        = bit_test(bitmask_6, bit_3);
  var output_standing_rear_right       = bit_test(bitmask_7, bit_4);
  var output_turn_front_left           = bit_test(bitmask_7, bit_6);
  var output_turn_front_right          = bit_test(bitmask_6, bit_6);
  var output_turn_rear_left            = bit_test(bitmask_6, bit_7);
  var output_turn_rear_right           = bit_test(bitmask_7, bit_1);
  var switch_brake                     = bit_test(bitmask_2, bit_0);
  var switch_fog_front                 = bit_test(bitmask_2, bit_2);
  var switch_fog_rear                  = bit_test(bitmask_2, bit_4);
  var switch_hazard                    = bit_test(bitmask_1, bit_4);
  var switch_highbeam                  = bit_test(bitmask_2, bit_1);
  var switch_highbeam_flash            = bit_test(bitmask_1, bit_2);
  var switch_lowbeam_1                 = bit_test(bitmask_3, bit_4);
  var switch_lowbeam_2                 = bit_test(bitmask_3, bit_3);
  var switch_standing                  = bit_test(bitmask_2, bit_5);
  var switch_turn_left                 = bit_test(bitmask_2, bit_7);
  var switch_turn_right                = bit_test(bitmask_2, bit_6);

  // Suspect
  // var clamp_58g                       = bit_test(bitmask_, bit_);
  // var output_fog_rear_right           = bit_test(bitmask_, bit_);
  // var output_fog_rear_trailer         = bit_test(bitmask_, bit_);

  var output = {
    clamp_15                         : clamp_15,
    clamp_30a                        : clamp_30a,
    clamp_30b                        : clamp_30b,
    clamp_r                          : clamp_r,
    input_air_suspension             : input_air_suspension,
    input_armoured_door              : input_armoured_door,
    input_brake_fluid_level          : input_brake_fluid_level,
    input_carb                       : input_carb,
    input_engine_failsafe            : input_engine_failsafe,
    input_fire_extinguisher          : input_fire_extinguisher,
    input_hold_up_alarm              : input_hold_up_alarm,
    input_key_in_ignition            : input_key_in_ignition,
    input_kfn                        : input_kfn,
    input_preheating_fuel_injection  : input_preheating_fuel_injection,
    input_seat_belts_lock            : input_seat_belts_lock,
    input_tire_defect                : input_tire_defect,
    input_vertical_aim               : input_vertical_aim,
    input_washer_fluid_level         : input_washer_fluid_level,
    mode_failsafe                    : mode_failsafe,
    mode_sleep                       : mode_sleep,
    output_brake_rear_middle         : output_brake_rear_middle,
    output_brake_rear_right          : output_brake_rear_right,
    output_fog_front_left            : output_fog_front_left,
    output_fog_front_right           : output_fog_front_right,
    output_fog_rear_left             : output_fog_rear_left,
    output_highbeam_front_left       : output_highbeam_front_left,
    output_highbeam_front_right      : output_highbeam_front_right,
    output_led_switch_hazard         : output_led_switch_hazard,
    output_led_switch_light          : output_led_switch_light,
    output_license_rear_left         : output_license_rear_left,
    output_license_rear_right        : output_license_rear_right,
    output_lowbeam_front_left        : output_lowbeam_front_left,
    output_lowbeam_front_right       : output_lowbeam_front_right,
    output_reverse_rear_left         : output_reverse_rear_left,
    output_reverse_rear_right        : output_reverse_rear_right,
    output_reverse_rear_trailer      : output_reverse_rear_trailer,
    output_standing_front_left       : output_standing_front_left,
    output_standing_front_right      : output_standing_front_right,
    output_standing_inner_rear_left  : output_standing_inner_rear_left,
    output_standing_inner_rear_right : output_standing_inner_rear_right,
    output_standing_rear_left        : output_standing_rear_left,
    output_standing_rear_right       : output_standing_rear_right,
    output_turn_front_left           : output_turn_front_left,
    output_turn_front_right          : output_turn_front_right,
    output_turn_rear_left            : output_turn_rear_left,
    output_turn_rear_right           : output_turn_rear_right,
    switch_brake                     : switch_brake,
    switch_fog_front                 : switch_fog_front,
    switch_fog_rear                  : switch_fog_rear,
    switch_hazard                    : switch_hazard,
    switch_highbeam                  : switch_highbeam,
    switch_highbeam_flash            : switch_highbeam_flash,
    switch_lowbeam_1                 : switch_lowbeam_1,
    switch_lowbeam_2                 : switch_lowbeam_2,
    switch_standing                  : switch_standing,
    switch_turn_left                 : switch_turn_left,
    switch_turn_right                : switch_turn_right,
  }

  // Suspect
  // clamp_58g                        : clamp_58g,
  // output_fog_rear_right            : output_fog_rear_right,
  // output_fog_rear_trailer          : output_fog_rear_trailer,

  return output;
}

// All the possible values to send to the LCM
var array_of_possible_values = {
  clamp_15                         : true,
  clamp_30a                        : true,
  clamp_30b                        : true,
  clamp_r                          : true,
  input_air_suspension             : true,
  input_armoured_door              : true,
  input_brake_fluid_level          : true,
  input_carb                       : true,
  input_engine_failsafe            : true,
  input_fire_extinguisher          : true,
  input_hold_up_alarm              : true,
  input_key_in_ignition            : true,
  input_kfn                        : true,
  input_preheating_fuel_injection  : true,
  input_seat_belts_lock            : true,
  input_tire_defect                : true,
  input_vertical_aim               : true,
  input_washer_fluid_level         : true,
  mode_failsafe                    : true,
  mode_sleep                       : true,
  output_brake_rear_left           : true,
  output_brake_rear_middle         : true,
  output_brake_rear_right          : true,
  output_fog_front_left            : true,
  output_fog_front_right           : true,
  output_fog_rear_left             : true,
  output_highbeam_front_left       : true,
  output_highbeam_front_right      : true,
  output_led_switch_hazard         : true,
  output_led_switch_light          : true,
  output_license_rear_left         : true,
  output_license_rear_right        : true,
  output_lowbeam_front_left        : true,
  output_lowbeam_front_right       : true,
  output_reverse_rear_left         : true,
  output_reverse_rear_right        : true,
  output_reverse_rear_trailer      : true,
  output_standing_front_left       : true,
  output_standing_front_right      : true,
  output_standing_inner_rear_left  : true,
  output_standing_inner_rear_right : true,
  output_standing_rear_left        : true,
  output_standing_rear_right       : true,
  output_turn_front_left           : true,
  output_turn_front_right          : true,
  output_turn_rear_left            : true,
  output_turn_rear_right           : true,
  switch_brake                     : true,
  switch_fog_front                 : true,
  switch_fog_rear                  : true,
  switch_hazard                    : true,
  switch_highbeam                  : true,
  switch_highbeam_flash            : true,
  switch_lowbeam_1                 : true,
  switch_lowbeam_2                 : true,
  switch_standing                  : true,
  switch_turn_left                 : true,
  switch_turn_right                : true,

  // Suspect
  // clamp_58g                        : true,
  // output_fog_rear_right            : true,
  // output_fog_rear_trailer          : true,
}

function go() {
  var array = {
    output_highbeam_front_left       : true,
    output_highbeam_front_right      : true,
  }

  lcm_send(lcm_bitmask_encode(array));
}

// Run shutdown() on SIGINT
//process.on('SIGINT', shutdown);
// Run go() on port_open
//ibus_connection.on('port_open', go);

startup();







// Static content 
dispatcher.setStatic('');
dispatcher.setStaticDirname('/');

// LCM GET request    
dispatcher.onGet('/lcm', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('GET request\n');
});

// LCM POST request
dispatcher.onPost('/lcm', function(request, response) {
  console.log('/lcm POST');
  response.writeHead(200, {'Content-Type': 'text/plain'});

  var post = query_string.parse(request.body);
  console.log(post);
  lcm_send(lcm_bitmask_encode(post));

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
