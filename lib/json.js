var module_name = __filename.slice(__dirname.length + 1, -3);

const jsonfile = require('jsonfile');

var file_config = 'config.json';
var file_status = 'status.json';

var config_default = require('./config-default');
var status_default = require('./status-default');

module.exports = {
	// Read config+status
	read : (callback) => {
		json.config_read(() => { // Read JSON config file
			json.status_read(() => { // Read JSON status file
				if (typeof callback === 'function') { callback(); }
				return true;
			});
		});
	},

	// Reset both modules and status vars
	reset : (callback) => {
		json.modules_reset(() => { // Set modules as not ready
			json.status_reset(() => { // Reset some variables
				if (typeof callback === 'function') { callback(); }
				return true;
			});
		});
	},

	// Write config+status
	write : (callback) => {
		json.config_write(() => { // Read JSON config file
			json.status_write(() => { // Read JSON status file
				if (typeof callback === 'function') { callback(); }
				return true;
			});
		});
	},

	// Read config JSON
	config_read : (callback) => {
		jsonfile.readFile(file_config, (error, obj) => {
			if (error !== null) {
				log.msg({
					src : module_name,
					msg : 'Failed to read config, '+error,
				});

				config = config_default;

				if (typeof callback === 'function') { callback(); }
				return false;
			}

			config = obj;
			log.msg({
				src : module_name,
				msg : 'Read config',
			});

			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},

	// Write config JSON
	config_write : (callback) => {
		jsonfile.writeFile(file_config, config, (error) => {
			if (error !== null) {
				log.msg({
					src : module_name,
					msg : 'Failed to write config, '+error,
				});

				if (typeof callback === 'function') { callback(); }
				return false;
			}

			log.msg({
				src : module_name,
				msg : 'Wrote config',
			});

			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},

	// Set modules as not ready
	modules_reset : (callback) => {
		for (var module in bus_modules.modules) {
			if (module != 'DIA' && module != 'GLO' && module != 'LOC' && status[module]) {
				status[module].reset = true;
				status[module].ready = false;
			}
		}

		status.rad.audio_control = 'audio off';

		log.msg({
			src : module_name,
			msg : 'Reset modules',
		});

		if (typeof callback === 'function') { callback(); }
		return true;
	},

	// Read status JSON
	status_read : (callback) => {
		jsonfile.readFile(file_status, (error, obj) => {
			if (error !== null) {
				log.msg({
					src : module_name,
					msg : 'Failed to read status, '+error,
				});

				status = status_default;
				json.status_write(() => {});

				if (typeof callback === 'function') { callback(); }
				return false;
			}

			status = obj;
			log.msg({
				src : module_name,
				msg : 'Read status',
			});

			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},

	// Reset some variables
	status_reset : (callback) => {
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
			src : module_name,
			msg : 'Reset status',
		});

		if (typeof callback === 'function') { callback(); }
		return true;
	},

	// Write status JSON
	status_write : (callback) => {
		jsonfile.writeFile(file_status, status, (error) => {
			if (error !== null) {
				log.msg({
					src : module_name,
					msg : 'Failed to write status, '+error,
				});
				if (typeof callback === 'function') { callback(); }
				return false;
			}

			log.msg({
				src : module_name,
				msg : 'Wrote status',
			});

			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},
};
