#!/usr/bin/env node


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

// General module
function gm(object, action) {
	var FoldMirrorsE46            = new Buffer([0x9b, 0x51, 0x6d, 0x90]);
	var UnfoldMirrorsE46          = new Buffer([0x9b, 0x51, 0x6d, 0xa0]);

	var gm_locks_toggle           = new Buffer([0x0c, 0x00, 0x0b]);
	var gm_trunk                  = new Buffer([0x0c, 0x00, 0x40]);

	var gm_windows_sunroof_down   = new Buffer([0x0c, 0x00, 0x66]);
	var gm_windows_drv_rear_up    = new Buffer([0x0c, 0x00, 0x01]);
	var gm_windows_drv_rear_down  = new Buffer([0x0c, 0x00, 0x00]);
	var gm_windows_pss_rear_down  = new Buffer([0x0c, 0x00, 0x47]);
	var gm_windows_pss_rear_up    = new Buffer([0x0c, 0x00, 0x46]);

	var gm_windows_front_down     = new Buffer([0x0c, 0x00, 0x65]);

	var OpenTrunk                 = new Buffer([0x0c, 0x95, 0x01]);
	var LockDoors                 = new Buffer([0x0c, 0x4f, 0x01]); // 0x0c, 0x97, 0x01
	var LockDriverDoor            = new Buffer([0x0c, 0x47, 0x01]);
	var UnlockDoors               = new Buffer([0x0c, 0x45, 0x01]); // 0x0c, 0x03, 0x01
	var ToggleLockDoors           = new Buffer([0x0c, 0x03, 0x01]);

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

// Data handler
function check_data(packet) {
	var dst = ibus_modules.get_module_name(packet.dst);
	var src = ibus_modules.get_module_name(packet.src);
	var msg = packet.msg;


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
				// ike_text_urgent('coolant: '+coolant_temp_c+'C        ');

				var ibus_packet = {
					src: src, 
					dst: dst,
					msg: new Buffer(msg),
				}

				ibus_send(ibus_packet);
			}
			else if (msg[1] == 0xA0) {
				var data    = 'send/end released';
				// ike_text_urgent_off();
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
