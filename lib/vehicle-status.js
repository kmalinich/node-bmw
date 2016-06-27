#!/usr/bin/env node

var vehicle_status = {
  engine         : {
    speed          : 0,
    status         : 'off',
  },
  vehicle        : {
    speed_kmh      : 0,
    speed_mph      : 0,
    speed_mph_full : 0,
    handbrake      : 'off',
    ignition       : 'off',
  },
  temperature    : {
    coolant_c      : 0,
    coolant_f      : 0,
    exterior_c     : 0,
    exterior_f     : 0,
  },
  obc            : {
    consumption_1  : 0,
    consumption_2  : 0,
    time           : "00:00",
  },
  flaps          : {
    hood           : false,
    trunk          : false,
    front_left     : false,
    front_right    : false,
    rear_left      : false,
    rear_right     : false,
  },
  windows        : {
    roof           : false,
    front_left     : false,
    front_right    : false,
    rear_left      : false,
    rear_right     : false,
  },
}

module.exports = vehicle_status;
