#!/usr/bin/env node

// Notes...
//
// WRITER.writeBusPacket('3F', '00', ['0C', '4E', '01']) # Turn on the 'clown nose' for 3 seconds

// var msg = new Buffer([0x7a, 0x10, 0x00]); // Unlocked
// var msg = new Buffer([0x7a, 0x10, 0x01]); // Unlocked+WndwFL
// var msg = new Buffer([0x7a, 0x10, 0x02]); // Unlocked+WndwFR
// var msg = new Buffer([0x7a, 0x10, 0x04]); // Unlocked+WndwRL
// var msg = new Buffer([0x7a, 0x10, 0x08]); // Unlocked+WndwRR
// var msg = new Buffer([0x7a, 0x10, 0x10]); // Unlocked+WndwSun
// var msg = new Buffer([0x7a, 0x10, 0x20]); // Unlocked+Trunk
// var msg = new Buffer([0x7a, 0x11, 0x00]); // Unlocked+DoorFL
// var msg = new Buffer([0x7a, 0x12, 0x00]); // Unlocked+DoorFR
// var msg = new Buffer([0x7a, 0x14, 0x00]); // Unlocked+DoorRL
// var msg = new Buffer([0x7a, 0x18, 0x00]); // Unlocked+DoorRR
// var msg = new Buffer([0x7a, 0x50, 0x00]); // Unlocked+Interior lights
// var msg = new Buffer([0x7a, 0x10, 0x10]); // Unlocked+Sunroof+Interior lights
// var msg = new Buffer([0x7a, 0x20, 0x00]); // Locked
// var msg = new Buffer([0x7a, 0x60, 0x00]); // Locked+Interior lights
// var msg = new Buffer([0x7a, 0x20, 0x10]); // Locked+Sunroof
// var msg = new Buffer([0x7a, 0x50, 0x10]); // Unlocked+Sunroof+Interior lights


// Libraries
var ibus_interface = require('./ibus-interface.js');
var ibus_modules   = require('./ibus-modules.js');

// Color terminal output
var clc = require('cli-color');

// Sleep
var sleep = require('sleep');

// Serial device path
var device = '/dev/tty.SLAB_USBtoUART';

// IBUS connection handle
var ibus_connection = new ibus_interface(device);

// Run shutdown() on SIGINT
process.on('SIGINT', shutdown);

// Run check_data() on data events
ibus_connection.on('data', check_data);
ibus_connection.on('port_open', hello);


// ASCII to hex for cluster message
function ascii2hex(str) { 
	var array = [];

	for (var n = 0, l = str.length; n < l; n ++) {
		var hex = str.charCodeAt(n);
		array.push(hex);
	}

	return array;
}



// Startup function
function startup() {
	// Open serial port
	ibus_connection.startup();
}

// Shutdown function
function shutdown() {
	// Terminate connection
	ibus_connection.shutdown(function() {
		process.exit();
	});
}

// Send IBUS message
function ibus_send(ibus_packet) {
	ibus_connection.send_message(ibus_packet);
}



// On engine start
function hello() {
	// Turn phone LED green
	rad_led('green', 'flash');

	// Send welcome message to cluster
	ike_text('Hot Garbage Mtrnwrke');
}

// On engine off
function goodbye() {
	// Turn phone LED off
	rad_led('off', 'solid');

	// Send goodbye message to cluster
	ike_text('     ///M Power     ');
}



// RADio
function rad(action) {
	// new Message(DeviceAddress.OnBoardMonitor, DeviceAddress.Radio, "Press radio on/off", 0x48, 0x06);
	// new Message(DeviceAddress.OnBoardMonitor, DeviceAddress.Radio, "Release radio on/off", 0x48, 0x86);
	// Volume down
	// Volume up
}





