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
		ABG  : require('ABG'),
		AHL  : require('AHL'),
		ANZV : require('ANZV'),
		ASC  : require('ASC'),
		ASST : require('ASST'),
		BMBT : require('BMBT'),
		CCM  : require('CCM'),
		CDC  : require('CDC'),
		CDCD : require('CDCD'),
		CID  : require('CID'),
		CSU  : require('CSU'),
		CVM  : require('CVM'),
		DIA  : require('DIA'),
		DME  : require('DME'),
		DME2 : require('DME2'),
		DSP  : require('DSP'),
		DSPC : require('DSPC'),
		EGS  : require('EGS'),
		EHC  : require('EHC'),
		EKM  : require('EKM'),
		EKP  : require('EKP'),
		EWS  : require('EWS'),
		FBZV : require('FBZV'),
		FHK  : require('FHK'),
		FID  : require('FID'),
		FMBT : require('FMBT'),
		GM   : require('GM'),
		GR   : require('GR'),
		GT   : require('GT'),
		GTF  : require('GTF'),
		HAC  : require('HAC'),
		HKM  : require('HKM'),
		IHKA : require('IHKA'),
		IKE  : require('IKE'),
		IRIS : require('IRIS'),
		LCM  : require('LCM'),
		LWS  : require('LWS'),
		MFL  : require('MFL'),
		MID  : require('MID'),
		MID1 : require('MID1'),
		MM3  : require('MM3'),
		MML  : require('MML'),
		MMR  : require('MMR'),
		NAV  : require('NAV'),
		NAVC : require('NAVC'),
		NAVE : require('NAVE'),
		NAVJ : require('NAVJ'),
		PDC  : require('PDC'),
		PIC  : require('PIC'),
		RAD  : require('RAD'),
		RCC  : require('RCC'),
		RCSC : require('RCSC'),
		RDC  : require('RDC'),
		RLS  : require('RLS'),
		SDRS : require('SDRS'),
		SES  : require('SES'),
		SHD  : require('SHD'),
		SM   : require('SM'),
		SMAD : require('SMAD'),
		SOR  : require('SOR'),
		STH  : require('STH'),
		TCU  : require('TCU'),
		TEL  : require('TEL'),
		VID  : require('VID'),
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
