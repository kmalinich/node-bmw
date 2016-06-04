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


// Run shutdown() on SIGINT
process.on('SIGINT', shutdown);


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

// Send IBUS message
function ibus_send(ibus_packet) {
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

// 0 pad a string
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// Display bitmask info
function lcm_bitmask_display(dsc, hex) {
  var bit_0_test = bit_test(hex, bit_0);
  var bit_1_test = bit_test(hex, bit_1);
  var bit_2_test = bit_test(hex, bit_2);
  var bit_3_test = bit_test(hex, bit_3);
  var bit_4_test = bit_test(hex, bit_4);
  var bit_5_test = bit_test(hex, bit_5);
  var bit_6_test = bit_test(hex, bit_6);
  var bit_7_test = bit_test(hex, bit_7);

  var string = dsc+'|'+clc.yellow(pad(hex, 3))+'|'+bit_0_test+'|'+bit_1_test+'|'+bit_2_test+'|'+bit_3_test+'|'+bit_4_test+'|'+bit_5_test+'|'+bit_6_test+'|'+bit_7_test;
  string     = string.replace(/true/g,  clc.green('TRU'));
  string     = string.replace(/false/g, clc.red('FAL'));

  console.log(string);
}

function bit_sample(dsc, hex, callback) {
  setTimeout(function() {
    lcm_bitmask_display(dsc, hex);

    var src = 0x3F; // DIA
    var dst = 0xBF; // GLO
    var cmd = 0x0C; // "Command the lights"

    var data = [cmd, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]; // Nothing
    var data = [cmd, 0x00, 0x00, 0xC0, 0x00, 0x00, 0x09, 0xE4, 0xC2]; // Halos, reverse, both sidemarkers, both rear turns, both front turns, license plate
    var data = [cmd, 0x00, 0x00, 0xC0, 0x00, 0x60, 0x3F, 0xE4, 0xCA]; // Everything except right front fog light..
    var data = [cmd, 0x00, 0x00, 0x00, 0x00, 0x00, 0x74, 0x00, 0x00]; // Both lowbeams+both fogs 

    var msg = new Buffer(data);

    var ibus_packet = {
      src: src,
      dst: dst,
      msg: msg,
    }

    ibus_connection.send_message(ibus_packet);
    callback(null, 'message sent');
  }, 3000);
}

function print_header() {
  var line       = '-----------------------------------------------------------------';
  var header_dec = '                                  001|002|004|008|016|032|064|128';
  var header     = 'Descr                        |Val| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 ';

  console.log(clc.yellow(header_dec));
  console.log(clc.magenta(header));
  console.log(line);
}

// Encode the LCM bitmask string from an input of true/false values
function lcm_bitmask_encode(array) {
  console.log('encoding');

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
  var brake_switch = bit_test(bitmask_0, bit_6);

  // 1
  // '1st switch w/o autolevel (stuck on)', 0x04);
  var hazard_switch = bit_test(bitmask_1, bit_4);

  // 2
  var running_lamps_1 = bit_test(bitmask_2, bit_5);
  var parking_right   = bit_test(bitmask_2, bit_6);
  var parking_left    = bit_test(bitmask_2, bit_7);

  // 3
  var running_lamps_2 = bit_test(bitmask_2, bit_3);
  var cold_monitoring = bit_test(bitmask_2, bit_5);

  // 4
  var cluster_led = bit_test(bitmask_4, bit_1);
  var hazard_led  = bit_test(bitmask_4, bit_2);
  var tail_left   = bit_test(bitmask_4, bit_3);
  var tail_right  = bit_test(bitmask_4, bit_4);
  var high_right  = bit_test(bitmask_4, bit_5);
  var high_left   = bit_test(bitmask_4, bit_6);

  // 5
  var halo_left    = bit_test(bitmask_5, bit_0);
  var brake_left   = bit_test(bitmask_5, bit_1);
  var fog_left     = bit_test(bitmask_5, bit_2);
  var reverse_left = bit_test(bitmask_5, bit_3);
  var low_left     = bit_test(bitmask_5, bit_4);
  var low_right    = bit_test(bitmask_5, bit_5);
  var fog_right    = bit_test(bitmask_5, bit_6);

  // 6
  var vertical_aim     = bit_test(bitmask_6, bit_1);
  var license          = bit_test(bitmask_6, bit_2);
  var halo_right       = bit_test(bitmask_6, bit_5);
  var turn_front_right = bit_test(bitmask_6, bit_6);
  var turn_rear_left   = bit_test(bitmask_6, bit_7);

  // 7
  var turn_rear_right = bit_test(bitmask_7, bit_1);
  var brake_right     = bit_test(bitmask_7, bit_3);
  var turn_front_left = bit_test(bitmask_7, bit_6);
  var reverse_right   = bit_test(bitmask_7, bit_7);


  // This bit always lights up the rear fog LED in the cluster no matter where in the buffer it is
  // var result = wait.for(bit_sample, 'Rfog', 0x10);

  var output = {
    'brake_left'       : brake_left,
    'brake_right'      : brake_right,
    'brake_switch'     : brake_switch,
    'cluster_led'      : cluster_led,
    'fog_left'         : fog_left,
    'fog_right'        : fog_right,
    'halo_left'        : halo_left,
    'halo_right'       : halo_right,
    'hazard_led'       : hazard_led,
    'hazard_switch'    : hazard_switch,
    'high_left'        : high_left,
    'high_right'       : high_right,
    'license'          : license,
    'low_left'         : low_left,
    'low_right'        : low_right,
    'reverse_left'     : reverse_left,
    'reverse_right'    : reverse_right,
    'tail_left'        : tail_left,
    'tail_right'       : tail_right,
    'turn_front_left'  : turn_front_left,
    'turn_front_right' : turn_front_right,
    'turn_rear_left'   : turn_rear_left,
    'turn_rear_right'  : turn_rear_right,
    'running_lamps_1'  : running_lamps_1,
    'parking_right'    : parking_right,
    'parking_left'     : parking_left,
    'running_lamps_2'  : running_lamps_2,
    'cold_monitoring'  : cold_monitoring,
  }

  console.log(output)
}

function go() {
  wait.launchFiber(do_sample);
}

//startup();
//ibus_connection.on('port_open', go);

// lcm_bitmask_display('RF halo                      ', 0x01);
// lcm_bitmask_display('LR brake                     ', 0x02);
// lcm_bitmask_display('LF fog                       ', 0x04);
// lcm_bitmask_display('LR reverse                   ', 0x08);
// lcm_bitmask_display('LF lowbeam                   ', 0x10);
// lcm_bitmask_display('RF lowbeam                   ', 0x20);
// lcm_bitmask_display('RF fog                       ', 0x40);
// lcm_bitmask_display('Both fogs+both lowbeams      ', 0x74);


var data = [0x00, 0x00, 0x00, 0x00, 0x00, 0x74, 0x00, 0x00]; // Both lowbeams+both fogs
var data = [0x00, 0x00, 0xC0, 0x00, 0x60, 0x3F, 0xE4, 0xCA]; // Everything except right front fog light..
lcm_bitmask_decode(data);

// lcm_bitmask_display('testing???                   ', 0x01);
// lcm_bitmask_display('RR turn, R sidemarker        ', 0x02);
// lcm_bitmask_display('Cluster                      ', 0x04);
// lcm_bitmask_display('testing???                   ', 0x08);
// lcm_bitmask_display('testing???                   ', 0x10);
// lcm_bitmask_display('testing???                   ', 0x20);
// lcm_bitmask_display('testing???                   ', 0x40);
// lcm_bitmask_display('testing???                   ', 0x80);

// lcm_bitmask_display('RR turn, R tail, R sidemarker', 0x0a);

//shutdown();
