// Array of module names
var _modules = {
	'ABG'  : 0xA4, // Airbag
	'AHL'  : 0x66, // Adaptive headlight unit
	'ANZV' : 0xE7, // Display group
	'ASC'  : 0x56, // Anti-lock braking system with ASC
	'ASST' : 0xCA, // BMW Assist
	'BMBT' : 0xF0, // On board monitor control panel
	'CCM'  : 0x30, // Check control messages
	'CDC'  : 0x18, // CD changer
	'CDCD' : 0x76, // CD changer (DIN size)
	'CID'  : 0x46, // Center information display
	'CSU'  : 0xF5, // Centre switch control unit
	'CVM'  : 0x52, // Cabrio folding top module
	'DIA'  : 0x3F, // Diagnostic
	'DME'  : 0x12, // Digital Motor Electronics
	'DME2' : 0xB8, // DME (K2000 protocol)
	'DSP'  : 0x6A, // Digital sound processor amplifier
	'DSPC' : 0xEA, // Digital sound processor controller
	'EGS'  : 0x32, // Electronic gearbox control
	'EHC'  : 0xAC, // Electronic height control
	'EKM'  : 0x02, // Electronic body module
	'EKP'  : 0x65, // Electronic fuel pump
	'EWS'  : 0x44, // EWS immobilizer
	'FBZV' : 0x40, // Key fob (only older E38)
	'FHK'  : 0xA7, // Automatic climate control, rear
	'FID'  : 0xA0, // Multi-information display, rear
	'FMBT' : 0x47, // Rear monitor controls
	'GLO'  : 0xBF, // Global
	'GM'   : 0x00, // General module
	'GR'   : 0xA6, // Cruise control
	'GT'   : 0x3B, // Navigation
	'GTF'  : 0x43, // Navigation, rear
	'HAC'  : 0x9A, // Headlight aim control
	'HKM'  : 0x24, // Boot lid control unit
	'IHKA' : 0x5B, // Automatic climate control
	'IKE'  : 0x80, // Cluster
	'IRIS' : 0xE0, // Integrated radio information system
	'LCM'  : 0xD0, // Light/check module
	'LOC'  : 0xFF, // Local
	'LWS'  : 0x57, // Steering angle sensor
	'MFL'  : 0x50, // Multi function lever
	'MID'  : 0xC0, // Multi-information display
	'MID1' : 0x01, // Multi-information display (1st generation)
	'MM3'  : 0x9C, // Mirror memory 3
	'MML'  : 0x51, // Mirror memory, left
	'MMR'  : 0x9B, // Mirror memory, right
	'NAVC' : 0xA8, // Navigation China
	'NAVE' : 0x7F, // Navigation Europe
	'NAVJ' : 0xBB, // Navigation Japan
	'PDC'  : 0x60, // Park distance control
	'PIC'  : 0xF1, // Programmable controller (custom unit)
	'RAD'  : 0x68, // Radio
	'RCC'  : 0x28, // Radio controlled clock
	'RCSC' : 0x80, // Revolution counter/steering column
	'RDC'  : 0x70, // Tire pressure control
	'RLS'  : 0xE8, // Rain/light sensor
	'SDRS' : 0x73, // Sirius sat radio
	'SES'  : 0xB0, // Handfree/speech input
	'SHD'  : 0x08, // Sunroof module
	'SM'   : 0x72, // Seat memory
	'SMAD' : 0xDA, // Seat memory assistant driver
	'SOR'  : 0x74, // Seat occupancy recognition unit
	'STH'  : 0x6B, // Standing heat
	'TCU'  : 0xCA, // Telematics control unit
	'TEL'  : 0xC8, // Telephone
	'VID'  : 0xED, // Video input/TV tuner
};

