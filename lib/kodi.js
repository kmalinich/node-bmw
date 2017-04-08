#!/usr/bin/env node

kodi_socket = null;
status_autoconfig_loop = false;
interval_autoconfig_loop = null;

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
      status_autoconfig_loop = true;
      interval_autoconfig_loop = setInterval(() => {
        if (kodi_socket !== null) {
          autoconfig_loop(false);
        }

        omnibus.kodi.autoconfig(() => {
        });
      }, 10000);

      log.msg({
        src : 'kodi',
        msg : 'Started autoconfig loop',
      });
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
			if (player.data.item.title ) {
				status.kodi.player.title = player.data.item.title;
				omnibus.IKE.text_warning('P: '+status.kodi.player.title, 2000);
			}
			if (player.data.item.label ) { status.kodi.player.title  = player.data.item.label;     }
			if (player.data.item.albumartist) { status.kodi.player.artist = player.data.item.albumartist[0]; }
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

function autoconfig(callback) {
	if (config.media.kodi.enable !== true) {
		if (typeof callback === 'function') { callback(); }
		return;
	}

  if (kodi_socket !== null) {
    autoconfig_loop(false);
    if (typeof callback === 'function') { callback(); }
    return;
  }

  log.msg({
    src : 'kodi',
    msg : 'Performing autoconfig',
  });

  kodi_ws(config.media.kodi.host, config.media.kodi.port).then((kodi_socket) => {
    // Event/error handling
    kodi_socket.on('error', () => {
      log.msg({
        src : 'kodi',
        msg : 'Crashed/died',
      });

      kodi_socket = null;

      if (!status_autoconfig_loop) { autoconfig_loop(true); }
    });

    kodi_socket.notification('Player.OnPause', (player) => {
      log.msg({
        src : 'kodi',
        msg : 'Player paused: '+player.data.item.title,
      });
      process_player_data(player);
    });

    kodi_socket.notification('Player.OnPlay', (player) => {
      log.msg({
        src : 'kodi',
        msg : 'Player playing: '+player.data.item.title,
      });
			process_player_data(player);
    });

    kodi_socket.notification('Player.OnPropertyChanged', (player) => {
      log.msg({
        src : 'kodi',
        msg : 'Player property changed',
      });
      process_player_data(player);
    });

    kodi_socket.notification('Player.OnSeek', (player) => {
      log.msg({
        src : 'kodi',
        msg : 'Player seeking: '+player.data.item.title,
      });
      process_player_data(player);
    });

    kodi_socket.notification('Player.OnStop', (player) => {
      log.msg({
        src : 'kodi',
        msg : 'Player stopped',
      });
      process_player_data(player);
    });

    kodi_socket.notification('GUI.OnDPMSActivated', () => {
      log.msg({
        src : 'kodi',
        msg : 'DPMS activated',
      });
    });

    kodi_socket.notification('GUI.OnDPMSDeactivated', () => {
      log.msg({
        src : 'kodi',
        msg : 'DPMS deactivated',
      });
    });

    kodi_socket.notification('GUI.OnScreensaverActivated', (data) => {
      log.msg({
        src : 'kodi',
        msg : 'Screensaver activated',
      });
    });

    kodi_socket.notification('GUI.OnScreensaverDeactivated', () => {
      log.msg({
        src : 'kodi',
        msg : 'Screensaver deactivated',
      });
    });

    kodi_socket.notification('System.OnQuit', () => {
      log.msg({
        src : 'kodi',
        msg : 'Instance exited',
      });

			kodi_socket = null;

			if (!status_autoconfig_loop) { autoconfig_loop(true); }
		});


		/* Get all active players and log them */
		return kodi_socket.Player.GetActivePlayers().then((players) => {
			log.msg({
				src : 'kodi',
				msg : 'Connected to instance',
			});

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
				// omnibus.kodi.command('getitem');
				//
				//

				var item_array = new Array();
				item_array = [
					'album',
					'albumartist',
				];

				kodi_socket.Player.GetItem(players[0].playerid, item_array).then((data) => {
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
  }).catch((e) => {
    // Handle errors
    log.msg({
      src : 'kodi',
      msg : 'Error: '+e.code,
    });

    kodi_socket = null;

    if (!status_autoconfig_loop) { autoconfig_loop(true); }

    // Call me maybe?
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

  kodi_socket = null;

  autoconfig_loop(false);
  if (typeof callback === 'function') { callback(); }
}

module.exports = {
  // Clear kodi_socket and loops if need be
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

    if (kodi_socket === null) {
      omnibus.kodi.autoconfig(() => {
        omnibus.kodi.notify(title, message);
      });
      return;
    }

    log.msg({
      src : 'kodi',
      msg : 'Sending notification; title : \''+title+'\', message : \''+message+'\'',
    });

    kodi_socket.GUI.ShowNotification({
      'title'   : title,
      'message' : message,
    });
  },

  // Send commands to Kodi media player over the JSON-RPC websocket API
  command : (action) => {
    if (config.media.kodi.enable !== true) {
      return;
    }

    if (kodi_socket === null) {
      omnibus.kodi.autoconfig(() => {
        omnibus.kodi.command(action);
      });
      return;
    }

    kodi_socket.Player.GetActivePlayers().then((players) => { // List active players
      return Promise.all(players.map((player) => { // Map players

        log.msg({
          src : 'kodi',
          msg : 'Sending \''+action+'\' command to player ID \''+status.kodi.player_id+'\'',
        });

        switch (action) {
					case 'getitem':
            return kodi_socket.Player.GetItem(player.playerid);
						break;

          case 'stop':
            return kodi_socket.Player.Stop(player.playerid);
            break;

          case 'pause':
            return kodi_socket.Player.PlayPause(player.playerid);
            break;

          case 'previous':
            return kodi_socket.Player.GoTo({
              'playerid' : player.playerid,
              'to'       : 'previous',
            });
            break;

          case 'next':
            return kodi_socket.Player.GoTo({
              'playerid' : player.playerid,
              'to'       : 'next',
            });
            break;
        }
      }));
    });
  },
};