function windows(group) {
	var src = 0x3f; // DIS
	var dst = 0x00; // GM

	// 1 = up
	// 
	// 0 = RR
	// 4 = LR

	// var msg = new Buffer([0x0c, 0x00, 0x00]); // RR down
	// var msg = new Buffer([0x0c, 0x00, 0x01]); // RR up
	// var msg = new Buffer([0x0c, 0x00, 0x02]); // Wipers+washer
	// var msg = new Buffer([0x0c, 0x00, 0x14]); // Wipers (one wipe?)
	// var msg = new Buffer([0x0c, 0x00, 0x15]); // Wipers (auto?)
	// var msg = new Buffer([0x0c, 0x00, 0x38]); // Wipers (3 wipes, stay up [maint. position?])
	// var msg = new Buffer([0x0c, 0x00, 0x4b]); // Washer only
	// var msg = new Buffer([0x0c, 0x00, 0x3c]); // Red nose on for 3 sec
	// var msg = new Buffer([0x0c, 0x00, 0x56]); // ALARM!!!
	// var msg = new Buffer([0x0c, 0x00, 0x03]); // LR down
	// var msg = new Buffer([0x0c, 0x00, 0x04]); // LR up
	// var msg = new Buffer([0x0c, 0x00, 0x05]); // Nothing
	// var msg = new Buffer([0x0c, 0x00, 0x06]); // Nothing
	// var msg = new Buffer([0x0c, 0x00, 0x08]); // Trunk open
	// var msg = new Buffer([0x0c, 0x00, 0x17]); // Interior on, no fade
	// var msg = new Buffer([0x0c, 0x00, 0x10]); // Wheel up, interior on 
	// var msg = new Buffer([0x0c, 0x00, 0x0b]); // Lock doors (no toggle)
	// var msg = new Buffer([0x0c, 1, 0]);       // Unlock doors (no toggle) 
	// var msg = new Buffer([0x0c, 5, 0]);       // Driver seat forward
	// var msg = new Buffer([0x0c, 0, 91]);      // Interior light, hazard button
	// var msg = new Buffer([0x0c, 0, 92]);      // toggle locks ??
	// var msg = new Buffer([0x0c, 0, 101]);     // front windows fully down
	// var msg = new Buffer([0x0c, 0, 102]);     // Sunroof open
	// var msg = new Buffer([0x0c, 0, 174]);     // Red nose flash for 3 sec
	// var msg = new Buffer([0x0c, 0, 177]);     // wheel up, down

	var msg     = new Buffer([0x0c, 5, 5]);   // Drivers seat tilt (not sure which way)
	var msg     = new Buffer([0x0c, 128, 0]); // Driver seat forward

	var open_fl = new Buffer([0x0c, 0x52, 0x01]);
	var open_fr = new Buffer([0x0c, 0x41, 0x01]);
	var open_rr = new Buffer([0x0c, 0x00, 0x46]);

	var msg     = new Buffer([0x7a, 0x10, 0x01]); // Unlocked+WndwFL
	var msg     = new Buffer([0x7a, 0x10, 0x02]); // Unlocked+WndwFR
	var msg     = new Buffer([0x7a, 0x10, 0x04]); // Unlocked+WndwRL
	var msg     = new Buffer([0x7a, 0x10, 0x08]); // Unlocked+WndwRR

	var ibus_packet = {
		src: src, 
		dst: dst,
		msg: msg,
	}

	ibus_send(ibus_packet);
}



// General module
function gm(object, action) {
	//static Message MessageOpenWindows = new Message(DeviceAddress.Diagnostic, DeviceAddress.BodyModule, 0x0C, 0x00, 0x65);

	var RequestDoorsStatus        = new Buffer([0x80, 0x00, 0x79]);
	var FoldMirrorsE46            = new Buffer([0x9b, 0x51, 0x6d, 0x90]);
	var UnfoldMirrorsE46          = new Buffer([0x9b, 0x51, 0x6d, 0xa0]);

	var src = 0x3F; // DIS
	var dst = 0x00; // GM

	var gm_windows_front_up       = new Buffer([0x0c, 0x00, 0x65]); // Not working
	var gm_locks_toggle           = new Buffer([0x0c, 0x00, 0x0b]);
	var gm_trunk                  = new Buffer([0x0c, 0x00, 0x40]);

	var gm_windows_sunroof_down   = new Buffer([0x0c, 0x00, 0x66]);
	var gm_windows_drv_rear_up    = new Buffer([0x0c, 0x00, 0x01]);
	var gm_windows_drv_rear_down  = new Buffer([0x0c, 0x00, 0x00]);
	var gm_windows_pss_rear_down  = new Buffer([0x0c, 0x00, 0x47]);
	var gm_windows_pss_rear_up    = new Buffer([0x0c, 0x00, 0x46]);

	var gm_windows_front_down     = new Buffer([0x0c, 0x00, 0x65]);

	var gm_seats_drv_forward      = new Buffer([0x0c, 0x00, 0x00]);
	var gm_seats_drv_back         = new Buffer([0x0c, 0x00, 0x01]);
	var gm_seats_pss_forward      = new Buffer([0x0c, 0x01, 0x00]);
	var gm_seats_pss_back         = new Buffer([0x0c, 0x01, 0x01]);

	var OpenTrunk                 = new Buffer([0x0c, 0x95, 0x01]);
	var LockDoors                 = new Buffer([0x0c, 0x4f, 0x01]); // 0x0c, 0x97, 0x01
	var LockDriverDoor            = new Buffer([0x0c, 0x47, 0x01]);
	var UnlockDoors               = new Buffer([0x0c, 0x45, 0x01]); // 0x0c, 0x03, 0x01
	var ToggleLockDoors           = new Buffer([0x0c, 0x03, 0x01]);

	var OpenWindowDriverFront     = new Buffer([0x0c, 0x52, 0x01]);
	var OpenWindowDriverRear      = new Buffer([0x0c, 0x41, 0x01]);
	var OpenWindowPassengerFront  = new Buffer([0x0c, 0x54, 0x01]);
	var OpenWindowPassengerRear   = new Buffer([0x0c, 0x44, 0x01]);

	var CloseWindowDriverFront    = new Buffer([0x0c, 0x53, 0x01]);
	var CloseWindowDriverRear     = new Buffer([0x0c, 0x42, 0x01]);
	var CloseWindowPassengerFront = new Buffer([0x0c, 0x55, 0x01]);
	var CloseWindowPassengerRear  = new Buffer([0x0c, 0x43, 0x01]);

	var OpenSunroof               = new Buffer([0x0c, 0x7e, 0x01]);
	var CloseSunroof              = new Buffer([0x0c, 0x7f, 0x01]);
	var FoldDriverMirrorE39       = new Buffer([0x0c, 0x01, 0x31, 0x01]);
	var FoldPassengerMirrorE39    = new Buffer([0x0c, 0x02, 0x31, 0x01]);
	var UnfoldDriverMirrorE39     = new Buffer([0x0c, 0x01, 0x30, 0x01]);
	var UnfoldPassengerMirrorE39  = new Buffer([0x0c, 0x02, 0x30, 0x01]);
	var GetAnalogValues           = new Buffer([0x0b, 0x01]);
}

