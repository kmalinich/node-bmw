#!/usr/bin/env node


function ascii_to_hexa(str)
{  
	var arr1 = [];  
	for (var n = 0, l = str.length; n < l; n ++)
	{  
		var hex = str.charCodeAt(n);
		arr1.push(hex);
	}  
	return arr1;
}




//
//
//
//
// EWS
//
//
//
//
//

var ews_key_out = {
	src: 0x44, // EWS
	dst: 0xbf, // LCM
	msg: new Buffer([
		0x74,
		0x00,
		0xff,
	]),
}

var ews_key_in = {
	src: 0x44, // EWS
	dst: 0xbf, // LCM
	msg: new Buffer([
		0x74,
		0x04,
		0x01,
	]),
}


// BC button press
// ????
var bc_button = {
	src: 0x80, // IKE
	dst: 0xFF, // GLO
	msg: new Buffer([
		0x57,
		0x02,
	]),
}



//
//
//
//
// General module
//
//
//
//
//

var gm_locks_toggle = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x0b
	]),
}

var gm_trunk = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x40
	]),
}

// ????
var gm_windows_front_up = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x65,
	]),
}

var gm_windows_sunroof_down = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x66,
	]),
}

var gm_windows_drv_rear_up = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x01,
	]),
}

var gm_windows_drv_rear_down = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x00,
	]),
}

var gm_windows_pss_rear_down = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x47,
	]),
}

var gm_windows_pss_rear_up = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x46,
	]),
}

var gm_seats_drv_forward = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x00,
	]),
}

var gm_seats_drv_back = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x01,
	]),
}

var gm_seats_pss_back = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x01,
		0x01,
	]),
}

var gm_windows_front_down = {
	src: 0x3f,
	dst: 0x00,
	msg: new Buffer([
		0x0c,
		0x00,
		0x65,
	]),
}

var ike_dimmer_000 = {
	src: 0xd0,
	dst: 0xbf,
	msg: new Buffer([
		0x5c,
		0x00,
		0x00,
	]),
}

var ike_dimmer_254 = {
	src: 0xd0,
	dst: 0xbf,
	msg: new Buffer([
		0x5c,
		0xfe,
		0x00,
	]),
}

var ike_hgbg = {
	src: 0x68, // RAD
	dst: 0x80, // IKE
	msg: new Buffer([
		0x23,
		0x40,
		0x07,
		0x48,
		0x6f,
		0x74,
		0x20,
		0x47,
		0x61,
		0x72,
		0x62,
		0x61,
		0x67,
		0x65,
		0x20,
		0x4d,
		0x6f,
		0x74,
		0x72,
		0x77,
		0x72,
		0x6b,
		0x6e,
		0x04
	]),
}

// Bit 1 = hazard light
// Bit 2 = low beam
// Bit 3 = fade
// Bit 4 = high beam
// The bits may be combined
// eg low beam and hazard lights =
// 0 0 0 0 0 1 1 0 = 06 (hex)
// 7 6 5 4 3 2 1 0

var lcm_flash_test = {
	src: 0x00, // All
	dst: 0xbf, // LCM
	msg: new Buffer([
		0x76,
		0x00,
	]),
}

var lcm_flash_hz_ike = {
	src: 0x00, // All
	dst: 0xbf, // LCM
	msg: new Buffer([
		0x76,
		0x01,
	]),
}

var lcm_flash_hz = {
	src: 0x00, // All
	dst: 0xbf, // LCM
	msg: new Buffer([
		0x76,
		0x02,
	]),
}

var lcm_flash_hzlb = {
	src: 0x00, // All
	dst: 0xbf, // LCM
	msg: new Buffer([
		0x76,
		0x0a,
	]),
}

var lcm_flash_off = {
	src: 0x00, // All
	dst: 0xbf, // LCM
	msg: new Buffer([
		0x76,
		0x00,
	]),
}


ibus_read,OBM,GLO,, <Buffer 48 08>

//
//
//
//
// OBC reset
//
//
//
//

var obc_reset_speed = {
	src: 0x3b, // NAV
	dst: 0x80, // IKE
	msg: new Buffer([
		0x41,
		0x0a,
		0x10,
	]),
}

var obc_reset_cons1 = {
	src: 0x3b, // NAV
	dst: 0x80, // IKE
	msg: new Buffer([
		0x41,
		0x04,
		0x10,
	]),
}

var obc_reset_cons2 = {
	src: 0x3b, // NAV
	dst: 0x80, // IKE
	msg: new Buffer([
		0x41,
		0x05,
		0x10,
	]),
}


//
//
//
//
// Phone LED
//
//
//
//

var obc_phone_led_off = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x00,
	]),
}

var obc_phone_led_13 = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x14,
	]),
}

var obc_phone_led_123 = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x15,
	]),
}

var obc_phone_led_12f3 = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x16,
	]),
}

var obc_phone_led_1f2 = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x21,
	]),
}

var obc_phone_led_1f2f = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x22,
	]),
}

var obc_phone_led_1f = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x20,
	]),
}

var obc_phone_led_123f = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x19,
	]),
}

var obc_phone_led_13f = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x18,
	]),
}

var obc_phone_led_12f = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x12,
	]),
}

var obc_phone_led_12 = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x11,
	]),
}

var obc_phone_led_1 = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x10,
	]),
}

var obc_phone_led_23f = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x09,
	]),
}

var obc_phone_led_3f = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x08,
	]),
}

var obc_phone_led_2f3 = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x06,
	]),
}

var obc_phone_led_23 = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x05,
	]),
}

var obc_phone_led_2f = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x02,
	]),
}

var obc_phone_led_2 = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x01,
	]),
}

var obc_phone_led_3 = {
	src: 0xc8, // TEL
	dst: 0xe7, // OBC
	msg: new Buffer([
		0x2b,
		0x04,
	]),
}

// Radio power depress: F0 68 48 06
// Radio power release: F0 68 48 86


var testing = "welcome              ";
var strarr = [0x23, 0x40, 0x07];
var strarr = strarr.concat(ascii_to_hexa(testing));
var strarr = strarr.concat(0x04);

var ike_hgbg2 = {
	src: 0x68, // RAD
	dst: 0x80, // IKE
	msg: new Buffer(strarr),
}

var testing2 = "my e39 540i         ";
var strarr2 = [0x23, 0x40, 0x07];
var strarr2 = strarr2.concat(ascii_to_hexa(testing2));
var strarr2 = strarr2.concat(0x04);

var ike_hgbg3 = {
	src: 0x68, // RAD
	dst: 0x80, // IKE
	msg: new Buffer(strarr2),
}