// Clean all the text strings
function clean_class_all() {
	// This is really dumb and there is a better way
	clean_class('#engine-running');
	clean_class('#engine-speed');
	clean_class('#flaps-front-left');
	clean_class('#flaps-front-right');
	clean_class('#flaps-hood');
	clean_class('#flaps-rear-left');
	clean_class('#flaps-rear-right');
	clean_class('#flaps-trunk');
	clean_class('#obc-aux-heat-timer-1');
	clean_class('#obc-aux-heat-timer-2');
	clean_class('#obc-coding-unit-cons');
	clean_class('#obc-coding-unit-distance');
	clean_class('#obc-coding-unit-speed');
	clean_class('#obc-coding-unit-temp');
	clean_class('#obc-coding-unit-time');
	clean_class('#obc-consumption-1');
	clean_class('#obc-consumption-1-unit');
	clean_class('#obc-consumption-2');
	clean_class('#obc-consumption-2-unit');
	clean_class('#obc-date');
	clean_class('#obc-distance');
	clean_class('#obc-distance-unit');
	clean_class('#obc-range');
	clean_class('#obc-range-unit');
	clean_class('#obc-speedavg');
	clean_class('#obc-speedavg-unit');
	clean_class('#obc-speedlimit');
	clean_class('#obc-speedlimit-unit');
	clean_class('#obc-stopwatch');
	clean_class('#obc-temp-exterior');
	clean_class('#obc-temp-exterior-unit');
	clean_class('#obc-time');
	clean_class('#obc-timer');
	clean_class('#temperature-coolant');
	clean_class('#temperature-coolant-unit');
	clean_class('#vehicle-handbrake');
	clean_class('#vehicle-ignition');
	clean_class('#vehicle-reverse');
	clean_class('#vehicle-speed');
	clean_class('#vehicle-speed-unit');
	clean_class('#windows-front-left');
	clean_class('#windows-front-right');
	clean_class('#windows-rear-left');
	clean_class('#windows-rear-right');
	clean_class('#windows-roof');
	//clean_class('');
}

// Remove all color-coded CSS classes from a text id
function clean_class(id) {
	$(id).removeClass('text-danger').removeClass('text-success').removeClass('text-warning').removeClass('text-primary').removeClass('text-info').text('');
}

