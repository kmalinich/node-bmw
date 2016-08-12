#!/usr/bin/env node

var dbus = require('dbus-native');
var bus  = dbus.systemBus();

object = bus.getObject('org.bluez', '/', function (error, objects) {
	objects.as('org.freedesktop.DBus.ObjectManager').GetManagedObjects(function (error_obj, return_obj) {
		var path       = return_obj[2][0];
		var service    = return_obj[2][1][1][0];
		var name       = return_obj[2][1][1][1][1][1][1][0];
		var conn       = return_obj[2][1][1][1][9][1][1][0];
		var link_alert = return_obj[2][1][3][1][0][1][1][0];
		var network    = return_obj[2][1][4][1][0][1][1][0];

		console.log(path);
		console.log(service);
		console.log(name);
		console.log(conn);
		// console.log(link_alert);
		// console.log(network);

		process.exit();
	});
});
