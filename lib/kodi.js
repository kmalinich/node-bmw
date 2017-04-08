#!/usr/bin/env node

// var omnibus.kodi.socket = null;
var status_autoconfig_loop = false;
var interval_autoconfig_loop = null;

// Only pull in libraries if kodi is enabled
if (config.media.kodi.enable === true) {
  // Kodi WebSocket API library
  var kodi_ws = require('kodi-ws');

  log.msg({
    src : 'kodi',
    msg : 'Target host \''+config.media.kodi.host+':'+config.media.kodi.port+'\'',
  });
}

// A loop to run to try to reconnect
function autoconfig_loop(action) {
  if (action === status_autoconfig_loop) {
    log.msg({
      src : 'kodi',
      msg : 'Autoconfig loop status \''+status_autoconfig_loop+'\' is already \''+action+'\'',
    });
    return;
	}

	switch (action) {
		case true:
			if (omnibus.kodi.socket === null) {
				omnibus.kodi.autoconfig(() => {});
				status_autoconfig_loop = true;
				interval_autoconfig_loop = setInterval(() => {
					omnibus.kodi.autoconfig();
				}, 10000);

				log.msg({
					src : 'kodi',
					msg : 'Started autoconfig loop',
				});
			}
      break;

    case false:
      clearInterval(interval_autoconfig_loop, () => {
      });
      status_autoconfig_loop = false;
      log.msg({
        src : 'kodi',
        msg : 'Finished autoconfig loop',
      });
      break;
  }
}

// Evaluate/process data sent from websocket event
function process_player_data(player) {
	if (player.data) {
		if (player.data.item) {
			if (player.data.item.album ) { status.kodi.player.album  = player.data.item.album;     }
			if (player.data.item.artist) { status.kodi.player.artist = player.data.item.artist[0]; }
			if (player.data.item.type  ) { status.kodi.player.type   = player.data.item.type;      }
			if (player.data.item.title ) { status.kodi.player.title  = player.data.item.title;     }
			if (player.data.item.label ) { status.kodi.player.title  = player.data.item.label;     }
			if (player.data.item.albumartist) { status.kodi.player.artist = player.data.item.albumartist[0]; }

			if (player.data.item.label || player.data.item.title) {
				if (status.kodi.player.status === 'playing') {
					omnibus.IKE.text_override(status.kodi.player.artist+' - '+status.kodi.player.title);
				}
			}
			else {
				get_active_players(() => {
				});
			}
		}

		if (player.data.player) {
			if (player.data.player.playerid) { status.kodi.player.id = player.data.player.playerid; }
			if (player.data.player.time) {
				if (player.data.player.time.minutes) { status.kodi.player.time.minutes = player.data.player.time.minutes; }
				if (player.data.player.time.seconds) { status.kodi.player.time.seconds = player.data.player.time.seconds; }
			}
		}
	}
}

function autoconfig(callback = null) {
	if (config.media.kodi.enable !== true) {
		if (typeof callback === 'function') { callback(); }
		return;
	}

  if (omnibus.kodi.socket !== null) {
    autoconfig_loop(false);
    if (typeof callback === 'function') { callback(); }
    return;
  }

  log.msg({
    src : 'kodi',
    msg : 'Performing autoconfig',
  });

  kodi_ws(config.media.kodi.host, config.media.kodi.port).then((promise_kodi_socket) => {
		omnibus.kodi.socket = promise_kodi_socket;

    // Event/error handling
    omnibus.kodi.socket.on('error', (error) => {
			console.error(error);
      log.msg({
        src : 'kodi',
        msg : 'Crashed/died',
      });

      omnibus.kodi.socket = null;
			status.kodi.player.status = null;
      if (!status_autoconfig_loop) { autoconfig_loop(true); }
    });

    omnibus.kodi.socket.notification('Player.OnPause', (player) => {
			status.kodi.player.status = 'paused';
      log.msg({
        src : 'kodi',
        msg : 'Player '+status.kodi.player.status,
      });
      process_player_data(player);
    });

    omnibus.kodi.socket.notification('Player.OnPlay', (player) => {
			status.kodi.player.status = 'playing';
      log.msg({
        src : 'kodi',
        msg : 'Player '+status.kodi.player.status,
      });
			process_player_data(player);
    });

    omnibus.kodi.socket.notification('Player.OnPropertyChanged', (player) => {
      log.msg({
        src : 'kodi',
        msg : 'Player property changed',
      });
      process_player_data(player);
    });

    omnibus.kodi.socket.notification('Player.OnSeek', (player) => {
      log.msg({
        src : 'kodi',
        msg : 'Player seeking',
      });
      process_player_data(player);
    });

    omnibus.kodi.socket.notification('Player.OnStop', (player) => {
			status.kodi.player.status = 'stopped';
      log.msg({
        src : 'kodi',
        msg : 'Player '+status.kodi.player.status,
      });
      process_player_data(player);
    });

    omnibus.kodi.socket.notification('GUI.OnDPMSActivated', () => {
      log.msg({
        src : 'kodi',
        msg : 'DPMS activated',
      });
    });

    omnibus.kodi.socket.notification('GUI.OnDPMSDeactivated', () => {
      log.msg({
        src : 'kodi',
        msg : 'DPMS deactivated',
      });
    });

    omnibus.kodi.socket.notification('Application.OnVolumeChanged', (volume) => {
			status.kodi.volume = {
				level : volume.data.volume,
				muted : volume.data.muted,
			};
    });

    omnibus.kodi.socket.notification('GUI.OnScreensaverActivated', (data) => {
      log.msg({
        src : 'kodi',
        msg : 'Screensaver activated',
      });
    });

    omnibus.kodi.socket.notification('GUI.OnScreensaverDeactivated', () => {
      log.msg({
        src : 'kodi',
        msg : 'Screensaver deactivated',
      });
    });

		log.msg({
			src : 'kodi',
			msg : 'Connected to instance',
		});

		get_active_players(() => {
		});

    // Call me maybe?
    if (typeof callback === 'function') { callback(); }
  }).catch((e) => {
    // Handle errors
    log.msg({
      src : 'kodi',
      msg : 'Error: '+e.code,
    });

    // omnibus.kodi.socket = null;
    if (!status_autoconfig_loop) { autoconfig_loop(true); }

    // Call me maybe?
    if (typeof callback === 'function') { callback(); }
  });
}

