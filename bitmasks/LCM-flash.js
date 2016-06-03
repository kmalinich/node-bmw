#!/usr/bin/env node

var clc = require('cli-color');


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

function bit_sample(dsc, hex) {
	var bit_0_test = bit_test(hex, bit_0);
	var bit_1_test = bit_test(hex, bit_1);
	var bit_2_test = bit_test(hex, bit_2);
	var bit_3_test = bit_test(hex, bit_3);
	var bit_4_test = bit_test(hex, bit_4);
	var bit_5_test = bit_test(hex, bit_5);
	var bit_6_test = bit_test(hex, bit_6);
	var bit_7_test = bit_test(hex, bit_7);

	var string = clc.magenta(dsc)+'|'+clc.yellow(pad(hex, 3))+'|'+bit_0_test+'|'+bit_1_test+'|'+bit_2_test+'|'+bit_3_test+'|'+bit_4_test+'|'+bit_5_test+'|'+bit_6_test+'|'+bit_7_test;
	string     = string.replace(/true/g,  clc.green('TRU'));
	string     = string.replace(/false/g, clc.red('FAL'));

	console.log(string);
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

var line       = '-------------------------------------------';
var header_dec = '            001|002|004|008|016|032|064|128';
var header     = 'Descr  |Val|Hzd|Low|Fde|Hig| 4 | 5 | 6 | 7 ';

console.log(clc.yellow(header_dec));
console.log(clc.magenta(header));
console.log(line);

// lcm_bitmask_decode(0x32);
// lcm_bitmask_decode(0x72);
// lcm_bitmask_decode(0xB2);

bit_sample('Off    ', 0x00);
bit_sample('IKE Hzd', 0x01);
bit_sample('Hazards', 0x02);
bit_sample('???    ', 0x03);
bit_sample('Hzrd+Lw', 0x0A);
