#!/usr/bin/env node

var now = require('performance-now')

var start = now().toFixed(1);
var end   = now().toFixed(1);

console.log(start)
console.log(end)
console.log(end-start)
