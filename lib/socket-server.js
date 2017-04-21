var module_name = __filename.slice(__dirname.length + 1, -3);

// socket.io library
var socket_io = require('socket.io');
var io;

module.exports = {
	/*
	 * Functions
	 */

	startup : (callback) => {
		console.log('[node:::WS] Websocket server up');
		io = new socket_io(api_server);
		callback();

		/*
		 * Events
		 */

		io.on('error', (error) => {
			console.log('[node:::WS] Error caught in socket:\'%s\'', error);
		});

		// When a client connects
		io.on('connection', (socket) => {
			socket.emit('connect', { hello: 'world' });
			console.log('[node:::WS] Client connected');

			// Receive message from WebUI and send it over IBUS/KBUS
			socket.on('message', (data) => {
				console.log('[node:::WS] Sending packet');

				// Send the message
				omnibus.ibus.send(JSON.parse(data));
			});

			socket.on('disconnect', () => {
				console.log('[node:::WS] Socket disconnected');
			});
		});

	},

	ibus2socket : (data) => {
		// console.log('[node:::WS] Sending data to clients');
		try {
			io.emit('ibus-message', {
				src : bus_modules.hex2name(data.src),
				dst : bus_modules.hex2name(data.dst),
				msg : JSON.stringify(data.msg),
			});
		}
		catch (e) {
			console.log(e);
		}
	},

	status2socket : () => {
		// console.log('[node:::WS] Sending data to clients');
		try {
			io.emit('status', {
				status : status,
			});
		}
		catch (e) {
			console.log(e);
		}
	},

};
