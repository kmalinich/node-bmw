#!/usr/bin/env node

const jsonfile = require('jsonfile');

var file_config = 'config.json';
var file_status = 'status.json';

module.exports = {
	read_config : (callback) => {
		// Read config JSON
		jsonfile.readFile(file_config, (error, obj) => {
			if (error !== null) {
				log.msg({
					src : 'json',
					msg : 'Failed to read config, '+error,
				});
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
