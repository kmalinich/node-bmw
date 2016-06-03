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

	// Determine action
	// if (bit_test(value, hold)) {
	// 	var action = clc.yellow('hold');
	// }
	// else if (bit_test(value, release)) {
	// 	var action = clc.red('release');
	// }
	// else {
	// 	var action = clc.green('press');
	// }

	// console.log(action);
}

function bit_sample(dsc, hex, callback) {
	setTimeout(function() {
		lcm_bitmask_display(dsc, hex);

		var src = 0x3F; // DIA
		var dst = 0xBF; // GLO

		var msg   = new Buffer([0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
		var msg   = new Buffer([0x0c, 0x00, 0x00, 0xC0, 0x00, 0x00, 0x09, 0xE4, 0xC2]); // Halos, reverse, both sidemarkers, both rear turns, both front turns, license plate
		var msg   = new Buffer([0x0c, 0x00, 0x00, 0xC0, 0x00, 0x60, 0x3f, 0xE4, 0xCA]); // Everything except right front fog light.. 

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

function do_sample() {
	// Last offset
	// var result = wait.for(bit_sample, 'RR turn+R side               ', 0x02);
	// var result = wait.for(bit_sample, 'RR brake                      ', 0x08);
	// var result = wait.for(bit_sample, 'LF turn                      ', 0x40);
	// var result = wait.for(bit_sample, 'RR reverse                   ', 0x80);
	//
	// var result = wait.for(bit_sample, 'LF turn+RR turn+R side       ', 0x42);
	// var result = wait.for(bit_sample, 'LF turn+RR turn+R side+RR rev', 0xC2);
	//
	// var result = wait.for(bit_sample, 'Cluster                      ', 0x01);
	// var result = wait.for(bit_sample, 'R fog                        ', 0x10);
	// var result = wait.for(bit_sample, 'Cluster                      ', 0x20);
	// var result = wait.for(bit_sample, 'Cluster                      ', 0x04);
	
	// 2nd to last offset
	// var result = wait.for(bit_sample, 'License plate                ', 0x04);
	// var result = wait.for(bit_sample, 'RF halo                      ', 0x20);
	// var result = wait.for(bit_sample, 'RF turn                      ', 0x40);
	// var result = wait.for(bit_sample, 'LR turn+L side               ', 0x80);
	// var result = wait.for(bit_sample, 'Vertical aim                 ', 0x02);
	//
	// var result = wait.for(bit_sample, 'LR turn+L side+RF turn       ', 0xC0);
	// var result = wait.for(bit_sample, 'LR turn+L side+RF turn+Lic   ', 0xC4);
	// var result = wait.for(bit_sample, 'LRturn+Lside+RFturn+RFhal+Lic', 0xE4);
	//
	// var result = wait.for(bit_sample, 'R fog                        ', 0x10);
	// var result = wait.for(bit_sample, '??                           ', 0x01);
	// var result = wait.for(bit_sample, '??                           ', 0x08);
	// var result = wait.for(bit_sample, 'Cluster                      ', 0x00);

	// 3rd to last offset
	// var result = wait.for(bit_sample, 'RF halo                  ', 0x01);
	// var result = wait.for(bit_sample, 'LR brake                  ', 0x02);
	// var result = wait.for(bit_sample, 'LF fog                  ', 0x04);
	// var result = wait.for(bit_sample, 'LR reverse                  ', 0x08);
	// var result = wait.for(bit_sample, 'LF lowbeam                  ', 0x10);
	// var result = wait.for(bit_sample, 'RF lowbeam        ', 0x20);
	//
	// var result = wait.for(bit_sample, 'Cluster                  ', 0x00);
	// var result = wait.for(bit_sample, 'Cluster        ', 0x40);
	// var result = wait.for(bit_sample, 'Cluster                   ', 0x80);

	// 4th to last
	// var result = wait.for(bit_sample, '???', 0x00);
	// var result = wait.for(bit_sample, '???', 0x01);
	// var result = wait.for(bit_sample, 'Off? hazard switch on', 0x02);
	// var result = wait.for(bit_sample, 'Clu no hazard', 0x04);
	// var result = wait.for(bit_sample, 'RL tail', 0x08);
	// var result = wait.for(bit_sample, 'RR tail', 0x10);
	// var result = wait.for(bit_sample, 'RF highbeam', 0x20);
	// var result = wait.for(bit_sample, 'LF highbeam', 0x40);
	// var result = wait.for(bit_sample, '??', 0x80);

	// 5th to last
	// var result = wait.for(bit_sample, '???', 0x00);
	// var result = wait.for(bit_sample, '???', 0x01);
	// var result = wait.for(bit_sample, '???', 0x40);
	// var result = wait.for(bit_sample, '???', 0x80);
	// var result = wait.for(bit_sample, 'Off?', 0x02);
	// var result = wait.for(bit_sample, 'Clu no hazard', 0x04);
	// var result = wait.for(bit_sample, '1st switch pos', 0x08);
	// var result = wait.for(bit_sample, '1st switch pos+R fog', 0x10);
	// var result = wait.for(bit_sample, 'Cold mon', 0x20);
	// var result = wait.for(bit_sample, 'Cold mon', 0x20);
	// var result = wait.for(bit_sample, 'Cold mon', 0x20);

	// 6th to last
	// var result = wait.for(bit_sample, '???', 0x00);
	// var result = wait.for(bit_sample, '???', 0x01);
	// var result = wait.for(bit_sample, 'Off?', 0x02);
	// var result = wait.for(bit_sample, '???', 0x04);
	// var result = wait.for(bit_sample, '???', 0x08);
	// var result = wait.for(bit_sample, 'Rfog', 0x10);
	// var result = wait.for(bit_sample, '1st switch pos', 0x20);
	// var result = wait.for(bit_sample, 'RF halo', 0x40); // maybe more suspect, i think parking lights
	// var result = wait.for(bit_sample, 'LF halo', 0x80); // maybe more suspect

	// 7th to last
	// var result = wait.for(bit_sample, '???', 0x00);
	// var result = wait.for(bit_sample, '???', 0x01);
	// var result = wait.for(bit_sample, '??', 0x20);
	// var result = wait.for(bit_sample, '??', 0x08);
	// var result = wait.for(bit_sample, 'Off?', 0x02);
	// var result = wait.for(bit_sample, '1st switch w/o autolevel (stuck on)', 0x04);
	// var result = wait.for(bit_sample, 'Hazards (disableable after 20s)', 0x10);
	// var result = wait.for(bit_sample, '??', 0x40);
	// var result = wait.for(bit_sample, '??', 0x80);

	// 8th to last
	// var result = wait.for(bit_sample, '???', 0x00);
	// var result = wait.for(bit_sample, '???', 0x01);
	// var result = wait.for(bit_sample, 'Off?', 0x02);
	// var result = wait.for(bit_sample, '???', 0x04);
	// var result = wait.for(bit_sample, '???', 0x08);
	// var result = wait.for(bit_sample, 'Rfog', 0x10);
	// var result = wait.for(bit_sample, '???', 0x20);
	// var result = wait.for(bit_sample, 'Brake lights', 0x40);
	// var result = wait.for(bit_sample, '???', 0x80);

	var result = wait.for(bit_sample, '', 0x00);
	// var result = wait.for(bit_sample, '', 0x01);
	// var result = wait.for(bit_sample, '', 0x02);
	// var result = wait.for(bit_sample, '', 0x04);
	// var result = wait.for(bit_sample, '', 0x08);
	// var result = wait.for(bit_sample, '', 0x10);
	// var result = wait.for(bit_sample, '', 0x20);
	// var result = wait.for(bit_sample, '', 0x40);
	// var result = wait.for(bit_sample, '', 0x80);
}

startup();

function go() {
	wait.launchFiber(do_sample);
}

ibus_connection.on('port_open', go);

print_header();

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
