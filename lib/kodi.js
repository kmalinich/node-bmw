#!/usr/bin/env node

// Kodi WebSocket API library
var kodi_ws = require('kodi-ws');

var kodi = function (omnibus) {
	// Stop any playing media
	var stop_all = () => {
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

	// Show notification in Kodi GUI
	var notify = (title, message) => {
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

	// Send commands to Kodi media player over the JSON-RPC websocket API
	var command = (action) => {
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

					console.log('[node:kodi] Sending \'%s\' command to player ID \'%s\'', action, omnibus.status.kodi.player_id);
				}));
			});
		}).catch((e) => {
			// Handle errors
			console.log('[node:kodi] Not running');
		});
	}

	return {
		command  : command,
		notify   : notify,
		stop_all : stop_all,
	};
};

module.exports = kodi;
