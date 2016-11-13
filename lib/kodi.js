#!/usr/bin/env node

// systemd dbus libraries
var kodi_ws = require('kodi-ws');

var kodi_socket = null;

var kodi = function(omnibus) {
	// Ask Kodi for the first player's playerid and type
	var autoconfig = function() {
		if (kodi_socket === null) {
			kodi_ws('127.0.0.1', 9090).then(function (connection) {
				//omnibus.status.kodi.connection = connection;
				kodi_socket = connection;

				/* Get all active players and log them */
				return connection.Player.GetActivePlayers().then(function (players) {
					if (!players[0]) {
						console.log('[kodi] No players found');
					}
					else {
						omnibus.status.kodi.player_id   = players[0].playerid;
						omnibus.status.kodi.player_type = players[0].type;

						console.log('[kodi] Found player with id   : \'%s\'', omnibus.status.kodi.player_id);
						console.log('[kodi] Found player with type : \'%s\'', omnibus.status.kodi.player_type);
					}
				});
			}).catch(function(e) {
				/* Handle errors */
				console.log('[kodi] Kodi not running');
			});
		}
	}

	// Show notification in Kodi GUI
	var notify = function(title, message) {
		if (kodi_socket === null) {
			autoconfig();
		}

		if (kodi_socket !== null) {
			kodi_socket.GUI.ShowNotification({
				'title'   : title,
				'message' : message,
			});

			console.log('[kodi] Sending \'%s\' notification to Kodi', title);
		}
	}

	// Send commands to Kodi media player over it's JSON-RPC websocket API
	var command = function(action) {
		if (kodi_socket === null) {
			autoconfig();
		}

		// Dirty, dirty hack
		omnibus.status.kodi.player_id = 0;

		if (kodi_socket !== null) {
			switch (action) {
				case 'pause':
					kodi_socket.Player.PlayPause({
						'playerid' : omnibus.status.kodi.player_id,
					});
					break;

				case 'previous':
					kodi_socket.Player.GoTo({
						'playerid' : omnibus.status.kodi.player_id,
						'to'       : 'previous',
					});
					break;

				case 'next':
					kodi_socket.Player.GoTo({
						'playerid' : omnibus.status.kodi.player_id,
						'to'       : 'next',
					});
					break;
			}

			console.log('[kodi] Sending \'%s\' command to Kodi player ID \'%s\'', action, omnibus.status.kodi.player_id);
		}
	}

	init = function() {
		autoconfig();
	};

	return {
		autoconfig : autoconfig,
		command    : command,
		init       : init,
		notify     : notify,
	};

};

module.exports = kodi;
