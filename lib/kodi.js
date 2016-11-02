#!/usr/bin/env node

// systemd dbus libraries
var kodi_ws = require('kodi-ws');

var kodi = function(omnibus) {
	// Ask Kodi for the first player's playerid and type
	var autoconfig = function() {
		kodi_ws('127.0.0.1', 9090).then(function (connection) {
			/* Get all active players and log them */
			return connection.Player.GetActivePlayers().then(function (players) {
				console.log(players[0].playerid);
				console.log(players[0].type);
			});
		}).catch(function(e) {
			/* Handle errors */
			if(e.stack) {
				console.error(e.stack);
			}
			else {
				console.error(e);
			}
		});
	}

	// Send commands over systemd dbus to BlueZ 5 to control bluetooth device
	var command = function(action) {
		switch (action) {
			case 'playpause':
				break;

			case 'previous':
				break;

			case 'next':
				break;
		}

		console.log('[kodi] Sending \'%s\' command to bluetooth device \'%s\'', action, omnibus.status.bt_device.name);
	}

	init = function() {
		autoconfig();
	};

	return {
		autoconfig : autoconfig,
		command    : command,
		init       : init,
	};

};

module.exports = kodi;