function form_gm() {
	console.log($('#form-gm').serialize());
	$.ajax({
		url      : '/api/gm',
		type     : 'POST',
		dataType : 'json',
		data     : $('#form-gm').serialize(),
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

function form_ike_get() {
	console.log($('#form-ike-get').serialize());
	$.ajax({
		url      : '/api/ike',
		type     : 'POST',
		dataType : 'json',
		data     : $('#form-ike-get').serialize(),
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

function form_ike_gong() {
	console.log($('#form-ike-gong').serialize());
	$.ajax({
		url      : '/api/ike',
		type     : 'POST',
		dataType : 'json',
		data     : $('#form-ike-gong').serialize(),
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

function form_ike_reset() {
	console.log($('#form-ike-reset').serialize());
	$.ajax({
		url      : '/api/ike',
		type     : 'POST',
		dataType : 'json',
		data     : $('#form-ike-reset').serialize(),
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

function form_ike_text() {
	console.log($('#form-ike-text').serialize());
	$.ajax({
		url      : '/api/ike',
		type     : 'POST',
		dataType : 'json',
		data     : $('#form-ike-text').serialize(),
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

function form_lcm() {
	console.log($('#form-lcm').serialize());
	$.ajax({
		url      : '/api/lcm',
		type     : 'POST',
		dataType : 'json',
		data     : $('#form-lcm').serialize(),
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

// Decode hex string and get module name
function get_module_name(key) {
	var hkey = parseInt(key, 16);

	for (var dkey in _modules) {
		if (_modules[dkey] === hkey) {
			return dkey;
		}
	}

	return 'Unknown Device' + ' - ' + key;
};

// Get IO status 
function gm_get() {
	console.log('gm_get();');

	$.ajax({
		url      : '/api/gm',
		type     : 'POST',
		dataType : 'json',
		data     : {
			'gm-command' : 'gm-get',
		},
		success : function(return_data) {
			console.log(return_data);
		}
	});
}

// Central locking/unlocking
function gm_cl(action) {
	console.log('gm_cl(%s);', action);

	$.ajax({
		url      : '/api/gm',
		type     : 'POST',
		dataType : 'json',
		data     : {
			'gm-command'        : 'gm-cl',
			'gm-command-action' : action,
		},
		success : function(return_data) {
			console.log(return_data);
		}
	});
}

// AJAX for GM interior_light
function gm_interior_light(value) {
	console.log('gm_interior_light(%s);', value);

	$.ajax({
		url      : '/api/gm',
		type     : 'POST',
		dataType : 'json',
		data     : 'gm-interior-light='+value,
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

// GM window control
function gm_windows(window, action) {
	console.log('gm_windows(%s, %s);', window, action);

	$.ajax({
		url      : '/api/gm',
		type     : 'POST',
		dataType : 'json',
		data     : {
			'gm-window'        : window,
			'gm-window-action' : action,
		},
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

// AJAX for IKE backlight
function ike_backlight(value) {
	console.log('ike_backlight(%s);', value);

	$.ajax({
		url      : '/api/ike',
		type     : 'POST',
		dataType : 'json',
		data     : 'ike-backlight='+value,
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

function ike_set_clock() {
	var timestamp     = moment();
	var post_data     = {};

	post_data.command = 'obc_clock';
	post_data.day     = timestamp.format('D');
	post_data.month   = timestamp.format('M');
	post_data.year    = timestamp.format('YY');
	post_data.hour    = timestamp.format('H');
	post_data.minute  = timestamp.format('m');
	console.log(post_data);

	$.ajax({
		url      : '/api/ike',
		type     : 'POST',
		dataType : 'json',
		data     : post_data,
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

// AJAX for LCM dimmer
function lcm_dimmer(value) {
	console.log('lcm_dimmer(%s);', value);

	$.ajax({
		url      : '/api/lcm',
		type     : 'POST',
		dataType : 'json',
		data     : 'lcm-dimmer='+value,
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

// LCM Get IO status
function lcm_get() {
	console.log('lcm_get();');

	$.ajax({
		url      : '/api/lcm',
		type     : 'POST',
		dataType : 'json',
		data     : 'lcm-get=true',
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

// Prepare GM page
function prepare_gm() {
	prepare_gm_interior_light();
}

// Initialize GM interior_light slider
function prepare_gm_interior_light() {
	$('#slider-gm-interior-light').on('slideStart', function(data) {
		console.log('gm_interior_light_slideStart: %s', data.value);
		gm_interior_light(data.value);
	});

	$('#slider-gm-interior-light').on('slideStop', function(data) {
		console.log('gm_interior_light_slidestop: %s', data.value);
		gm_interior_light(data.value);
	});
}

// Prepare IKE page
function prepare_ike() {
	prepare_ike_backlight();
}

// Initialize IKE backlight slider
function prepare_ike_backlight() {
	$('#slider-ike-backlight').on('slideStart', function(data) {
		console.log('ike_backlight_slideStart: %s', data.value);
		ike_backlight(data.value);
	});

	$('#slider-ike-backlight').on('slideStop', function(data) {
		console.log('ike_backlight_slidestop: %s', data.value);
		ike_backlight(data.value);
	});
}

// Prepare LCM page
function prepare_lcm() {
	prepare_lcm_dimmer();
}

// Initialize LCM dimmer slider 
function prepare_lcm_dimmer() {
	$('#slider-lcm-dimmer').on('slideStart', function(data) {
		console.log('lcm_dimmer_slideStart: %s', data.value);
		// lcm_dimmer(data.value);
	});

	$('#slider-lcm-dimmer').on('slideStop', function(data) {
		console.log('lcm_dimmer_slidestop: %s', data.value);
		// lcm_dimmer(data.value);
	});
}

// Get status object, parse, and display
function status() {
	$.ajax({
		url      : '/api/status',
		type     : 'GET',
		dataType : 'json',
		success  : function(return_data) {
			console.log(return_data);

			// Clean up page
			clean_class_all();

			// Time and date
			$('#obc-time').text(return_data.obc.time);
			$('#obc-date').text(return_data.obc.date);

			// Engine status
			$('#engine-speed').text(return_data.engine.speed);
			if (return_data.engine.running) {
				$('#engine-running').text('Running').addClass('text-success');
			}
			else {
				$('#engine-running').text('Not running').addClass('text-danger');
			}

			/*
			 * Temperatures
			 */

			// Units
			$('#temperature-coolant-unit').text(return_data.coding.unit_temp.toUpperCase());
			$('#obc-temp-exterior-unit'  ).text(return_data.coding.unit_temp.toUpperCase());

			if (return_data.coding.unit_temp == 'c') { 
				$('#temperature-coolant').text(return_data.temperature.coolant_c);
				$('#obc-temp-exterior').text(return_data.temperature.exterior_c);
			}
			else if (return_data.coding.unit_temp == 'f') {
				$('#temperature-coolant').text(return_data.temperature.coolant_f);
				$('#obc-temp-exterior'  ).text(return_data.temperature.exterior_f);
			}

			/*
			 * Vehicle sensors
			 */

			// Handbrake
			if (return_data.vehicle.handbrake) {
				$('#vehicle-handbrake').text('Handbrake on').addClass('text-danger');
			}
			else {
				$('#vehicle-handbrake').text('Handbrake off').addClass('text-success');
			}

			// Reverse
			if (return_data.vehicle.reverse) {
				$('#vehicle-reverse').text('In reverse').addClass('text-danger');
			}
			else {
				$('#vehicle-reverse').text('Not in reverse').addClass('text-success');
			}

			// Ignition
			if (return_data.vehicle.ignition == 'run') {
				$('#vehicle-ignition').text('Ignition run').addClass('text-success');
			}
			else if (return_data.vehicle.ignition == 'accessory') {
				$('#vehicle-ignition').text('Ignition accessory').addClass('text-info');
			}
			else if (return_data.vehicle.ignition == 'start') {
				$('#vehicle-ignition').text('Ignition start').addClass('text-warning');
			}
			else {
				$('#vehicle-ignition').text('Ignition off').addClass('text-danger');
			}

			// Doors (flaps) and window status
			if (return_data.flaps.front_left)    { $('#flaps-front-left').text('Front left open');     } else { $('#flaps-front-left').text('Front left closed');     }
			if (return_data.flaps.front_right)   { $('#flaps-front-right').text('Front right open');   } else { $('#flaps-front-right').text('Front right closed');   }
			if (return_data.flaps.hood)          { $('#flaps-hood').text('Hood open');                 } else { $('#flaps-hood').text('Hood closed');                 }
			if (return_data.flaps.rear_left)     { $('#flaps-rear-left').text('Rear left open');       } else { $('#flaps-rear-left').text('Rear left closed');       }
			if (return_data.flaps.rear_right)    { $('#flaps-rear-right').text('Rear right open');     } else { $('#flaps-rear-right').text('Rear right closed');     }
			if (return_data.flaps.trunk)         { $('#flaps-trunk').text('Trunk open');               } else { $('#flaps-trunk').text('Trunk closed');               }
			if (return_data.windows.front_left)  { $('#windows-front-left').text('Front left open');   } else { $('#windows-front-left').text('Front left closed');   }
			if (return_data.windows.front_right) { $('#windows-front-right').text('Front right open'); } else { $('#windows-front-right').text('Front right closed'); }
			if (return_data.windows.rear_left)   { $('#windows-rear-left').text('Rear left open');     } else { $('#windows-rear-left').text('Rear left closed');     }
			if (return_data.windows.rear_right)  { $('#windows-rear-right').text('Rear right open');   } else { $('#windows-rear-right').text('Rear right closed');   }
			if (return_data.windows.roof)        { $('#windows-roof').text('Moonroof open');           } else { $('#windows-roof').text('Moonroof closed');           }

			// Lighting status
			if (return_data.lights.interior) { $('#lights-interior').text('Interior lights on'); } else { $('#lights-interior').text('Interior lights off'); }

			// Central locking status
			if (return_data.vehicle.locked) { $('#vehicle-locked').text('Central locking locked'); } else { $('#vehicle-locked').text('Central locking unlocked'); }

			// Current, average, and limit speed
			$('#vehicle-speed-unit' ).text(return_data.coding.unit_speed.toUpperCase());
			$('#obc-speedavg-unit'  ).text(return_data.coding.unit_speed.toUpperCase());
			$('#obc-speedlimit-unit').text(return_data.coding.unit_speed.toUpperCase());

			if (return_data.coding.unit_speed == 'kmh') {
				$('#vehicle-speed' ).text(return_data.vehicle.speed_kmh);
				$('#obc-speedavg'  ).text(return_data.obc.speedavg_kmh);
				$('#obc-speedlimit').text(return_data.obc.speedlimit_kmh);
			}
			else if (return_data.coding.unit_speed == 'mph') {
				$('#vehicle-speed' ).text(return_data.vehicle.speed_mph);
				$('#obc-speedavg'  ).text(return_data.obc.speedavg_mph);
				$('#obc-speedlimit').text(return_data.obc.speedlimit_mph);
			}

			// Distance to arrival and range to empty
			$('#obc-distance-unit').text(return_data.coding.unit_distance);
			$('#obc-range-unit'   ).text(return_data.coding.unit_distance);

			if (return_data.coding.unit_distance == 'mi') {
				$('#obc-distance').text(return_data.obc.distance_mi);
				$('#obc-range').text(return_data.obc.range_mi);
			}

			else if (return_data.coding.unit_distance == 'km') {
				$('#obc-distance').text(return_data.obc.distance_km);
				$('#obc-range').text(return_data.obc.range_km);
			}

			// Fuel consumption
			$('#obc-consumption-1-unit').text(return_data.coding.unit_cons);
			$('#obc-consumption-2-unit').text(return_data.coding.unit_cons);

			if (return_data.coding.unit_cons == 'mpg') {
				$('#obc-consumption-1').text(return_data.obc.consumption_1_mpg);
				$('#obc-consumption-2').text(return_data.obc.consumption_2_mpg);
			}

			else if ( return_data.coding.unit_cons == 'l100') {
				$('#obc-consumption-1').text(return_data.obc.consumption_1_l100);
				$('#obc-consumption-2').text(return_data.obc.consumption_2_100);
			}

			// Stopwatch, timer, aux heat timers
			$('#obc-aux-heat-timer-1').text(return_data.obc.aux_heat_timer_1);
			$('#obc-aux-heat-timer-2').text(return_data.obc.aux_heat_timer_2);
			$('#obc-stopwatch'       ).text(return_data.obc.stopwatch);
			$('#obc-timer'           ).text(return_data.obc.timer);

			// Coding data
			$('#obc-coding-unit-cons'    ).text(return_data.coding.unit_cons    );
			$('#obc-coding-unit-distance').text(return_data.coding.unit_distance);
			$('#obc-coding-unit-speed'   ).text(return_data.coding.unit_speed   );
			$('#obc-coding-unit-temp'    ).text(return_data.coding.unit_temp    );
			$('#obc-coding-unit-time'    ).text(return_data.coding.unit_time    );
		}
	});
}

// Status page autorefresh disable
function status_refresh_off() {
	// CSS magic
	$('#icon-refresh').removeClass('fa-spin');
	$('#btn-refresh').removeClass('btn-danger').addClass('btn-success').text('Enable').attr('onclick', 'javascript:status_refresh_on();');

	// Clear the loop
	clearInterval(status_loop);
	clearInterval(status_refresh);
	clearInterval(gm_refresh);
}

// Status page autorefresh enable
var status_loop;
var status_refresh;
var gm_refresh;

function obc_refresh_exec() {
	// Data refresh from OBC/IKE
	$.ajax({
		url      : '/api/ike',
		type     : 'POST',
		dataType : 'json',
		data     : 'obc-get=all',
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

function gm_refresh_exec() {
	// Data refresh from GM
	$.ajax({
		url      : '/api/gm',
		type     : 'POST',
		dataType : 'json',
		data     : 'gm-command=gm-get',
		success  : function(return_data) {
			console.log(return_data);
		}
	});
}

function status_refresh_on() {
	// CSS magic
	$('#icon-refresh').addClass('fa-spin');
	$('#btn-refresh').addClass('btn-danger').removeClass('btn-success').text('Disable').attr('onclick', 'javascript:status_refresh_off();');

	// Refresh browser view
	status();

	// Pulse clamps 15, 30A, 30B, once
	$.ajax({
		url      : '/api/lcm',
		type     : 'POST',
		dataType : 'json',
		data     : 'clamp_15=on&clamp_30a=on&clamp_30b=on', 
		success  : function(return_data) {
			console.log(return_data);
		}
	});

	// Set the loops
	obc_refresh_exec();
	status_refresh = setInterval(function() {
		obc_refresh_exec();
	}, 500);

	gm_refresh = setInterval(function() {
		obc_refresh_exec();
	}, 600);

	// F**k .. need to get my websocket game up
	status_loop = setInterval(function() {
		// Refresh browser view
		status();
	}, 500);
}

// Convert a string to hex
function str2hex(str) {
	var hex = '';

	for(var i=0; i<str.length; i++) {
		hex += ''+str.charCodeAt(i).toString(16);
	}

	return hex;
}

// Live IBUS data websocket
function ws_ibus() {
	var loc = window.location, ws_uri;

	// Autodetect websocket URL
	if (loc.protocol === "https:") {
		ws_uri = "wss:";
	}
	else {
		ws_uri = "ws:";
	}

	ws_uri += "//" + loc.host + '/ws/ibus';
	console.log('WebSocket URI:', ws_uri);

	// Open WebSocket
	var socket = new WebSocket(ws_uri);

	// Assemble and send data from form below table
	$('#ws-ibus-send').click(function() {
		var data_send = {};
		// Parse incoming data
		data_send.src = parseInt($('#ws-ibus-src').val(), 16).toString(16);
		data_send.dst = parseInt($('#ws-ibus-dst').val(), 16).toString(16);

		// Create the message array by removing whitespaces and splitting by comma
		data_send.msg = $('#ws-ibus-msg').val().replace(' ', '').replace('0x', '').split(',');

		// Format the message
		var msg_array = [];
		for (var i = 0; i < data_send.msg.length; i++) {
			// Convert it to hexadecimal
			msg_array.push(parseInt(data_send.msg[i], 16));
		}
		data_send.msg = msg_array;

		data_send = JSON.stringify(data_send);

		console.log(data_send);
		socket.send(data_send);
	});

	socket.onopen = function() {
		$('#ws-ibus-header').removeClass('text-warning').removeClass('text-success').removeClass('text-danger').addClass('text-success').text('Live IBUS. Connected.');
	};

	socket.onmessage = function(message) {
		// Parse the incoming JSON.stringifyied data back into a real JSON blob
		var data = JSON.parse(message.data);

		// Parse out said blob
		var src = get_module_name(data.src);
		var len = data.len;
		var dst = get_module_name(data.dst);
		var msg = data.msg.data;

		var msg_fmt = '';

		// Format the message
		for (var i = 0; i < msg.length; i++) {
			// Convert it to hexadecimal
			msg_fmt += msg[i].toString(16).toUpperCase();

			// If we're not formatting the last entry in the array, add a space, too
			if (i != msg.length) {
				msg_fmt += ' ';
			}
		}

		// Add a new row to the table
		var ws_ibus_table = document.getElementById('ws-ibus-table');
		var timestamp     = moment().format('h:mm:ss a'); 

		var tr = '<tr><td>'+timestamp+'</td><td>'+src+'</td><td>'+dst+'</td><td>'+msg_fmt+'</td></tr>';

		$('#ws-ibus-table tbody').prepend(tr);
	};

	socket.onerror = function (error) {
		console.log('WebSocket error: ' + error);
		$('#ws-ibus-header').removeClass('text-warning').removeClass('text-success').addClass('text-danger').removeClass('text-success').text('Live IBUS. Error. =/');
	};
}
