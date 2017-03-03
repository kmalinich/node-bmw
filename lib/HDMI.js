#!/usr/bin/env node

// Only pull in libraries if hdmi is enabled
if (config.media.hdmi === true) {
	var nodecec = require('node-cec');
	var NodeCec = nodecec.NodeCec;
	var CEC     = nodecec.CEC;
	var cec     = new NodeCec('node-bmw HDMI');

	// 0xf0 = Samsung

	cec.on('REPORT_POWER_STATUS', (packet, power_status) => {
		var keys = Object.keys(CEC.PowerStatus);

		for (var i = keys.length - 1; i >= 0; i--) {
			if (CEC.PowerStatus[keys[i]] === power_status) {
				console.log('[node:HDMI] Power status: \'%s\'', keys[i]);
				status.hdmi.power_status = keys[i];
				break;
			}
		}
	});

	// Error handling
	cec.on('error', () => {
		console.log('[node:HDMI] Error');
	});

	// Remote keys handling
	cec.on('ARROW_DOWN', () => {
		console.log('[node:HDMI] Arrow down');
	});
	cec.on('ARROW_UP', () => {
		console.log('[node:HDMI] Arrow up');
	});
	cec.on('ARROW_LEFT', () => {
		console.log('[node:HDMI] Arrow left');
	});
	cec.on('ARROW_RIGHT', () => {
		console.log('[node:HDMI] Arrow right');
	});
	cec.on('ENTER', () => {
		console.log('[node:HDMI] Enter');
	});
	cec.on('EXIT', () => {
		console.log('[node:HDMI] Exit');
	});

	// Event handling
	cec.on('REPORT_PHYSICAL_ADDRESS', (packet, address) => {
		console.log('[node:HDMI] Physical address: \'%s\'', address);
		status.hdmi.physical_addr = address;
	});
	cec.on('ROUTING_CHANGE', (packet, fromSource, toSource) => {
		console.log('[node:HDMI] Routing change : \'%s\' => \'%s\'', fromSource, toSource);
	});
	cec.on('ACTIVE_SOURCE', (packet, source) => {
		console.log('[node:HDMI] Active source : \'%s\'', source);
	});
	cec.on('SET_OSD_NAME', (packet, osdname) => {
		console.log('[node:HDMI] Set OSD name : \'%s\'', osdname);
	});
	cec.on('POLLING', (packet) => {
		console.log('[node:HDMI] Polling');
	});
}

module.exports = {
	// Start cec-client and populate connection var
	startup : (callback) => {
		status.hdmi.client_ready = false;

		if (config.media.hdmi !== true) {
			console.log('[node:HDMI] Disabled, not loading');
			callback();
		}
		else {
			cec.start('cec-client', '-t', 't');
			cec.once('ready', (client) => {
				console.log('[node:HDMI] Started');
				status.hdmi.client_ready = true;

				// Populate global HDMI CEC client object
				omnibus.hdmi_client = client;

				// Get status
				setTimeout(() => {
					omnibus.HDMI.command('powerstatus');
				}, 3000);

				// Holla back
				callback();
			});
		}
	},

	shutdown : (callback) => {
		// Shutdown and kill cec-client process
		if (status.hdmi.client_ready === true && config.media.hdmi === true) {
			console.log('[node:HDMI] Stopping cec-client process');

			// Reset status variables
			status.hdmi.client_ready  = false;
			status.hdmi.physical_addr = null;
			status.hdmi.power_status  = null;

			// Register listener to wait for stop event
			cec.on('stop', () => {
				console.log('[node:HDMI] Stopped');
				callback();
			});

			// Call for stop
			cec.stop();
		}
		else {
			console.log('[node:HDMI] cec-client process not running');
			// F**king reset them anyway
			status.hdmi.client_ready  = false;
			status.hdmi.physical_addr = null;
			status.hdmi.power_status  = null;
			callback();
		}
	},

	// Send commands over HDMI CEC to control attached display
	command : (action) => {
		if (config.media.hdmi === true && omnibus.hdmi_client !== null && status.hdmi.client_ready === true) {
			switch (action) {
				case 'powerstatus':
					console.log('[node:HDMI] Requesting power status');
					omnibus.hdmi_client.sendCommand(0xf0, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
					break;

				case 'poweron':
					console.log('[node:HDMI] Sending power on');
					omnibus.hdmi_client.sendCommand(0xf0, CEC.Opcode.IMAGE_VIEW_ON);
					// Get status
					setTimeout(() => {
						omnibus.HDMI.command('powerstatus');
					}, 5000);
					break;

				case 'poweroff':
					console.log('[node:HDMI] Sending power off');
					omnibus.hdmi_client.sendCommand(0xf0, CEC.Opcode.STANDBY);
					// Get status
					setTimeout(() => {
						omnibus.HDMI.command('powerstatus');
					}, 5000);
			}
		}
	},
};
