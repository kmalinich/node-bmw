// Global libraries
now = require('performance-now');

// Global objects
bitmask     = require('../lib/bitmask');
bus_modules = require('../lib/bus-modules');
hex         = require('../lib/hex');
json        = require('../lib/json');
log         = require('../lib/log');

var dbus = {
	protocol  : require('./dbus-protocol' ), // Protocol
	interface : require('./dbus-interface'), // Connection
};

function shutdown() {
	dbus.interface.shutdown(() => {
		process.exit();
	});
}

// Global startup
function startup(callback) {
	json.read_config(() => { // Read JSON config file
		json.read_status(() => { // Read JSON status file
			dbus.interface.startup(() => {
				callback();
			});
		});
	});
}

function on_data(data) {
	console.log('[DBUS][%s]', data.dst, data.msg);
}

function dodbus() {
	console.log('[DBUS] Sending DME packet');
	dbus.interface.send({
		dst: 'DME',
		msg: [0x00],
	});
}

// Shutdown events/signals
process.on('SIGTERM', () => {
	log.msg({
		src : 'run',
		msg : 'Received SIGTERM, launching shutdown()',
	});
	shutdown();
});

process.on('SIGINT', () => {
	log.msg({
		src : 'run',
		msg : 'Received SIGINT, launching shutdown()',
	});
	shutdown();
});

process.on('SIGPIPE', () => {
	log.msg({
		src : 'run',
		msg : 'Received SIGPIPE, launching shutdown()',
	});
	shutdown();
});

process.on('exit', () => {
	log.msg({
		src : 'run',
		msg : 'Shut down',
	});
});

startup(() => {
	dodbus();
	setInterval(dodbus, 5000);
});
