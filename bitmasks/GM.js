#!/usr/bin/env node

// Color terminal output
var clc  = require('cli-color');
var wait = require('wait.for');

// Libraries
var ibus_interface = require('../ibus-interface.js');
var ibus_modules   = require('../ibus-modules.js');

// Serial device path
var device = '/dev/tty.SLAB_USBtoUART';

// IBUS connection handle
var ibus_connection = new ibus_interface(device);

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

function print_header() {
	var header_dec = '          |001|002|004|008|016|032|064|128 || 001|002|004|008|016|032|064|128';
	var header     = 'Descriptn | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7  ||  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 ';
	var line       = '------------------------------------------ || -------------------------------';

	console.log(clc.yellow(header_dec));
	console.log(clc.magenta(header));
	console.log(line);
}

function gm_bitmask_display(dsc, hex) {
	var bit_0_test_0 = bit_test(hex[0], bit_0);
	var bit_1_test_0 = bit_test(hex[0], bit_1);
	var bit_2_test_0 = bit_test(hex[0], bit_2);
	var bit_3_test_0 = bit_test(hex[0], bit_3);
	var bit_4_test_0 = bit_test(hex[0], bit_4);
	var bit_5_test_0 = bit_test(hex[0], bit_5);
	var bit_6_test_0 = bit_test(hex[0], bit_6);
	var bit_7_test_0 = bit_test(hex[0], bit_7);

	var bit_0_test_1 = bit_test(hex[1], bit_0);
	var bit_1_test_1 = bit_test(hex[1], bit_1);
	var bit_2_test_1 = bit_test(hex[1], bit_2);
	var bit_3_test_1 = bit_test(hex[1], bit_3);
	var bit_4_test_1 = bit_test(hex[1], bit_4);
	var bit_5_test_1 = bit_test(hex[1], bit_5);
	var bit_6_test_1 = bit_test(hex[1], bit_6);
	var bit_7_test_1 = bit_test(hex[1], bit_7);

	var string = dsc+'|'+bit_0_test_0+'|'+bit_1_test_0+'|'+bit_2_test_0+'|'+bit_3_test_0+'|'+bit_4_test_0+'|'+bit_5_test_0+'|'+bit_6_test_0+'|'+bit_7_test_0+' || '+bit_0_test_1+'|'+bit_1_test_1+'|'+bit_2_test_1+'|'+bit_3_test_1+'|'+bit_4_test_1+'|'+bit_5_test_1+'|'+bit_6_test_1+'|'+bit_7_test_1;
	string     = string.replace(/true/g,  clc.green('TRU'));
	string     = string.replace(/false/g, clc.red('FAL'));
	console.log(string);
}

function bit_sample(dsc, packet, callback) {
	setTimeout(function() {
		// Display the bitmask for the two array positions
		gm_bitmask_display(dsc, packet);

		var src = 0x3F; // DIA
		var dst = 0x00; // GM
		var cmd = 0x0C; // Set IO status 

		// Add the command to the beginning of the hex array
		packet.unshift(cmd);

		var ibus_packet = {
			src: src,
			dst: dst,
			msg: new Buffer(packet),
		}

		ibus_connection.send_message(ibus_packet);
		callback(null, 'message sent');
	}, 100);
}

function do_sample() {
	// var result = wait.for(bit_sample, '0x00, 0x00', [0x00, 0x00]); // LR down 
	// var result = wait.for(bit_sample, '0x00, 0x04', [0x00, 0x03]); // RR down

	// var result = wait.for(bit_sample, '0x00, 0x01', [0x00, 0x01]); // LR up 
	// var result = wait.for(bit_sample, '0x00, 0x04', [0x00, 0x04]); // RR up

	var result = wait.for(bit_sample, '0x00, 0x08', [0x00, 0x01]); // Front down
	//var result = wait.for(bit_sample, '0x00, 0x08', [0x00, bit_2]); // Front down
	//var result = wait.for(bit_sample, '0x00, 0x08', [0x00, bit_5]); // Front down
	//var result = wait.for(bit_sample, '0x00, 0x08', [0x00, bit_6]); // Front down

	// var result = wait.for(bit_sample, '0x00, 0x08', [0x00, 0x01]); // 
	// var result = wait.for(bit_sample, '0x00, 0x08', [0x53, 0x01]); // 

	// var result = wait.for(bit_sample, '0x01, 0x00', [0x01, 0x00]); // nothing
	// var result = wait.for(bit_sample, '0x02, 0x00', [0x02, 0x00]); // nothing
	// var result = wait.for(bit_sample, '0x04, 0x00', [0x04, 0x00]); // nothing
	// var result = wait.for(bit_sample, '0x08, 0x00', [0x08, 0x00]); // 
	// var result = wait.for(bit_sample, '0x10, 0x00', [0x10, 0x00]); // 
	// var result = wait.for(bit_sample, '0x20, 0x00', [0x20, 0x00]); // 
	// var result = wait.for(bit_sample, '0x40, 0x00', [0x40, 0x00]); // 
	// var result = wait.for(bit_sample, '0x80, 0x00', [0x80, 0x00]); // 



	// var result = wait.for(bit_sample, '0x00, 0x02', [0x00, 0x02]); // Wiper+spray 
	// var result = wait.for(bit_sample, '0x00, 0x08', [0x55, 0x01]); // Driver's seat back 
	// var result = wait.for(bit_sample, '0x00, 0x08', [0x00, 0x08]); // Trunk release
	// var result = wait.for(bit_sample, '0x00, 0x10', [0x00, 0x10]); // Interior light
	// var result = wait.for(bit_sample, '0x00, 0x40', [0x00, 0x40]); // Trunk long release

	// var result = wait.for(bit_sample, '0x00, 0x20', [0x00, 0x20]); // ?? 
	// var result = wait.for(bit_sample, '0x00, 0x80', [0x00, 0x80]); // ?? 
}

function go() {
	wait.launchFiber(do_sample);
}

// Run shutdown() on SIGINT
process.on('SIGINT', shutdown);
// Run go() on port_open
ibus_connection.on('port_open', go);


startup();
print_header();

setTimeout(function() {
	shutdown();
}, 1000);
