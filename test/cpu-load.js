#!/usr/bin/env node

const os = require('os');
var load_1m = parseFloat(os.loadavg()[0].toFixed(2));

console.log(load_1m);
