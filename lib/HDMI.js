#!/usr/bin/env node

// For more cec-events: http://www.cec-o-matic.com/
// 0xf0 = Samsung

var nodecec = require('node-cec');
var NodeCec = nodecec.NodeCec;
var CEC     = nodecec.CEC;
var cec     = new NodeCec('node-cec-monitor');

// Error handling
cec.on('error', () => {
	console.log('[node:HDMI] Error');
});

cec.on('REPORT_PHYSICAL_ADDRESS', (packet, address) => {
	console.log('[node:HDMI] Physical address: \'%s\'', address);
	status.hdmi.physical_addr = address;
});

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

cec.on('ROUTING_CHANGE', (packet, fromSource, toSource) => {
	console.log('[node:HDMI] Routing change: '+fromSource+' => '+toSource);
});

module.exports = {
	// Start cec-client and populate connection var
	startup : (callback) => {
		status.hdmi.client_ready = false;

		// -m  = start in monitor-mode
		// -d8 = set log level to 8 (=TRAFFIC) (-d 8)
		// -br = logical address set to `recording device`
		if (config.hdmi === true) {
			cec.start('cec-client', '-d', '8', '-t', 'r');
		}
		else {
			console.log('[node:HDMI] Disabled, not loading');
			callback();
		}

		cec.once('ready', (client) => {
			console.log('[node:HDMI] Started');
			status.hdmi.client_ready = true;

			// Populate global HDMI CEC client object
			omnibus.hdmi_client = client;

			// Get display's power status
			client.sendCommand(0xf0, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);

			// Holla back
			callback();
		});
	},

	shutdown : (callback) => {
		// Shutdown and kill cec-client process
		if (status.hdmi.client_ready === true) {
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

	// Send commands over HDMI-CEC to control attached display
	command : (action) => {
		if (config.hdmi === true && omnibus.hdmi_client !== null && status.hdmi.client_ready === true) {
			switch (action) {
				case 'poweron':
					console.log('[node:HDMI] Sending power on');
					omnibus.hdmi_client.sendCommand(0xf0, CEC.Opcode.ACTIVE_SOURCE);
					break;

				case 'poweroff':
					console.log('[node:HDMI] Sending power off');
					omnibus.hdmi_client.sendCommand(0xf0, CEC.Opcode.STANDBY);
					break;
			}
		}
	},
};
