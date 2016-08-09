#!/usr/bin/env node

// npm libraries
var clc  = require('cli-color');
var dbus = require('dbus-native');
var wait = require('wait.for');

// Bitmasks in hex
var bit_0 = 0x01; // 1
var bit_1 = 0x02; // 2
var bit_2 = 0x04; // 4
var bit_3 = 0x08; // 8
var bit_4 = 0x10; // 16
var bit_5 = 0x20; // 32
var bit_6 = 0x40; // 64
var bit_7 = 0x80; // 128

// Test number for bitmask
function bit_test(num, bit) {
  if ((num & bit) != 0) { return true; }
  else { return false; }
}


var CDC = function(omnibus) {

  // Self reference
  var _self = this;

  // Exposed data
  this.parse_data               = parse_data;
  this.send_cd_status_play      = send_cd_status_play;
  this.send_device_status_ready = send_device_status_ready;


  // Parse data sent by real CDC module
  function parse_data(message) {
    // Init variables
    var command;
    var data;

    // Device status
    if (message[0] == 0x02) {
      if (message[1] == 0x00) {
        command = 'device status';
        data    = 'ready';
      }

      else if (message[1] == 0x01) {
        command = 'device status';
        data    = 'ready after reset';
      }
    }

    // Ignition status request
    else if (message[0] == 0x10) {
      command = 'request';
      data    = 'ignition status';
    }

    // Door/flap status request
    else if (message[0] == 0x79) {
      command = 'request';
      data    = 'door/flap status';
    }

    else {
      command = 'unknown';                                                                    
      data    = new Buffer(msg);
    }

    console.log('[CDC] Sent %s:', command, data);
  }

  // CDC->LOC Device status ready
  function send_device_status_ready() {
    // Init variables
    var command = 'device status';
    var data    = 'ready';

    var src = 0x18; // CDC
    var dst = 0xFF; // LOC
    var msg = [0x02, 0x01];

    var ibus_packet = {
      src: src,
      dst: dst,
      msg: new Buffer(msg),
    }

    omnibus.ibus_connection.send_message(ibus_packet);

    console.log('[CDC->LOC] Sent %s:', command, data);
  }

  // CDC->RAD CD status playing
  function send_cd_status_play() {
    // Init variables
    var command = 'CD status';
    var data    = 'playing';

    var src = 0x18; // CDC
    var dst = 0x68; // RAD
    var msg = [0x39, 0x02, 0x09, 0x00, 0x01, 0x00, 0x01, 0x00];

    var ibus_packet = {
      src: src,
      dst: dst,
      msg: new Buffer(msg),
    }

    omnibus.ibus_connection.send_message(ibus_packet);

    console.log('[CDC->LOC] Sent %s:', command, data);
  }
}

module.exports = CDC;
