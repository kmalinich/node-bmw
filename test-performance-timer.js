#!/usr/bin/env node

var now = require("performance-now")
var start = now()
var end = now()

console.log(start)
console.log(end)
console.log((end-start))
console.log((end-start).toFixed(3))
