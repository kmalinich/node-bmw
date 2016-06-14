#!/usr/bin/env node

// ASCII to hex for cluster message
function ascii2hex(str) { 
	var array = [];

	for (var n = 0, l = str.length; n < l; n ++) {
		var hex = str.charCodeAt(n);
		array.push(hex);
	}

	return array;
}


// On engine start
function hello() {
	// Turn phone LED green
	rad_led('green', 'flash');

	// Send welcome message to cluster
	ike_text('Hot Garbage Mtrnwrke');
}

// OBC reset
function obc_reset(value) {
	var src = 0x3b; // NAV
	var dst = 0x80; // IKE

	// if statements to determine action
	if (value == 'speed') {
		var msg       = new Buffer([0x41, 0x0a, 0x10]);
		var obc_value = 'Average speed';
	} else if (value == 'cons1') {
		var msg       = new Buffer([0x41, 0x04, 0x10]);
		var obc_value = 'Average consumption 1';
	} else if (value == 'cons2') {
		var msg       = new Buffer([0x41, 0x05, 0x10]);
		var obc_value = 'Average consumption 2';
	}

	console.log('Resetting OBC value:', obc_value);

	var ibus_packet = {
		src: src, 
		dst: dst,
		msg: new Buffer(msg),
	}

	ibus_send(ibus_packet);
}

function ike() {
	var RequestTime            = new Message(DeviceAddress.GraphicsNavigationDriver, DeviceAddress.InstrumentClusterElectronics, "Request Time", 0x41, 0x01, 0x01);
	var RequestDate            = new Message(DeviceAddress.GraphicsNavigationDriver, DeviceAddress.InstrumentClusterElectronics, "Request Date", 0x41, 0x02, 0x01);
	var Gong1                  = new Message(DeviceAddress.Radio,                    DeviceAddress.InstrumentClusterElectronics, "Gong 1", 0x23, 0x62, 0x30, 0x37, 0x08);
	var Gong2                  = new Message(DeviceAddress.Radio,                    DeviceAddress.InstrumentClusterElectronics, "Gong 2", 0x23, 0x62, 0x30, 0x37, 0x10);
	var ResetConsumption1      = new Message(DeviceAddress.GraphicsNavigationDriver, DeviceAddress.InstrumentClusterElectronics, "Reset Consumption 1", 0x41, 0x04, 0x10);
	var ResetConsumption2      = new Message(DeviceAddress.GraphicsNavigationDriver, DeviceAddress.InstrumentClusterElectronics, "Reset Consumption 2", 0x41, 0x05, 0x10);
	var ResetAverageSpeed      = new Message(DeviceAddress.GraphicsNavigationDriver, DeviceAddress.InstrumentClusterElectronics, "Reset Avgerage Speed", 0x41, 0x0A, 0x10);
	var SpeedLimitCurrentSpeed = new Message(DeviceAddress.GraphicsNavigationDriver, DeviceAddress.InstrumentClusterElectronics, "Speed Limit to Current Speed", 0x41, 0x09, 0x20);
	var SpeedLimitOff          = new Message(DeviceAddress.GraphicsNavigationDriver, DeviceAddress.InstrumentClusterElectronics, "Speed Limit OFF", 0x41, 0x09, 0x08);
	var SpeedLimitOn           = new Message(DeviceAddress.GraphicsNavigationDriver, DeviceAddress.InstrumentClusterElectronics, "Speed Limit ON", 0x41, 0x09, 0x04);
}

function ike_text_urgent(message) {
	var src = 0x30; // ??
	var dst = 0x80; // IKE

	var message_hex = [0x1A, 0x35, 0x00];
	var message_hex = message_hex.concat(ascii2hex(message));
	// var message_hex = message_hex.concat(0x04);

	var ibus_packet = {
		src: src, 
		dst: dst,
		msg: new Buffer(message_hex),
	}

	ibus_send(ibus_packet);
}

function ike_text_urgent_off() {
	var src = 0x30; // ??
	var dst = 0x80; // IKE

	var message_hex = [0x1A, 0x30, 0x00];

	var ibus_packet = {
		src: src, 
		dst: dst,
		msg: new Buffer(message_hex),
	}

	ibus_send(ibus_packet);
}

// IKE cluster text send message
function ike_text(message) {
	var src = 0x68; // RAD
	var dst = 0x80; // IKE

	// Need to center and pad spaces out to 20 chars
	console.log('Sending message to IKE:', message);

	var message_hex = [0x23, 0x50, 0x30, 0x07];
	var message_hex = message_hex.concat(ascii2hex(message));
	var message_hex = message_hex.concat(0x04);

	var ibus_packet = {
		src: src, 
		dst: dst,
		msg: new Buffer(message_hex),
	}

	ibus_send(ibus_packet);
}

// Data handler
function check_data(packet) {
	var dst = ibus_modules.get_module_name(packet.dst);
	var src = ibus_modules.get_module_name(packet.src);
	var msg = packet.msg;

	// IKE
	if (src == 'IKE') {
		if (msg[0] == 0x17) {
			var command = 'odometer';
			var data    = 'not sure yet.'
		}
		else if (msg[0] == 0x57) {
			var command = 'BC button';
			var data    = 'depressed';
		}
		else if (msg[0] == 0x18) {
			var command = 'speed/RPM';

			// Update vehicle and engine speed variables
			engine_speed_rpm  = msg[2]*100;
			vehicle_speed_kmh = msg[1];

			var data          = vehicle_speed_kmh+' km/h, '+engine_speed_rpm+' RPM';
		}
		else if (msg[0] == 0x24) {
			var command    = 'obc text';
			var data       = ' '+msg+' ';
		}
		else if (msg[0] == 0x19) {
			var command    = 'temperature';

			// Update external and engine coolant temp variables
			ext_temp_c     = msg[1];
			coolant_temp_c = msg[2];

			var data       = ext_temp_c+'C outside, '+coolant_temp_c+'C coolant';
		}
		else if (msg[0] == 0x11) {
			var command = 'ignition';
			if (msg[1] == 0x00) {
				ignition = 'off';
			}
			else if (msg[1] == 0x01) {
				ignition = 'accessory';
			}
			else if (msg[1] == 0x03) {
				ignition = 'on';
			}
			else if (msg[1] == 0x07) {
				ignition = 'starting';
			}
			else {
				ignition = 'unknown';
			}

			var data    = 'ignition: '+ignition;
		}
		else if (msg[0] == 0x13) {
			var command = 'sensors';

			if (msg[1] == 0x01) { handbrake = 'on'; } else { handbrake = 'off'; }
			if (msg[1] == 0x02) { engine    = 'on'; } else { engine    = 'off'; }

			var data    = 'handbrake: '+handbrake+', engine: '+engine;
		}
		else {
			var command = msg[0];
			var data    = msg[1];
		}
	}

	console.log(src, dst, command, data)

}
