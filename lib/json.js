#!/usr/bin/env node

const jsonfile = require('jsonfile');

var file_config = 'config.json';
var file_status = 'status.json';

module.exports = {
	read_config : (callback) => {
		// Read config JSON
		jsonfile.readFile(file_config, (error, obj) => {
			if (error !== null) {
				output_f('Failed to read config JSON, '+error);
				if (typeof callback === 'function') { callback(); }
				return false;
			}

			output_s('Read config JSON');
			config = obj;
			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},

	read_status : (callback) => {
		// Read status JSON
		jsonfile.readFile(file_status, (error, obj) => {
			if (error !== null) {
				output_f('Failed to read status JSON, '+error);
				if (typeof callback === 'function') { callback(); }
				return false;
			}

			output_s('Read status JSON');
			status = obj;
			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},

	write_config : (callback) => {
		// Write config JSON
		jsonfile.writeFile(file_config, config, (error) => {
			if (error !== null) {
				output_f('Failed to write config JSON, '+error);
				if (typeof callback === 'function') { callback(); }
				return false;
			}

			output_s('Wrote config JSON');
			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},

	write_status : (callback) => {
		// Write status JSON
		jsonfile.writeFile(file_status, status, (error) => {
			if (error !== null) {
				output_f('Failed to write status JSON, '+error);
				if (typeof callback === 'function') { callback(); }
				return false;
			}

			output_s('Wrote status JSON');
			if (typeof callback === 'function') { callback(); }
			return true;
		});
	},
};
