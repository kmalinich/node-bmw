#!/usr/bin/env node

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

var suncalc = require('suncalc');

var current_time = new Date();
var sun_times    = suncalc.getTimes(current_time, 39.333581, -84.327600);

var lights_on  = sun_times.sunsetStart;
var lights_off = sun_times.sunriseEnd;

console.log('Current time    : %s', current_time);
console.log('Lights on time  : %s', lights_on);
console.log('Lights off time : %s', lights_off);

var light_status;

if (current_time > lights_on) {
	light_status = true;
}
else {
	light_status = false;
}

console.log('Light status    : %s', light_status);
