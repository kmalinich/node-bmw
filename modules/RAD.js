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


var RAD = function(omnibus) {

  // Self reference
  var _self = this;

  // Exposed data
  this.parse_data = parse_data;


  // Parse data sent by real RAD module
  function parse_data(packet) {
    // Init variables
    var dst     = omnibus.bus_modules.get_module_name(data.dst);
    var src     = omnibus.bus_modules.get_module_name(data.src);
    var message = data.message;
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

    // CD changer emulation handling
    else if (dst == 'CDC' && message[0] == 0x01) {
			command = 'request'
      command = '[CDC] device status';

      // Do CDC->LOC Device status ready
      omnibus.CDC.send_device_status_ready();
    }

    else if(dst == 'CDC' && message[0] == 0x38 && message[1] == 0x00 && message[2] == 0x00) {
			command = 'request'
      data    = '[CDC] CD control status';
			

      // Do CDC->LOC CD status play
      omnibus.CDC.send_cd_status_play();
    }

    else {
      command = 'unknown';                                                                    
      data    = new Buffer(message);
    }

    console.log('[RAD] Sent %s:', command, data);
  }
}

module.exports = RAD;
