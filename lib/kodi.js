#!/usr/bin/env node

// Kodi WebSocket API library
var kodi_ws = require('kodi-ws');

var kodi = function(omnibus) {
  // Stop any playing media
  var stop_all = function() {
    kodi_ws('127.0.0.1', 9090).then(function(connection) {
      return connection.Player.GetActivePlayers().then(function(players) {
        // Stop everything thats playing
        return Promise.all(players.map(function(player) {
          console.log('[  kodi  ] Stopping all media playback');
          return connection.Player.Stop(player.playerid);
        }));
      });
    }).catch(function(e) {
      // Handle errors
      console.log('[  kodi  ] Kodi not running');
    });
  }

  // Show notification in Kodi GUI
  var notify = function(title, message) {
    kodi_ws('127.0.0.1', 9090).then(function(connection) {
      console.log('[  kodi  ] Sending \'%s\' notification to Kodi', title);
      connection.GUI.ShowNotification({
        'title'   : title,
				'message' : message,
			});
		}).catch(function(e) {
			// Handle errors
			console.log('[  kodi  ] Kodi not running');
		});
	}

	// Send commands to Kodi media player over the JSON-RPC websocket API
	var command = function(action) {
		kodi_ws('127.0.0.1', 9090).then(function(connection) {
			return connection.Player.GetActivePlayers().then(function(players) {
				return Promise.all(players.map(function(player) {
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

					console.log('[  kodi  ] Sending \'%s\' command to Kodi player ID \'%s\'', action, omnibus.status.kodi.player_id);
				}));
			});
		}).catch(function(e) {
			// Handle errors
			console.log('[  kodi  ] Kodi not running');
		});
	}

  return {
    command  : command,
    notify   : notify,
    stop_all : stop_all,
  };

};

module.exports = kodi;
