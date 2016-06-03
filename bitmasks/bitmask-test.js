#!/usr/bin/env node

var clc = require('cli-color');

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
	var bit_0 = 1;
	var bit_1 = 2;
	var bit_2 = 4;
	var bit_3 = 8;
	var bit_4 = 16;
	var bit_5 = 32;
	var bit_6 = 64;
	var bit_7 = 128;
	var bit_8 = 256;

	var bit_0_test = bit_test(hex, bit_0);
	var bit_1_test = bit_test(hex, bit_1);
	var bit_2_test = bit_test(hex, bit_2);
	var bit_3_test = bit_test(hex, bit_3);
	var bit_4_test = bit_test(hex, bit_4);
	var bit_5_test = bit_test(hex, bit_5);
	var bit_6_test = bit_test(hex, bit_6);
	var bit_7_test = bit_test(hex, bit_7);
	var bit_8_test = bit_test(hex, bit_8);

	var string = clc.magenta(dsc)+'|'+clc.yellow(pad(hex, 3))+'|'+bit_0_test+'|'+bit_1_test+'|'+bit_2_test+'|'+bit_3_test+'|'+bit_4_test+'|'+bit_5_test+'|'+bit_6_test+'|'+bit_7_test+'|'+bit_8_test;
	string = string.replace(/true/g,  clc.green('TRU'));
	string = string.replace(/false/g, clc.red('FAL'));
	console.log(string);
}

var header = '        001|002|004|008|016|032|064|128|256';
console.log(clc.yellow(header));
var header = 'DSC|VAL| 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8';
console.log(clc.magenta(header));

bit_sample('1dn', 0x11);
bit_sample('2dn', 0x01);
bit_sample('3dn', 0x12);
bit_sample('4dn', 0x02);
bit_sample('5dn', 0x13);
bit_sample('6dn', 0x03);

bit_sample('1up', 0x91);
bit_sample('2up', 0x81);
bit_sample('3up', 0x92);
bit_sample('4up', 0x82);
bit_sample('5up', 0x93);
bit_sample('6up', 0x83);
