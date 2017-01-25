#!/usr/bin/env node

// Only pull in libraries if kodi is enabled
if (config.kodi === true) {
	// Kodi WebSocket API library
	var kodi_ws = require('kodi-ws');
}

module.exports = {
	// Stop any playing media
	stop_all : () => {
		if (config.kodi === true) {
			kodi_ws('127.0.0.1', 9090).then((connection) => {
				return connection.Player.GetActivePlayers().then((players) => {
					// Stop everything thats playing
					return Promise.all(players.map((player) => {
						console.log('[node:kodi] Stopping all media playback');
						return connection.Player.Stop(player.playerid);
					}));
				});
			}).catch((e) => {
				// Handle errors
				console.log('[node:kodi] Not running');
			});
		}
	},

	// Show notification in Kodi GUI
	notify : (title, message) => {
		if (config.kodi === true) {
			kodi_ws('127.0.0.1', 9090).then((connection) => {
				console.log('[node:kodi] Sending \'%s\' notification', title);
				connection.GUI.ShowNotification({
					'title'   : title,
					'message' : message,
				});
			}).catch((e) => {
				// Handle errors
				console.log('[node:kodi] Not running');
			});
		}
	},

	// Send commands to Kodi media player over the JSON-RPC websocket API
	command : (action) => {
		if (config.kodi === true) {
			kodi_ws('127.0.0.1', 9090).then((connection) => {
				return connection.Player.GetActivePlayers().then((players) => {
					return Promise.all(players.map((player) => {
						switch (action) {
							case 'pause':
								return connection.Player.PlayPause(player.playerid);
								break;

							case 'previous':
								return connection.Player.GoTo({
									'playerid' : player.playerid,
									'to'       : 'previous',
								});
								break;

							case 'next':
								return connection.Player.GoTo({
									'playerid' : player.playerid,
									'to'       : 'next',
								});
								break;
						}

						console.log('[node:kodi] Sending \'%s\' command to player ID \'%s\'', action, status.kodi.player_id);
					}));
				});
			}).catch((e) => {
				// Handle errors
				console.log('[node:kodi] Not running');
			});
		}
	},
};
