#!/usr/bin/env node

const jsonfile = require('jsonfile');

var file_config = 'config.json';
var file_status = 'status.json';

var config_default = require('./config-default');
var status_default = require('./status-default');

module.exports = {
	read_config : (callback) => {
		// Read config JSON
		jsonfile.readFile(file_config, (error, obj) => {
			if (error !== null) {
				log.msg({
					src : 'json',
					msg : 'Failed to read config, '+error,
				});

				config = config_default;

				if (typeof callback === 'function') { callback(); }
				return false;
			}

			config = obj;
			log.msg({
				src : 'json',
				msg : 'Read config',
			});

			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},

	read_status : (callback) => {
		// Read status JSON
		jsonfile.readFile(file_status, (error, obj) => {
			if (error !== null) {
				log.msg({
					src : 'json',
					msg : 'Failed to read status, '+error,
				});

				status = status_default;
				json.write_status(() => {});

				if (typeof callback === 'function') { callback(); }
				return false;
			}

			status = obj;
			log.msg({
				src : 'json',
				msg : 'Read status',
			});

			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},

	reset_status : (callback) => {
		// Reset some variables
		status.engine.running = false;

		status.vehicle.handbrake      = false;
		status.vehicle.ignition       = 'off';
		status.vehicle.ignition_level = 0;
		status.vehicle.locked         = null;
		status.vehicle.reverse        = false;

		status.flaps = {
			hood        : null,
			trunk       : null,
			front_left  : null,
			front_right : null,
			rear_left   : null,
			rear_right  : null,
		};

		status.gm.wiper_status = null;
		status.ihka.ac_status  = null;

		status.ike.alarm_siren_on        = null;
		status.ike.aux_heat_on           = null;
		status.ike.aux_vent_on           = null;
		status.ike.gear_p                = null;
		status.ike.gear_r                = null;
		status.ike.handbrake_on          = null;
		status.ike.immobiliser_on        = null;
		status.ike.motor_running         = null;
		status.ike.oil_pressure_low      = null;
		status.ike.reverse_not_plausible = null;
		status.ike.temp_f                = null;
		status.ike.vehicle_driving       = null;

		status.immobilizer = {
			immobilized : null,
			key_number  : null,
			key_present : null,
		};

		status.windows = {
			roof        : null,
			front_left  : null,
			front_right : null,
			rear_left   : null,
			rear_right  : null,
		};

		status.lights = {
			auto : {
				active  : false,
				lowbeam : status.lights.auto.lowbeam,
				reason  : status.lights.auto.reason,
			},
			turn : {
				left : {
					active  : false,
					comfort : false,
					depress : null,
				},
				right : {
					active  : false,
					comfort : false,
					depress : null,
				},
				comfort_cool    : true,
				depress_elapsed : null,
				fast            : null,
				sync            : null,
			},
			fog : {
				front : null,
				rear  : null,
			},
			standing : {
				front : null,
				rear  : null,
			},
			trailer : {
				fog      : null,
				reverse  : null,
				standing : null,
			},
			all_off         : null,
			brake           : null,
			dimmer_value_3  : null,
			hazard          : null,
			highbeam        : null,
			interior        : null,
			lowbeam         : null,
			reverse         : null,
			welcome_lights  : false,
			faulty : {
				brake : {
					left  : null,
					right : null,
				},
				fog : {
					front : null,
					rear  : null,
				},
				lowbeam : {
					left  : null,
					right : null,
				},
				standing : {
					rear : {
						left  : null,
						right : null,
					},
					front : null,
				},
				turn : {
					left  : null,
					right : null,
				},
				all_ok        : null,
				highbeam      : null,
				license_plate : null,
				lowbeam       : null,
				reverse       : null,
				trailer       : null,
			},
		};

		log.msg({
			src : 'json',
			msg : 'Reset status',
		});

		if (typeof callback === 'function') { callback(); }
		return true;
	},

	// Set modules as not ready
	reset_modules : (callback) => {
		for (var module in bus_modules.modules) {
			if (module != 'DIA' && module != 'GLO' && module != 'LOC' && status[module]) {
				status[module].reset = true;
				status[module].ready = false;
			}
		}
		status.rad.audio_control = 'audio off';

		log.msg({
			src : 'json',
			msg : 'Reset modules',
		});

		if (typeof callback === 'function') { callback(); }
		return true;
	},

	write_config : (callback) => {
		// Write config JSON
		jsonfile.writeFile(file_config, config, (error) => {
			if (error !== null) {
				log.msg({
					src : 'json',
					msg : 'Failed to write config, '+error,
				});

				if (typeof callback === 'function') { callback(); }
				return false;
			}

			log.msg({
				src : 'json',
				msg : 'Wrote config',
			});

			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},

	write_status : (callback) => {
		// Write status JSON
		jsonfile.writeFile(file_status, status, (error) => {
			if (error !== null) {
				log.msg({
					src : 'json',
					msg : 'Failed to write status, '+error,
				});
				if (typeof callback === 'function') { callback(); }
				return false;
			}

			log.msg({
				src : 'json',
				msg : 'Wrote status',
			});

			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},
};
