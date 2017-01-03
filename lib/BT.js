#!/usr/bin/env node

// systemd dbus libraries
var dbus = require('dbus-native');

var BT = function(omnibus) {
	// systemd dbus handle
	var bus = dbus.systemBus();

	// Read dbus and get 1st paired device's name, status, path, etc
	var autoconfig = function() {
		bus.getObject('org.bluez', '/', function (error, objects) {
			objects.as('org.freedesktop.DBus.ObjectManager').GetManagedObjects(function (error_obj, return_obj) {
				var connected  = return_obj[2][1][1][1][9][1][1][0];
				var name       = return_obj[2][1][1][1][1][1][1][0];
				var path       = return_obj[2][0];
				var service    = return_obj[2][1][1][0];

				// var link_alert = return_obj[2][1][3][1][0][1][1][0];
				// var network    = return_obj[2][1][4][1][0][1][1][0];

				// Set variables in status object appropriately
				omnibus.status.bt_device.connected = connected;
				omnibus.status.bt_device.name      = name;
				omnibus.status.bt_device.path      = path;
				omnibus.status.bt_device.service   = service;

				console.log('[BT]   Configured bluetooth device \'%s\' at \'%s\'', name, path);
			});
		});
	}

	// Send commands over systemd dbus to BlueZ 5 to control bluetooth device
	var command = function(action) {
		switch (action) {
			case 'connect':
				// Send connect command to BlueZ
				bus.invoke({
					path        : omnibus.status.bt_device.path,
					destination : 'org.bluez',
					'interface' : omnibus.status.bt_device.service,
					member      : 'Connect',
					type        : dbus.messageType.methodCall
				});
				break;

			case 'disconnect':
				// Send disconnect command to BlueZ
				bus.invoke({
					path        : omnibus.status.bt_device.path,
					destination : 'org.bluez',
					'interface' : omnibus.status.bt_device.service,
					member      : 'Disconnect',
					type        : dbus.messageType.methodCall
				});
				break;

			case 'pause':
				// Send pause command to BlueZ
				bus.invoke({
					path        : omnibus.status.bt_device.path+'/player0',
					destination : 'org.bluez',
					'interface' : 'org.bluez.MediaPlayer1',
					member      : 'Pause',
					type        : dbus.messageType.methodCall
				});
				break;

			case 'play':
				// Send play command to BlueZ
				bus.invoke({
					path        : omnibus.status.bt_device.path+'/player0',
					destination : 'org.bluez',
					'interface' : 'org.bluez.MediaPlayer1',
					member      : 'Play',
					type        : dbus.messageType.methodCall
				});
				break;

			case 'previous':
				// Send previous track command to BlueZ
				bus.invoke({
					path        : omnibus.status.bt_device.path+'/player0',
					destination : 'org.bluez',
					'interface' : 'org.bluez.MediaPlayer1',
					member      : 'Previous',
					type        : dbus.messageType.methodCall
				});
				break;

			case 'next':
				// Send next track command to BlueZ
				bus.invoke({
					path        : omnibus.status.bt_device.path+'/player0',
					destination : 'org.bluez',
					'interface' : 'org.bluez.MediaPlayer1',
					member      : 'Next',
					type        : dbus.messageType.methodCall
				});
				break;
		}

		console.log('[BT]   Sending \'%s\' command to bluetooth device \'%s\'', action, omnibus.status.bt_device.name);
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

module.exports = BT;
