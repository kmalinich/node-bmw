#!/usr/bin/env node

var suncalc = require('suncalc');

var sun_times = suncalc.getTimes(new Date(), 39.333581, -84.327600);

console.log(new Date());
console.log(sun_times);

// 04:13 current
// 06:05 nightEnd
// 06:37 nauticalDawn
// 07:08 dawn
// 07:35 sunrise
// 07:37 sunriseEnd
// 19:18 sunsetStart
// 19:21 sunset
// 19:47 dusk
// 20:18 nauticalDusk
// 20:50 night
