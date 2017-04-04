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

				if (typeof callback === 'function') { callback(); }
				return false;
			}

			status = obj;
			log.msg({
				src : 'json',
				msg : 'Read status',
			});

			// Reset some variables
			status.lights.turn.left.depress  = null;
			status.lights.turn.right.depress = null;
			status.vehicle.handbrake         = false;
			status.engine.running            = false;
			status.vehicle.ignition          = 'off';
			status.vehicle.ignition_level    = 0;
			status.vehicle.locked            = null;
			status.vehicle.reverse           = false;

			status.lights.auto = {
				active  : false,
				lowbeam : null,
				reason  : null,
			};

			status.lights.turn = {
				left : {
					active: false,
					comfort: false,
					depress: null,
				},
				right: {
					active: false,
					comfort: false,
					depress: null,
				},
				fast: false,
				sync: false,
				depress_elapsed: null,
				comfort_cool: true,
			};
			// Set modules as not ready
			status.bmbt.ready = false;
			status.bmbt.reset = true;
			status.cdc.ready  = false;
			status.cdc.reset  = true;
			status.dsp.ready  = false;
			status.dsp.reset  = true;
			status.dspc.ready = false;
			status.dspc.reset = true;
			status.ike.ready  = false;
			status.ike.reset  = true;
			status.lcm.ready  = false;
			status.lcm.reset  = true;
			status.mid.ready  = false;
			status.mid.reset  = true;
			status.rad.ready  = false;
			status.rad.reset  = true;
			status.rad.audio_control == 'audio off';

			if (typeof callback === 'function') { callback(); }
			return true;
		});
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