// IKE/gauge backlight dimmer
function lcm_dimmer(value) {
	var src = 0xd0; // LCM
	var dst = 0xbf; // GLO 

	// Will need to concat and push array for value

	var lcm_dimmer_000 = new Buffer([0x5c, 0x00, 0x00]);
	var lcm_dimmer_254 = new Buffer([0x5c, 0xfe, 0x00]);
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

	// var fob_lock_down       = new Buffer([0x72, 0x12]);
	// var fob_unlock_down     = new Buffer([0x72, 0x22]);
	// var fob_trunk_down      = new Buffer([0x72, 0x42]);


	// RAD
	if (src == 'RAD') {
			var command = 'command';
			var data    = 'data';
	}

	// GM
	if (src == 'GM') {
		if (msg.compare(fob_trunk_down) == 0) {
			var command = 'depressed';
			var data    = 'trunk button';
		}
		else if (msg.compare(fob_lock_down) == 0) {
			var command = 'depressed';
			var data    = 'lock button';
		}
		else if (msg.compare(fob_unlock_down) == 0) {
			var command = 'depressed';
			var data    = 'unlock button';
		}
	}



	// var key_out             = new Buffer([0x74, 0x00, 0xff]);
	// var key_1_in            = new Buffer([0x74, 0x04, 0x01]);

	// EWS
	if (src == 'EWS') {
		if (msg.compare(key_out) == 0) {
			var command = 'removed';
			var data    = 'key';
		}
		else if (msg.compare(key_1_in) == 0) {
			var command = 'inserted';
			var data    = 'key 1';
		}
	}



	// MFL
	if (src == 'MFL') {
		if (msg[0] == 0x3B) {
			var command = 'button';

			if (msg[1] == 0x80) {
				var data    = 'send/end depressed';
				//ike_text('coolant: '+coolant_temp_c+'C        ');
				ike_text_urgent('coolant: '+coolant_temp_c+'C        ');
			}
			else if (msg[1] == 0xA0) {
				var data    = 'send/end released';
				ike_text_urgent_off();
			}
			else if (msg[1] == 0x90) {
				var data    = 'send/end long press';
			}
			else if (msg[1] == 0x01) {
				var data    = 'right pressed';
				windows_up();
			}
			else if (msg[1] == 0x08) {
				var data    = 'left pressed';
				windows_down();
			}
			else if (msg[1] == 0x21) {
				var data    = 'right released';
			}
			else if (msg[1] == 0x28) {
				var data    = 'left released';
			}
			else if (msg[1] == 0x18) {
				var data    = 'left long press';
			}
			else if (msg[1] == 0x11) {
				var data    = 'right long press';
			}
			else {
				var data = msg[1];
			}
		}
		else if (msg[0] == 0x01) {
			var command = 'button';
			var data    = 'r/t pressed';
		}
		else {
			var command = 'unknown';
			var data    = 'unknown';
		}
	}




	// CCM
	if (src == 'CCM') {
		if (msg[0] == 0x51) {
			var command = 'check control sensors';
			var data    = 'not sure yet.'
		}
		else if (msg[0] == 0x1a) {
			var command = 'urgent text';
			var data    = ''+msg+'';
		}
	}

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

	// msg_count++;
	// if (msg_count == 10) {
	//   msg_count = 0;
	// }

	console.log(src, dst, command, data)

}


// Instantiate initial variable values
var handbrake         = 'off';
var engine            = 'off';
var ignition          = 'off';
var msg_count         = 0;
var ext_temp_c        = 0;
var coolant_temp_c    = 0;
var vehicle_speed_kmh = 0;
var engine_speed_rpm  = 0;

// Flaps/windows are positioned as if you are looking down on the car from the sky
var open_flap_hood          = false;
var open_flap_trunk         = false;
var open_flap_front_left    = false;
var open_flap_front_right   = false;
var open_flap_rear_left     = false;
var open_flap_rear_right    = false;
var open_window_roof        = false;
var open_window_front_left  = false;
var open_window_front_right = false;
var open_window_rear_left   = false;
var open_window_rear_right  = false;

startup();
