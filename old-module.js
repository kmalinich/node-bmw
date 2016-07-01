#!/usr/bin/env node

// General module
function gm(object, action) {
	var FoldMirrorsE46           = new Buffer([0x9b, 0x51, 0x6d, 0x90]);
	var UnfoldMirrorsE46         = new Buffer([0x9b, 0x51, 0x6d, 0xa0]);

	var gm_locks_toggle          = new Buffer([0x0c, 0x00, 0x0b]);
	var gm_trunk                 = new Buffer([0x0c, 0x00, 0x40]);

	var gm_windows_sunroof_down  = new Buffer([0x0c, 0x00, 0x66]);
	var gm_windows_drv_rear_up   = new Buffer([0x0c, 0x00, 0x01]);
	var gm_windows_drv_rear_down = new Buffer([0x0c, 0x00, 0x00]);
	var gm_windows_pss_rear_down = new Buffer([0x0c, 0x00, 0x47]);
	var gm_windows_pss_rear_up   = new Buffer([0x0c, 0x00, 0x46]);

	var gm_windows_front_down    = new Buffer([0x0c, 0x00, 0x65]);

	var OpenTrunk                = new Buffer([0x0c, 0x95, 0x01]);
	var LockDoors                = new Buffer([0x0c, 0x4f, 0x01]); // 0x0c, 0x97, 0x01
	var LockDriverDoor           = new Buffer([0x0c, 0x47, 0x01]);
	var UnlockDoors              = new Buffer([0x0c, 0x45, 0x01]); // 0x0c, 0x03, 0x01
	var ToggleLockDoors          = new Buffer([0x0c, 0x03, 0x01]);

	var OpenSunroof              = new Buffer([0x0c, 0x7e, 0x01]);
	var CloseSunroof             = new Buffer([0x0c, 0x7f, 0x01]);
	var FoldDriverMirrorE39      = new Buffer([0x0c, 0x01, 0x31, 0x01]);
	var FoldPassengerMirrorE39   = new Buffer([0x0c, 0x02, 0x31, 0x01]);
	var UnfoldDriverMirrorE39    = new Buffer([0x0c, 0x01, 0x30, 0x01]);
	var UnfoldPassengerMirrorE39 = new Buffer([0x0c, 0x02, 0x30, 0x01]);
	var GetAnalogValues          = new Buffer([0x0b, 0x01]);
}

// Data handler
function check_data(packet) {
	var dst = ibus_modules.get_module_name(packet.dst);
	var src = ibus_modules.get_module_name(packet.src);
	var msg = packet.msg;

	// EWS
	if (src == 'EWS') {
		var key_out  = new Buffer([0x74, 0x00, 0xff]);
		var key_1_in = new Buffer([0x74, 0x04, 0x01]);

		if (msg.compare(key_out) == 0) {
			var command = 'removed';
			var data    = 'key';
		}
		else if (msg.compare(key_1_in) == 0) {
			var command = 'inserted';
			var data    = 'key 1';
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
}