// Get all active players
function get_active_players(callback) {
	if (config.media.kodi.enable !== true) {
    if (typeof callback === 'function') { callback(); }
    return;
  }

	omnibus.kodi.socket.Player.GetActivePlayers().then((players) => {
		if (!players[0]) {
			log.msg({
				src : 'kodi',
				msg : 'No players found',
			});
		}
		else {
			status.kodi.player.id   = players[0].playerid;
			status.kodi.player.type = players[0].type;

			log.msg({
				src : 'kodi',
				msg : 'Found player, ID: '+status.kodi.player.id+', type \''+status.kodi.player.type+'\'',
			});

			var item_array = [
				'album',
				'albumartist',
			];

			omnibus.kodi.socket.Player.GetItem(players[0].playerid, item_array).then((data) => {
				process_player_data({
					data : {
						item : data.item,
					},
				});
			});
		}

		// Call me maybe?
		if (status_autoconfig_loop) { autoconfig_loop(false); }
		if (typeof callback === 'function') { callback(); }
	});
}

function shutdown(callback) {
	if (config.media.kodi.enable !== true) {
    if (typeof callback === 'function') { callback(); }
    return;
  }

  log.msg({
    src : 'kodi',
    msg : 'Shutting down',
  });

  omnibus.kodi.socket = null;

  autoconfig_loop(false);
  if (typeof callback === 'function') { callback(); }
}

module.exports = {
	socket : null,

  // Clear omnibus.kodi.socket and loops if need be
  shutdown : (callback) => {
    shutdown(callback);
  },

  // Ask Kodi for the first player's player ID and type
  autoconfig : (callback) => {
    autoconfig(callback);
  },

  // Show notification in Kodi GUI
  notify : (title, message) => {
    if (config.media.kodi.enable !== true) {
      return;
    }

    if (omnibus.kodi.socket === null) {
      omnibus.kodi.autoconfig(() => {
        omnibus.kodi.notify(title, message);
      });
      return;
    }

    log.msg({
      src : 'kodi',
      msg : 'Sending notification; title : \''+title+'\', message : \''+message+'\'',
    });

    omnibus.kodi.socket.GUI.ShowNotification({
      'title'   : title,
      'message' : message,
    });
  },

  // Send commands to Kodi media player over the JSON-RPC websocket API
  command : (action) => {
    if (config.media.kodi.enable !== true) {
      return;
    }

    if (omnibus.kodi.socket === null) {
      omnibus.kodi.autoconfig(() => {
        omnibus.kodi.command(action);
      });
      return;
    }

    omnibus.kodi.socket.Player.GetActivePlayers().then((players) => { // List active players
      return Promise.all(players.map((player) => { // Map players
				status.kodi.player.id = player.playerid;

				log.msg({
					src : 'kodi',
					msg : 'Sending \''+action+'\' command to player ID '+status.kodi.player.id,
				});

        switch (action) {
					case 'getitem':
            return omnibus.kodi.socket.Player.GetItem(player.playerid);
						break;

          case 'stop':
            return omnibus.kodi.socket.Player.Stop(player.playerid);
            break;

          case 'pause':
            return omnibus.kodi.socket.Player.PlayPause(player.playerid);
            break;

          case 'previous':
            return omnibus.kodi.socket.Player.GoTo({
              'playerid' : player.playerid,
              'to'       : 'previous',
            });
            break;

          case 'next':
            return omnibus.kodi.socket.Player.GoTo({
              'playerid' : player.playerid,
              'to'       : 'next',
            });
            break;
        }
      }));
    });
  },
};
