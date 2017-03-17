#!/usr/bin/env node

// Only pull in libraries if kodi is enabled
if (config.media.kodi.enable === true) {
	// Kodi WebSocket API library
	var kodi_ws = require('kodi-ws');

	log.msg({
		src : 'kodi',
		msg : 'Target host \''+config.media.kodi.host+':'+config.media.kodi.port+'\'',
	});
}

module.exports = {
	// Show notification in Kodi GUI
	notify : (title, message) => {
		if (config.media.kodi.enable !== true) {
			return;
		}

		kodi_ws(config.media.kodi.host, config.media.kodi.port).then((connection) => {
			log.msg({
				src : 'kodi',
				msg : 'Sending notification; title : \''+GM+'\', message : \''+message+'\'',
			});

			connection.GUI.ShowNotification({
				'title'   : title,
				'message' : message,
			});
		}).catch((e) => {
			// Handle errors
			log.msg({
				src : 'kodi',
				msg : 'Not running',
			});
		});
	},

	// Send commands to Kodi media player over the JSON-RPC websocket API
	command : (action) => {
		if (config.media.kodi.enable !== true) {
			return;
		}

		kodi_ws(config.media.kodi.host, config.media.kodi.port).then((connection) => { // Make connection
			return connection.Player.GetActivePlayers().then((players) => { // List active players
				return Promise.all(players.map((player) => { // Map players
					switch (action) {
						case 'stop':
							return connection.Player.Stop(player.playerid);
							break;

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

					log.msg({
						src : 'kodi',
						msg : 'Sending \''+action+'\' command to player ID \''+status.kodi.player_id+'\'',
					});

				}));
			});
		}).catch((e) => {
			// Handle errors
			log.msg({
				src : 'kodi',
				msg : 'Not running',
			});
		});
	},
};
