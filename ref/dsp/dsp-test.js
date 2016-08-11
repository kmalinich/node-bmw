#!/usr/bin/env node

// Test number for bitmask
function bit_test(num, bit) {
  if ((num & bit) != 0) { return true; }
  else { return false; }
}


var data_1;
var data_2;
var data_3;
var dsp_mode;
var echo;
var reverb;
var room_size;

function decode_dsp(data) {
  dsp_mode  = data[1] - 1;
  reverb    = data[2] & 0x0F;

  if (bit_test(data[2], 0x10)) {
    reverb *= -1;
  }

  room_size = data[3] & 0x0F;
  if (bit_test(data[3], 0x10)) {
    room_size *= -1;
  }

  var band = [];
  var n;

  for (n = 0; n<7; n++) {
    band[n] = data[4+n] & 0x0F;

    if(bit_test(data[4+n], 0x10)) {
      band[n]*=-1;
    }
  }

  console.log('DSP mode  : %s', dsp_mode);
  console.log('Reverb    : %s', reverb);
  console.log('Room size : %s', room_size);
  console.log('----------------');
  console.log('80Hz      : %s', band[0]);
  console.log('200Hz     : %s', band[1]);
  console.log('500Hz     : %s', band[2]);
  console.log('1KHz      : %s', band[3]);
  console.log('2KHz      : %s', band[4]);
  console.log('5KHz      : %s', band[5]);
  console.log('12KHz     : %s', band[6]);
  console.log('----------------');

  console.log(data);
}

function encode_dsp(data) {
  var memory        = 1;
  var reverb_out    = [0x34, 0x94 + data.memory, data.reverb & 0x0F];
  var room_size_out = [0x34, 0x94 + data.memory, (data.room_size & 0x0F) | 0x20];

  console.log(memory);
  console.log(reverb_out);
  console.log(room_size_out);

  for (var band_num = 0; band_num < 7; band_num++) {
    // ... Don't look at me...
    var band_out = [0x34, 0x14 + data.memory, (((band_num * 2) << 4) & 0xF0) | ((data.band[band_num] < 0 ? (0x10 | (Math.abs(data.band[band_num]) & 0x0F)) : (data.band[band_num] & 0x0F)))];
    console.log(band_out);
  }

}

data_1 = [0x35, 0x04, 0x04, 0x21, 0x0A, 0x27, 0x45, 0x71, 0x84, 0xA9, 0xCA];
data_2 = [0x35, 0x04, 0x04, 0x23, 0x05, 0x23, 0x41, 0x72, 0x91, 0xA9, 0xC9];
data_3 = [0x35, 0x05, 0x01, 0x23, 0x08, 0x22, 0x42, 0x61, 0x82, 0xA5, 0xC8];

// decode_dsp(data_1);
// decode_dsp(data_2);
// decode_dsp(data_3);

var dsp_data = {
  memory    : 1,
  reverb    : 0,
  room_size : 0,
  band : {
    0 : 0,
    1 : 0,
    2 : 0,
    3 : 0,
    4 : 0,
    5 : 0,
    6 : 0,
  },
}

encode_dsp(dsp_data);
