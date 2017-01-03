#!/usr/bin/env node

// For more cec-events: http://www.cec-o-matic.com/
// 0xf0 = Samsung

var nodecec = require('node-cec');
var NodeCec = nodecec.NodeCec;
var CEC     = nodecec.CEC;
var cec     = new NodeCec('node-cec-monitor');

var HDMI = function(omnibus) {
	// Start cec-client and populate connection var
	var startup = (callback) => {
		console.log('[     HDMI] Starting up');
		omnibus.status.hdmi.client_ready = false;

		// -m  = start in monitor-mode
		// -d8 = set log level to 8 (=TRAFFIC) (-d 8)
		// -br = logical address set to `recording device`
		// cec.start('cec-client', '-d', '8', '-t', 'r');

		callback();
		cec.once('ready', (client) => {
			omnibus.status.hdmi.client_ready = true;

			// Populate global HDMI CEC client object
			omnibus.hdmi_client = client;

			// Get display's power status
			client.sendCommand(0xf0, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
		});

		// Error handling
		cec.on('error', () => {
			console.log('[     HDMI] error');
		});

		cec.on('REPORT_PHYSICAL_ADDRESS', (packet, address) => {
			console.log('[     HDMI] physical address: \'%s\'', address);
			omnibus.status.hdmi.physical_addr = address;
		});

		cec.on('REPORT_POWER_STATUS', (packet, status) => {
			var keys = Object.keys(CEC.PowerStatus);

			for (var i = keys.length - 1; i >= 0; i--) {
				if (CEC.PowerStatus[keys[i]] == status) {
					console.log('[     HDMI] power status:', keys[i]);
					omnibus.status.hdmi.power_status = keys[i];
					break;
				}
			}
		});

		cec.on('ROUTING_CHANGE', (packet, fromSource, toSource) => {
			console.log('[     HDMI] Routing changed from ' + fromSource + ' to ' + toSource + '.');
		});
	}

	var shutdown = (callback) => {
		// Shutdown and kill cec-client process
		if (omnibus.status.hdmi.client_ready === true) {
			console.log('[     HDMI] Stopping cec-client process');
			// Reset status variables
			omnibus.status.hdmi.client_ready  = false;
			omnibus.status.hdmi.physical_addr = null;
			omnibus.status.hdmi.power_status  = null;
			cec.stop();
			callback();
		}
		else {
			console.log('[     HDMI] cec-client process not running');
			// F**king reset them anyway
			omnibus.status.hdmi.client_ready  = false;
			omnibus.status.hdmi.physical_addr = null;
			omnibus.status.hdmi.power_status  = null;
			callback();
		}
	}

	// Send commands over HDMI-CEC to control attached display
	var command = (action) => {
		if (omnibus.hdmi_client !== null) {
			switch (action) {
				case 'poweron':
					console.log('[     HDMI] Sending power on');
					omnibus.hdmi_client.sendCommand(0xf0, CEC.Opcode.ACTIVE_SOURCE);
					break;
				case 'poweroff':
					console.log('[     HDMI] Sending power off');
					omnibus.hdmi_client.sendCommand(0xf0, CEC.Opcode.STANDBY);
					break;
			}
		}
	};

	init = () => {
		startup();
	};

	return {
		startup : startup,
		command    : command,
		init       : init,
		shutdown   : shutdown,
	};
};

module.exports = HDMI;
