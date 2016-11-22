#!/usr/bin/env node

var socket_server = function() {
  var server = require('http').createServer();
  var io     = require('socket.io')(server);

  var ibus2socket = function(data) {
    // If anybody's connected...
    if (sockets.length) {
      // console.log('[WS]   Sending data to clients');

      // Loop through all active sockets and send the data
      for (i = 0; i < sockets.length; i++) {
        try       { sockets[i].send(JSON.stringify(data)); }
        catch (e) { console.log(e);                        }
      }
    }
  };

  var socket_listen = function(port, omnibus) {
    io.on('error', function(err) {
      console.log('[WS]   Error caught in socket:\'%s\'', err);
    });

    // Start listening
    server.listen(port, function() {
      console.log('[WS]   Started, port %d', port);
    });

    // When a client connects, push them into the sockets array.
    io.on('connection', function(socket) {
      console.log('[WS]   Client connected');

      // Receive message from WebUI and send it over IBUS/KBUS
      socket.on('message', function(data) {
        console.log('[WS]   Message received');

        // Parse incoming JSON into object
        var ibus_data = JSON.parse(data);

        var ibus_packet = {
          src: parseInt(ibus_data.src, 16),
          dst: parseInt(ibus_data.dst, 16),
          msg: new Buffer(ibus_data.msg),
        }

        // Get source and destination module name (for logging and to double-check)
        var src_name = omnibus.bus_modules.get_module_name(ibus_data.src);
        var dst_name = omnibus.bus_modules.get_module_name(ibus_data.dst);

        // Send the message
        console.log('[WS]   [%s->%s] sending packet:', src_name, dst_name, ibus_packet.msg);

        // ibus2socket(ibus_packet);
        omnibus.ibus_connection.send_message(ibus_packet);
      });

      socket.on('disconnect', function() {
        console.log('[WS]   Socket disconnected');
      });

    });
  };

  init = function(socket_port, omnibus) {
    socket_listen(socket_port, omnibus);
    //omnibus.ibus_connection.on('data', ibus2socket);
  };

  return {
    init        : init,
    ibus2socket : ibus2socket,
  };
}();

module.exports = socket_server;
