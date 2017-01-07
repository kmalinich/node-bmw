#!/usr/bin/env node

// npm libraries
const dispatcher   = new (require('httpdispatcher'));
const http         = require('http');
const query_string = require('querystring');

// Everything connection object
const omnibus = {};

// Last time data was fired
omnibus.last_event = 0;

omnibus.bus_modules = new (require('../lib/bus-modules.js'));
omnibus.config      = require('../lib/config.js');  // Config
omnibus.status      = require('../lib/status.js');  // Global status object

// Data bus module libraries
omnibus.ABG  = new (require('../modules/ABG.js'))(omnibus);
omnibus.ANZV = new (require('../modules/ANZV.js'))(omnibus);
omnibus.BMBT = new (require('../modules/BMBT.js'))(omnibus);
omnibus.CCM  = new (require('../modules/CCM.js'))(omnibus);
omnibus.CDC  = new (require('../modules/CDC.js'))(omnibus);
omnibus.DSP  = new (require('../modules/DSP.js'))(omnibus);
omnibus.DSPC = new (require('../modules/DSPC.js'))(omnibus);
omnibus.EWS  = new (require('../modules/EWS.js'))(omnibus);
omnibus.GM   = new (require('../modules/GM.js'))(omnibus);
omnibus.GT   = new (require('../modules/GT.js'))(omnibus);
omnibus.HAC  = new (require('../modules/HAC.js'))(omnibus);
omnibus.IHKA = new (require('../modules/IHKA.js'))(omnibus);
omnibus.IKE  = new (require('../modules/IKE.js'))(omnibus);
omnibus.LCM  = new (require('../modules/LCM.js'))(omnibus);
omnibus.MFL  = new (require('../modules/MFL.js'))(omnibus);
omnibus.MID  = new (require('../modules/MID.js'))(omnibus);
omnibus.PDC  = new (require('../modules/PDC.js'))(omnibus);
omnibus.RAD  = new (require('../modules/RAD.js'))(omnibus);
omnibus.RLS  = new (require('../modules/RLS.js'))(omnibus);
omnibus.SES  = new (require('../modules/SES.js'))(omnibus);
omnibus.SHD  = new (require('../modules/SHD.js'))(omnibus);
omnibus.TEL  = new (require('../modules/TEL.js'))(omnibus);
omnibus.VID  = new (require('../modules/VID.js'))(omnibus);

// Custom libraries
omnibus.kodi = new (require('../lib/kodi.js'))(omnibus);
omnibus.HDMI = new (require('../lib/HDMI.js'))(omnibus);

// API/WebSocket libraries
omnibus.api_server    = http.createServer(api_handler);
omnibus.socket_server = new (require('../lib/socket-server.js'))(omnibus);

// IBUS libraries
omnibus.data_handler    = new (require('../ibus/data-handler.js'))(omnibus);   // Data handler
omnibus.ibus_connection = new (require('../ibus/ibus-interface.js'))(omnibus); // IBUS connection handle

// API handler function
function api_handler(request, response) {
	//console.log('[      API] %s request: %s', request.method, request.url);
	dispatcher.dispatch(request, response);
}

var data_array = [0xC0, 0x04, 0x68, 0x32, 0x11, 0x8F, 0x80, 0x0A, 0xBF, 0x13, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x43, 0x65, 0x18, 0x0A, 0x68, 0x39, 0x40, 0x09, 0x02, 0x01, 0x00, 0x03, 0x02, 0x08, 0x30, 0x19, 0x80, 0x1A, 0x37, 0x08, 0x4B, 0x45, 0x59, 0x20, 0x49, 0x4E, 0x20, 0x49, 0x47, 0x4E, 0x49, 0x54, 0x49, 0x4F, 0x4E, 0x20, 0x4C, 0x4F, 0x43, 0x4B, 0xE2, 0x3F, 0x23, 0xD0, 0x09, 0x00, 0x02, 0x00, 0x40, 0x01, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0x72, 0x4E, 0x21, 0x90, 0x01, 0x00, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x28, 0x16, 0x00, 0x00, 0x00, 0x13];
// var data_array = [0xC0, 0x04, 0x68, 0x32, 0x11, 0x8F];

var length = 5;
var data   = new Array();

function add_data(buffer) {
	// console.log('[parser] Received : 0x%s', buffer.toString(16));
	data.push(buffer);

	if (data.length >= length) {
		// IBUS packet:
		// SRC LEN DST MSG CHK
		var msg_src;
		var msg_len; // Length is the length of the packet after the LEN byte (or the entire thing, minus 2)
		var msg_dst;
		var msg_msg;
		var msg_crc;

		// Data from stream, must be verified
		msg_src = data[0];
		msg_len = data[1];
		msg_dst = data[2];

		var msg_dst_name = omnibus.bus_modules.hex2name(msg_dst);
		var msg_src_name = omnibus.bus_modules.hex2name(msg_src);

		if (data.length-2 !== msg_len) {
			console.log('[ANALYZING] %s => %s (%s/%s/%s)', msg_src_name, msg_dst_name, msg_len, data.length, msg_len+2);
		}
		else {
			// When we arrive at the complete message,
			// calculate our own CRC and compare it to
			// what the message is claiming it should be

			// Grab message (removing SRC LEN DST and CHK)
			msg_msg = data.slice(3, data.length-1);

			msg_crc = data[data.length-1];

			var calc_crc = 0x00;

			calc_crc = calc_crc^msg_src;
			calc_crc = calc_crc^msg_len;
			calc_crc = calc_crc^msg_dst;

			for (var byte = 0; byte < msg_msg.length; byte++) {
				calc_crc = calc_crc^msg_msg[byte];
			}

			console.log('[MSG PSBLE] %s => %s (%s/%s/%s)', msg_src_name, msg_dst_name, msg_len, data.length, msg_len+2);
			console.log('[MSG PSBLE] Message  : %s', msg_msg);
			console.log('[MSG PSBLE] Data     : %s', data.toString(16));
			console.log('[MSG PSBLE] Checksum : %s/%s', msg_crc.toString(16), calc_crc.toString(16));

			if (calc_crc === msg_crc) {
				console.log(' ');
				console.log('[MSG FOUND] ===========================');
				console.log('[MSG FOUND] Source      : %s', msg_src_name);
				console.log('[MSG FOUND] Destination : %s', msg_dst_name);
				console.log('[MSG FOUND] Length      : %s', msg_len);
				console.log('[MSG FOUND] Data        :', new Buffer(msg_msg));
				console.log('[MSG FOUND] Checksum    : %s', msg_crc.toString(16));
				console.log('[MSG FOUND] ===========================');
				console.log(' ');

				var msg_obj = {
					crc : msg_crc,
					dst : {
						name : msg_dst_name,
						id   : msg_dst,
					},
					len : msg_len,
					msg : msg_msg,
					src : {
						name : msg_src_name,
						id   : msg_src,
					},
				};

				omnibus.data_handler.check_data(msg_obj);

				// Reset data var
				data = new Array();
			}
		}
	}
}

function dodata() {
	setTimeout((data_array) => {
		//var data_chunk = new Buffer(data_array[0]);
		var data_chunk = data_array[0];

		// console.log('adding data 0x%s', data_chunk.toString(16));

		add_data(data_chunk);
		data_array.splice(0, 1);
		if (typeof data_array[0] !== 'undefined' && data_array.length !== 0) {
			dodata();
		}
		else {
			process.exit(0);
		}
	}, 5, data_array);
}

console.log('data array has %s entries', data_array.length);
dodata();
