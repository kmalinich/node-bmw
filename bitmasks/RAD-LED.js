#!/usr/bin/env node

// Libraries
var clc            = require('cli-color');
var wait           = require('wait.for');
var ibus_interface = require('../ibus/ibus-interface.js');
var bus_modules    = require('../lib/bus-modules.js');

// IBUS connection handle
var ibus_connection = new ibus_interface();

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


// Bitmasks in hex
var bit_0 = 0x01;
var bit_1 = 0x02;
var bit_2 = 0x04;
var bit_3 = 0x08;
var bit_4 = 0x10;
var bit_5 = 0x20;
var bit_6 = 0x40;
var bit_7 = 0x80;

// Bitmask constants
var hazard  = bit_1;
var beam_lo = bit_2;
var fade    = bit_3;
var beam_hi = bit_4;


function bit_test(num, bit) {
	if ((num & bit) != 0) {
		return true;
	}
	else {
		return false;
	}
}

function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


function rad_led_bitmask_decode(value) {

	// Yellow solid: 1
	// Red    solid: 4
	// Green  solid: 16
	// Yellow flash: 2
	// Red    flash: 8
	// Green  flash: 32

	// Determine action
	if (bit_test(value, hold)) {
		var action = clc.yellow('hold');
	}
	else if (bit_test(value, release)) {
		var action = clc.red('release');
	}
	else {
		var action = clc.green('press');
	}

	console.log(action);
}

function bit_sample(dsc, hex, callback) {
	setTimeout(function() {
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

		var src = 0xc8; // TEL
		var dst = 0xe7; // OBC
		var msg = new Buffer([0x2b, hex]);

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: msg,
		}

		ibus_connection.send_message(ibus_packet);
		callback(null, 'message sent');
	}, 125);
}

function do_sample() {
	var line       = '--------------------------------------------';
	var header_dec = '             001|002|004|008|016|032|064|128';
	var header     = 'Descr   |Val|S R|F R|S Y|F Y|S G|F G| 6 | 7 ';

	console.log(clc.yellow(header_dec));
	console.log(clc.magenta(header));
	console.log(line);

	var green  = clc.green( 'SG      ');
	var red    = clc.red(   '   SR   ');
	var yellow = clc.yellow('      SY');

	var result = wait.for(bit_sample, 'Off     ', 0x00);
	var result = wait.for(bit_sample, green, 0x10);
	var result = wait.for(bit_sample, 'SG SR   ', 0x11);
	var result = wait.for(bit_sample, 'SG SR SY', 0x15);
	var result = wait.for(bit_sample, '   SR SY', 0x05);
	var result = wait.for(bit_sample, yellow, 0x04);
	var result = wait.for(bit_sample, '   SR SY', 0x05);
	var result = wait.for(bit_sample, 'SG SR SY', 0x15);
	var result = wait.for(bit_sample, 'SG SR   ', 0x11);
	var result = wait.for(bit_sample, green, 0x10);
	var result = wait.for(bit_sample, 'Off     ', 0x00);
	var result = wait.for(bit_sample, green, 0x10);
	var result = wait.for(bit_sample, 'SG SR   ', 0x11);
	var result = wait.for(bit_sample, 'SG SR SY', 0x15);
	var result = wait.for(bit_sample, '   SR SY', 0x05);
	var result = wait.for(bit_sample, yellow, 0x04);
	var result = wait.for(bit_sample, '   SR SY', 0x05);
	var result = wait.for(bit_sample, 'SG SR SY', 0x15);
	var result = wait.for(bit_sample, 'SG SR   ', 0x11);
	var result = wait.for(bit_sample, green, 0x10);
	var result = wait.for(bit_sample, 'Off     ', 0x00);
	var result = wait.for(bit_sample, green, 0x10);
	var result = wait.for(bit_sample, 'SG SR   ', 0x11);
	var result = wait.for(bit_sample, 'SG SR SY', 0x15);
	var result = wait.for(bit_sample, '   SR SY', 0x05);
	var result = wait.for(bit_sample, yellow, 0x04);
	var result = wait.for(bit_sample, '   SR SY', 0x05);
	var result = wait.for(bit_sample, 'SG SR SY', 0x15);
	var result = wait.for(bit_sample, 'SG SR   ', 0x11);
	var result = wait.for(bit_sample, green, 0x10);
	var result = wait.for(bit_sample, 'Off     ', 0x00);



	// var result = wait.for(bit_sample, red, 0x01);

	// var result = wait.for(bit_sample, '   FR   ', 0x02);
	// var result = wait.for(bit_sample, '   SR SY', 0x05);
	// var result = wait.for(bit_sample, '   FR SY', 0x06);
	// var result = wait.for(bit_sample, '      FY', 0x08);
	// var result = wait.for(bit_sample, '   SR FY', 0x09);
	// var result = wait.for(bit_sample, '   FR FY', 0x0A);
	// var result = wait.for(bit_sample, 'SG SR   ', 0x11);
	// var result = wait.for(bit_sample, 'SG FR   ', 0x12);
	// var result = wait.for(bit_sample, 'SG    SY', 0x14);
	// var result = wait.for(bit_sample, 'SG SR SY', 0x15);
	// var result = wait.for(bit_sample, 'SG FR SY', 0x16);
	// var result = wait.for(bit_sample, 'SG    FY', 0x18);
	// var result = wait.for(bit_sample, 'SG SR FY', 0x19);
	// var result = wait.for(bit_sample, 'FG      ', 0x20);
	// var result = wait.for(bit_sample, 'FG SR   ', 0x21);
	// var result = wait.for(bit_sample, 'FG FR   ', 0x22);
	// var result = wait.for(bit_sample, 'FG    FY', 0x28);
	// var result = wait.for(bit_sample, 'FG FR FY', 0x2A);
}

startup();

function go() {
	wait.launchFiber(do_sample);
}

ibus_connection.on('port_open', go);


// rad_led_bitmask_decode(0x32);
// rad_led_bitmask_decode(0x72);
// rad_led_bitmask_decode(0xB2);

//shutdown();
