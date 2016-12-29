#!/usr/bin/env node

// For more cec-events: http://www.cec-o-matic.com/
// 0xf0 = Samsung

var nodecec = require('node-cec');
var NodeCec = nodecec.NodeCec;
var CEC     = nodecec.CEC;
var cec     = new NodeCec('node-cec-monitor');

var HDMI = function(omnibus) {
	// Start cec-client and populate connection var
	var autoconfig = () => {
		// -m  = start in monitor-mode
		// -d8 = set log level to 8 (=TRAFFIC) (-d 8)
		// -br = logical address set to `recording device`
		cec.start('cec-client', '-d', '8', '-t', 'r');

		cec.once('ready', (client) => {
			console.log('[   HDMI   ] Client ready');

			// Populate global HDMI CEC client object
			omnibus.status.hdmi.client = client;

			// Get display's power status
			client.sendCommand(0xf0, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);

			// console.log('Sending '+CEC.Opcode.GIVE_PHYSICAL_ADDRESS);
			// client.sendCommand(0x0f, CEC.Opcode.GIVE_PHYSICAL_ADDRESS);
		});

		cec.on('REPORT_PHYSICAL_ADDRESS', (packet, address) => {
			console.log('[   HDMI   ] PHYSICAL_ADDRESS:', address);
		});

		cec.on('REPORT_POWER_STATUS', (packet, status) => {
			var keys = Object.keys(CEC.PowerStatus);

			for (var i = keys.length - 1; i >= 0; i--) {
				if (CEC.PowerStatus[keys[i]] == status) {
					console.log('[   HDMI   ] Power status:', keys[i]);
					break;
				}
			}
		});

		cec.on('ROUTING_CHANGE', (packet, fromSource, toSource) => {
			console.log('[   HDMI   ] Routing changed from ' + fromSource + ' to ' + toSource + '.');
		});
	}

	var shutdown = () => {
		// Shutdown and kill cec-client process
		if (cec !== null) {
			console.log('[   HDMI   ] Stopping cec-client process');
			cec.stop();
		}
	}

	// Send commands over HDMI-CEC to control attached display
	var command = (action) => {
		switch (action) {
			case 'poweron':
				console.log('[   HDMI   ] Sending power on');
				omnibus.status.hdmi.client.sendCommand(0xf0, CEC.Opcode.ACTIVE_SOURCE);
				break;
			case 'poweroff':
				console.log('[   HDMI   ] Sending power off');
				omnibus.status.hdmi.client.sendCommand(0xf0, CEC.Opcode.STANDBY);
				break;
		}
	};

	init = () => {
		autoconfig();
	};

	return {
		autoconfig : autoconfig,
		command    : command,
		init       : init,
		shutdown   : shutdown,
	};
};

module.exports = HDMI;
