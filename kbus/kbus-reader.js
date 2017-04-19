#!/usr/bin/env node

// Global libraries
convert = require('node-unit-conversion');
moment  = require('moment');
now     = require('performance-now');
os      = require('os');
suncalc = require('suncalc');

// Global objects
bitmask     = require('bitmask');
bus_modules = require('bus-modules');
hex         = require('hex');
json        = require('json');
log         = require('log-output');

var keepalive_interval;
var displaytest_interval;

function load_modules(callback) {
	// Everything connection object
	omnibus = {
		// IBUS libraries - these should be combined
		data_handler : require('data-handler'), // Data handler/router
		data_send    : require('data-send'),    // Data sender (sorts based on dest module)

		ibus : {
			protocol  : require('ibus-protocol'), // Protocol
			interface : require('ibus-interface'), // Connection
		},

		kbus : {
			protocol  : require('kbus-protocol'), // Protocol
			interface : require('kbus-interface'), // Connection
		},

		dbus : {
			protocol  : require('dbus-protocol'), // Protocol
			interface : require('dbus-interface'), // Connection
		},

		// Data bus module libraries
		GM  : require('GM'),
		LCM : require('LCM'),
		IKE : require('IKE'),

		ABG  : new (require('ABG')),
		ANZV : new (require('ANZV')),
		BMBT : new (require('BMBT')),
		CCM  : new (require('CCM')),
		CDC  : new (require('CDC')),
		DSP  : new (require('DSP')),
		DSPC : new (require('DSPC')),
		EWS  : new (require('EWS')),
		GT   : new (require('GT')),
		HAC  : new (require('HAC')),
		IHKA : new (require('IHKA')),
		MFL  : new (require('MFL')),
		MID  : new (require('MID')),
		NAV  : new (require('NAV')),
		PDC  : new (require('PDC')),
		RAD  : new (require('RAD')),
		RLS  : new (require('RLS')),
		SES  : new (require('SES')),
		SHD  : new (require('SHD')),
		TEL  : new (require('TEL')),
		VID  : new (require('VID')),
	};

	if (typeof callback === 'function') { callback(); }
}

// Global startup
function startup(callback) {
	log.msg({
		src : 'kbus-reader',
		msg : 'Starting',
	});

	json.read_config(() => { // Read JSON config file
		json.read_status(() => { // Read JSON status file
			load_modules(() => {
				omnibus.kbus.interface.startup(() => { // Open KBUS serial port
					log.msg({
						src : 'kbus-reader',
						msg : 'Started',
					});
					if (typeof callback === 'function') { callback(); }
				});
			});
		});
	});
}

// Global shutdown
function shutdown() {
	log.msg({
		src : 'kbus-reader',
		msg : 'Shutting down',
	});

	clearInterval(keepalive_interval);
	clearInterval(displaytest_interval);
	omnibus.kbus.interface.shutdown(() => { // Close KBUS serial port
		process.exit();
	});
}

function on_kbus_data(data) {
	var module_src = bus_modules.hex2name(data.src);
	var module_dst = bus_modules.hex2name(data.dst);
	console.log('[kbus-reader] [%s>%s]', data.src, data.dst, data.msg);
}

function ihka_keepalive() {
	console.log('[kbus-reader] Sending IHKA keepalive');
	omnibus.data_send.send({
		src: 'DIA',
		dst: 'IHKA',
		msg: [0x9E],
	});
}

function ihka_displaytest() {
	console.log('[kbus-reader] Sending IHKA displaytest');
	omnibus.data_send.send({
		src: 'DIA',
		dst: 'IHKA',
		// msg: [0x0a, 0x07, 0x04, 0x00, 0x01, 0x86, 0x01, 0xc2],
		msg: [0x0A, 0x07, 0x04, 0x00, 0x00, 0x6C, 0x01, 0x64],
	});
}


// Shutdown events/signals
process.on('SIGTERM', () => {
	log.msg({
		src : 'kbus-reader',
		msg : 'Received SIGTERM, launching shutdown()',
	});
	shutdown();
});

process.on('SIGINT', () => {
	log.msg({
		src : 'kbus-reader',
		msg : 'Received SIGINT, launching shutdown()',
	});
	shutdown();
});

process.on('SIGPIPE', () => {
	log.msg({
		src : 'kbus-reader',
		msg : 'Received SIGPIPE, launching shutdown()',
	});
	shutdown();
});

process.on('exit', () => {
	log.msg({
		src : 'kbus-reader',
		msg : 'Shut down',
	});
});

startup(() => {
	ihka_keepalive();
	keepalive_interval   = setInterval(ihka_keepalive, 5000);
	displaytest_interval = setInterval(ihka_displaytest, 1000);
});
