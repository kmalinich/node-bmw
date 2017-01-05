var now = require("performance-now")
var start = now()
var end = now()
console.log(start) // ~ 0.05 on my system
console.log((end-start).toFixed(3)) // ~ 0.002 on my system
