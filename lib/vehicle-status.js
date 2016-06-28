#!/usr/bin/env node

var vehicle_status = {
	engine             : {
		speed              : 0,
		running            : false,
	},
	vehicle            : {
		speed_unit         : 'mph',
		speed_kmh          : 0,
		speed_mph          : 0,
		handbrake          : false,
		ignition           : 'off',
		reverse            : false,
	},
	coding             : {
		unit_cons          : 'mpg',
		unit_distance      : 'mi',
		unit_speed         : 'mph',
		unit_temp          : 'c',
		unit_time          : '12h',
	},
	temperature        : {
		coolant_c          : 0,
		coolant_f          : 0,
		exterior_c         : 0,
		exterior_f         : 0,
	},
	obc                : {
		aux_heat_timer_1    : '--:--pm',
		aux_heat_timer_2    : '--:--pm',
		consumption_1_l100  : 0,
		consumption_1_mpg   : 0,
		consumption_2_l100  : 0,
		consumption_2_mpg   : 0,
		date                : '01/01/2016',
		distance_km         : 0,
		distance_mi         : 0,
		range_km            : 0,
		range_mi            : 0,
		speedavg_kph        : 0,
		speedavg_mph        : 0,
		speedlimit_kph      : 0,
		speedlimit_mph      : 0,
		stopwatch           : 0,
		temp_exterior_c     : 0,
		temp_exterior_f     : 0,
		time                : '00:00',
		timer               : 0,
	},
	flaps              : {
		hood               : false,
		trunk              : false,
		front_left         : false,
		front_right        : false,
		rear_left          : false,
		rear_right         : false,
	},
	windows            : {
		roof               : false,
		front_left         : false,
		front_right        : false,
		rear_left          : false,
		rear_right         : false,
	},
}

module.exports = vehicle_status;
