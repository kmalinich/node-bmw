#!/usr/bin/env node

// Test number for bitmask
function bit_test(num, bit) {
  if ((num & bit) != 0) { return true; }
  else { return false; }
}

// Array of all DSP modes
var dsp_modes = {
  0 : 'concert hall',
  1 : 'jazz club',
  2 : 'cathedral',
  3 : 'memory 1',
  4 : 'memory 2',
  5 : 'memory 3',
  6 : 'DSP off',
}

var DSP = function(omnibus) {
  // Exposed data
  this.eq_decode          = eq_decode;
  this.eq_encode          = eq_encode;
  this.eq_send            = eq_send;
  this.parse_out          = parse_out;
  this.send_device_status = send_device_status;

  // Parse data sent from DSP module
  function parse_out(data) {
    // Init variables
    var command;
    var value;

    switch (data.msg[0]) {
      case 0x01: // Request: device status
        command = 'request';
        value   = 'device status';
        break;

      case 0x02: // Device status
        switch (data.msg[1]) {
          case 0x00:
            command = 'device status';
            value   = 'ready';
            break;

          case 0x01:
            command = 'device status';
            value   = 'ready after reset';

            // Set value to okay powering on via BMBT
            omnibus.status.dsp.ready = true;
            console.log('[ node-bmw] omnibus.status.dsp.ready: \'%s\'', omnibus.status.dsp.ready);

            // Attempt to send BMBT power button
            setTimeout(() => {
              omnibus.BMBT.power_on_if_ready();
            }, 2000);
            break;
        }
        break;

      case 0x10: // Request: ignition status
        command = 'request';
        value   = 'ignition status';
        break;

      case 0x35: // Broadcast: DSP memory
        command = 'broadcast';
        value   = 'DSP memory';
        break;

      case 0x79: // Request: door/flap status
        command = 'request';
        value   = 'door/flap status';
        break;

      default:
        command = 'unknown';
        value   = Buffer.from(data.msg);
        break;
    }

    console.log('[%s->%s] %s:', data.src.name, data.dst.name, command, value);
  }

  // Send EQ data to DSP
  function eq_send(msg) {
    omnibus.ibus.send({
			src : 'DSPC',
      dst : 'DSP',
      msg : msg,
    });

    console.log('[node::DSP] Sent DSP EQ message');
  }

  // Parse message from DSP amp
  function eq_decode(data) {
    var dsp_mode = data[1]-1;

    var reverb   = data[2] & 0x0F;
    if (bit_test(data[2], 0x10)) {
      reverb *= -1;
    }

    var room_size = data[3] & 0x0F;
    if (bit_test(data[3], 0x10)) {
      room_size *= -1;
    }

    var band = [];
    var n;

    for (n = 0; n<7; n++) {
      band[n] = data[4+n] & 0x0F;

      if(bit_test(data[n+4], 0x10)) {
        band[n]*=-1;
      }
    }

    // Insert parsed data into omnibus.status
    omnibus.status.dsp.mode      = dsp_modes[dsp_mode];
    omnibus.status.dsp.reverb    = reverb;
    omnibus.status.dsp.room_size = room_size;
    omnibus.status.dsp.eq.band0  = band[0];
    omnibus.status.dsp.eq.band1  = band[1];
    omnibus.status.dsp.eq.band2  = band[2];
    omnibus.status.dsp.eq.band3  = band[3];
    omnibus.status.dsp.eq.band4  = band[4];
    omnibus.status.dsp.eq.band5  = band[5];
    omnibus.status.dsp.eq.band6  = band[6];

    console.log('[node::DSP] Decoded DSP EQ');
  }

  function eq_encode(data) {
    var reverb_out    = [0x34, 0x94 + data.memory, data.reverb & 0x0F];
    eq_send(reverb_out);

    var room_size_out = [0x34, 0x94 + data.memory, (data.room_size & 0x0F) | 0x20];
    eq_send(room_size_out);

    for (var band_num = 0; band_num < 7; band_num++) {
      // ... Don't look at me...
      var band_out = [0x34, 0x14+data.memory, (((band_num * 2) << 4) & 0xF0) | ((data.band[band_num] < 0 ? (0x10 | (Math.abs(data.band[band_num]) & 0x0F)) : (data.band[band_num] & 0x0F)))];
      eq_send(band_out);
    }

    console.log('[node::DSP] Encoded DSP EQ');
  }

  // DSP->GLO Device status ready
  function send_device_status() {
    // Init variables
    var command = 'device status';
    var data;
    var msg;

    // Handle 'ready' vs. 'ready after reset'
    if (omnibus.status.dsp.reset === true) {
      omnibus.status.dsp.reset = false;
      data  = 'ready';
      msg   = [0x02, 0x00];
    }
    else {
      data = 'ready after reset';
      msg  = [0x02, 0x01];
    }

    omnibus.ibus.send({
      dst : 'GLO',
      msg : msg,
      src : 'DSP',
    });

    console.log('[DSP->GLO] Sent %s:', command, data);
  }
}

module.exports = DSP;
