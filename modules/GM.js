#!/usr/bin/env node

// npm libraries
var clc  = require('cli-color');
var wait = require('wait.for');

// Bitmasks in hex
var bit_0 = 0x01;
var bit_1 = 0x02;
var bit_2 = 0x04;
var bit_3 = 0x08;
var bit_4 = 0x10;
var bit_5 = 0x20;
var bit_6 = 0x40;
var bit_7 = 0x80;


var GM = function(ibus_connection) {

  // self reference
  var _self = this;

  // exposed data
  this.gm_send           = gm_send;
  this.bit_test          = bit_test;
  this.bit_set           = bit_set;
  this.gm_bitmask_encode = gm_bitmask_encode;
  this.gm_bitmask_decode = gm_bitmask_decode;

  // Send message to GM
  function gm_send(packet) {
    var src = 0x3F; // DIA
    var dst = 0x00; // GM
    var cmd = 0x0C; // Set IO status 

    // Add the command to the beginning of the GM hex array
    packet.unshift(cmd);

    var ibus_packet = {
      src: src,
      dst: dst,
      msg: new Buffer(packet),
    }

    // Send the message
    console.log('Sending GM packet');
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

  // Encode the GM bitmask string from an input of true/false values
  function gm_bitmask_encode(array) {
    // Initialize bitmask variables
    var bitmask_0  = 0x00;
    var bitmask_1  = 0x00;
    var bitmask_2  = 0x00;
    var bitmask_3  = 0x00;

    // Set the various bitmask values according to the input array
    if(array.clamp_30a                       ) { bitmask_0 = bit_set(bitmask_0, bit_0) ; }

    // Assemble the output array
    var output = [
      bitmask_0,
      bitmask_1,
      bitmask_2,
      bitmask_3,
    ];

    console.log('gm_bitmask_encode() output: %s', output);
    gm_send(output);

    //return output;
  }

  // Decode the GM bitmask string and output an array of true/false values
  function gm_bitmask_decode(array) {
    var bitmask_0 = array[0];
    var bitmask_1 = array[1];
    var bitmask_2 = array[2];
    var bitmask_3 = array[3];

    var clamp_15                         = bit_test(bitmask_3, bit_5);

    var output = {
      clamp_15                         : clamp_15,
    }

    return output;
  }

  // All the possible values to send to the GM
  var array_of_possible_values = {
    wip
    seat_driver_backrest_backward : true,
    seat_driver_backrest_forward  : true,
    seat_driver_backward          : true,
    seat_driver_down              : true,
    seat_driver_forward           : true,
    seat_driver_headrest_down     : true,
    seat_driver_headrest_up       : true,
    seat_driver_tilt_backward     : true,
    seat_driver_tilt_forward      : true,
    seat_driver_up                : true,
    seat_driver_upper_backwards   : true,
    seat_driver_upper_forwards    : true,
    wheel_backward                : true,
    wheel_down                    : true,
    wheel_forward                 : true,
    wheel_up                      : true,
    window_front_left_down        : true,
    window_front_left_up          : true,
    window_front_right_down       : true,
    window_front_right_up         : true,
    window_rear_left_down         : true,
    window_rear_left_up           : true,
    window_rear_right_down        : true,
    window_rear_right_up          : true,
    window_sunroof_down           : true,
    window_sunroof_up             : true,
  }
}

module.exports = GM;
