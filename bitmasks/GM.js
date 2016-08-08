#!/usr/bin/env node

// Bitmasks in hex
var bit_0 = 0x01; // 1
var bit_1 = 0x02; // 2
var bit_2 = 0x04; // 4
var bit_3 = 0x08; // 8
var bit_4 = 0x10; // 16
var bit_5 = 0x20; // 32
var bit_6 = 0x40; // 64
var bit_7 = 0x80; // 128


// Data below is probably mostly no good

0x00, 0x00 // LR down 
0x00, 0x03 // RR down
0x00, bit_1 // LR up 
0x00, bit_2 // RR up
0x00, bit_0 // Front down
0x00, bit_2 // Front down
0x00, bit_5 // Front down
0x00, bit_6 // Front down
0x00, bit_1 // Wiper+spray 
0x55, bit_0 // Driver's seat back 
0x00, bit_3 // Trunk release
0x00, bit_4 // Interior light
0x00, bit_6 // Trunk long release
