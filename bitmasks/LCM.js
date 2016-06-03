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
	} else {
		return false;
	}
}

function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


function lcm_bitmask_decode(value) {

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

function offoff() {
	var bit_0_test = bit_test(hex, bit_0);
	var bit_1_test = bit_test(hex, bit_1);
	var bit_2_test = bit_test(hex, bit_2);
	var bit_3_test = bit_test(hex, bit_3);
	var bit_4_test = bit_test(hex, bit_4);
	var bit_5_test = bit_test(hex, bit_5);
	var bit_6_test = bit_test(hex, bit_6);
	var bit_7_test = bit_test(hex, bit_7);

	var dsc = 'superoff';
	var hex = 0x00;

	var string = dsc+'|'+clc.yellow(pad(hex, 3))+'|'+bit_0_test+'|'+bit_1_test+'|'+bit_2_test+'|'+bit_3_test+'|'+bit_4_test+'|'+bit_5_test+'|'+bit_6_test+'|'+bit_7_test;
	string     = string.replace(/true/g,  clc.green('TRU'));
	string     = string.replace(/false/g, clc.red('FAL'));

	console.log(string);

	var src = 0x00; // GM
	var dst = 0xBF; // GLO
	var msg = new Buffer([0x76, hex]);

	var ibus_packet = {
		src: src,
		dst: dst,
		msg: msg,
	}

	ibus_connection.send_message(ibus_packet);
}

function bit_sample(dsc, hex, callback) {
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

	var src = 0x3F; // DIA
	var dst = 0xBF; // GLO

	var msg   = new Buffer([0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, hex]);

	var ibus_packet = {
		src: src,
		dst: dst,
		msg: msg,
	}

	setTimeout(function() {
		ibus_connection.send_message(ibus_packet);
		callback(null, 'message sent');
	}, 2000);
}

function do_sample() {
	offoff();
	var line       = '--------------------------------------------';
	var header_dec = '             001|002|004|008|016|032|064|128';
	var header     = 'Descr   |Val| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 ';

	console.log(clc.yellow(header_dec));
	console.log(clc.magenta(header));
	console.log(line);

	var result = wait.for(bit_sample, 'Off     ', 0x00);
}

// startup();

function go() {
	wait.launchFiber(do_sample);
}

// ibus_connection.on('port_open', go);

// RR turn, R sidemarker
var buffer_data   = 0x02;
// Cluster
var buffer_data   = 0x04;
// RR turn, R tail, R sidemarker
var buffer_data   = 0x0a;

lcm_bitmask_decode(buffer_data);
// lcm_bitmask_decode(0x72);
// lcm_bitmask_decode(0xB2);

//shutdown();
