#!/usr/bin/env node

function hex2a(hexx) {
	var hex = hexx.toString();
	var str = '';
	for (var i = 0; i < hex.length; i += 2)
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	return str;
}

// 54 47 56 44 80 40 06 EE 40 15 00 00 00 52
// VIN GV44804
// Total dist 177400 km
// SI-L 210 litres since last service
// SI-T   0   days since last service

var message = new Buffer([0x54, 0x47, 0x56, 0x44, 0x80, 0x40, 0x06, 0xEE, 0x40, 0x15, 0x00, 0x00, 0x00, 0x52]);
var VIN     = hex2a(message[1].toString(16))+hex2a(message[2].toString(16))+message[3].toString(16)+message[4].toString(16)+message[5].toString(16)[0];
console.log('Should be GV44804, you got %s', VIN);

var message = new Buffer([0x47, 0x43, 0x95, 0x64, 0x60, 0x07, 0xf4, 0x00, 0x44, 0x00, 0x00, 0x00, 0x00]);
var VIN     = hex2a(message[0].toString(16))+hex2a(message[1].toString(16))+message[2].toString(16)+message[3].toString(16)+message[4].toString(16)[0];
console.log('Should be GC95646, you got %s', VIN);

var odometer_value1 = message[7] << 16;
var odometer_value2 = message[6] << 8;
var odometer_value  = odometer_value1 + odometer_value2 + message[5];
console.log('Odometer : %d', odometer_value);
