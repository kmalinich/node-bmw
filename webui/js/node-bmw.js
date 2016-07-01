var _modules = {
	'ABG'                    : 0xA4,
	'Assist'                 : 0xCA,
	'BMBT'                   : 0xF0,
	'CCM'                    : 0x30,
	'CD changer DIN size'    : 0x76,
	'CDC'                    : 0x18,
	'CID'                    : 0x46,
	'DIA'                    : 0x3F,
	'DME'                    : 0x12,
	'DME'                    : 0xB8,
	'DSP'                    : 0x6A,
	'EWS'                    : 0x44,
	'GLO'                    : 0xBF,
	'GM'                     : 0x00,
	'GT'                     : 0x3B,
	'GTR'                    : 0x43,
	'HAC'                    : 0x9A,
	'IHKA'                   : 0x5B,
	'IKE'                    : 0x80,
	'IRIS'                   : 0xE0,
	'Key fob'                : 0x40,
	'LCM'                    : 0xD0,
	'LOC'                    : 0xFF,
	'MFL'                    : 0x50,
	'MID'                    : 0xC0,
	'Navigation (EUR)'       : 0x7F,
	'Navigation (JP)'        : 0xBB,
	'OBC'                    : 0xE7,
	'PDC'                    : 0x60,
	'Power mirror 1'         : 0x51,
	'Power mirror 2'         : 0x9B,
	'Power mirror 3'         : 0x9C,
	'RAD'                    : 0x68,
	'RLS'                    : 0xE8,
	'Radio controlled clock' : 0x28,
	'Rear Multinfo display'  : 0xA0,
	'SES'                    : 0xB0,
	'SM'                     : 0x08,
	'Seat 1'                 : 0x72,
	'Seat 2'                 : 0xDA,
	'Seats'                  : 0xED,
	'Sirius radio'           : 0x73,
	'TEL'                    : 0xC8,
};

function get_module_name(key) {
	var hkey = parseInt(key, 16);

	for (var dkey in _modules) {
		if (_modules[dkey] === hkey) {
			return dkey;
		}
	}

	return 'Unknown Device' + ' - ' + key;
};

// Remove all color-coded CSS classes from a text id
function clean_class(id) {
	$(id).removeClass('text-danger').removeClass('text-success').removeClass('text-warning').removeClass('text-primary').removeClass('text-info').text('');
}

// Clean all the text strings
function clean_class_all() {
	// This is really dumb and there is a better way
	clean_class('#engine-running');
	clean_class('#engine-speed');
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
	//clean_class('');
}

// Status page autorefresh enable
var status_loop;
var status_refresh;

function status_refresh_on() {
	// CSS magic
	$('#icon-refresh').addClass('fa-spin');
	$('#btn-refresh').addClass('btn-danger').removeClass('btn-success').text('Disable').attr('onclick', 'javascript:status_refresh_off();');

	// Pulse clamps 15, 30A, 30B
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
	status_refresh = setInterval(function() {
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
	}, 3000);

	status_loop = setInterval(function() {
		// Refresh browser view
		status();
	}, 2000);

}

// Status page autorefresh disable
function status_refresh_off() {
	// CSS magic
	$('#icon-refresh').removeClass('fa-spin');
	$('#btn-refresh').removeClass('btn-danger').addClass('btn-success').text('Enable').attr('onclick', 'javascript:status_refresh_on();');

	// Clear the loop
	clearInterval(status_loop);
	clearInterval(status_refresh);
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
			$('#temperature-coolant-unit').text(return_data.coding.unit_temp);
			$('#obc-temp-exterior-unit'  ).text(return_data.coding.unit_temp);

			if (return_data.coding.unit_temp == 'c') { 
				// Coolant temperature
				$('#temperature-coolant').text(return_data.temperature.coolant_c);
				// Exterior temperature
				$('#obc-temp-exterior').text(return_data.obc.temp_exterior_c);
			}
			else if (return_data.coding.unit_temp == 'f') {
				$('#temperature-coolant').text(return_data.temperature.coolant_f);
				$('#obc-temp-exterior'  ).text(return_data.obc.temp_exterior_f);
			}

			//$('#temperature-exterior-c').text(return_data.temperature.exterior_c);
			//$('#temperature-exterior-f').text(return_data.temperature.exterior_f);

			/*
			 * Vehicle sensors
			 */

			// Handbrake
			if (return_data.vehicle.handbrake) {
				$('#vehicle-handbrake').text('Handbrake on').addClass('text-success');
			}
			else {
				$('#vehicle-handbrake').text('Handbrake off').addClass('text-danger');
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

			// Current, average, and limit speed
			$('#vehicle-speed-unit' ).text(return_data.coding.unit_speed);
			$('#obc-speedavg-unit'  ).text(return_data.coding.unit_speed);
			$('#obc-speedlimit-unit').text(return_data.coding.unit_speed);

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
			$('#obc-coding-unit-cons'     ).text(return_data.coding.unit_cons     );
			$('#obc-coding-unit-distance' ).text(return_data.coding.unit_distance );
			$('#obc-coding-unit-speed'    ).text(return_data.coding.unit_speed    );
			$('#obc-coding-unit-temp'     ).text(return_data.coding.unit_temp     );
			$('#obc-coding-unit-time'     ).text(return_data.coding.unit_time     );
		}
	});
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

// Initialize IKE backlight slider
function ike_backlight_prepare() {
	$('#slider-ike-backlight').slider()

	$('#slider-ike-backlight').on('slideStop', function(data) {
		ike_backlight(data.value);
	});
}

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

function ws_ibus() {
	var loc = window.location, ws_uri;

	// Autodetect websocket URL
	if (loc.protocol === "https:") {
		ws_uri = "wss:";
	} else {
		ws_uri = "ws:";
	}

	ws_uri += "//" + loc.host + '/ws/ibus';
	console.log('WebSocket URI:', ws_uri);

	// Open WebSocket
	var socket  = new WebSocket(ws_uri);

	// Assemble and send data from form below table
	$('#ws-ibus-send').click(function() {
		var data_send = {};
		data_send.src = $('#ws-ibus-src').val();
		data_send.dst = $('#ws-ibus-dst').val();
		data_send.msg = $('#ws-ibus-msg').val();
		data_send = JSON.stringify(data_send);
		console.log(data_send);
		socket.send(data_send);
	});

	socket.onopen = function() {
		// socket.send('hello from the client');
		$('#ws-ibus-header').removeClass('text-warning').removeClass('text-success').removeClass('text-danger').addClass('text-success').text('Live IBUS. Connected.');
	};

	socket.onmessage = function(message) {
		// If anybody sees this .. it's rudimentary for now

		// Parse the incoming JSON.stringifyied data back into a real JSON blob
		var data = JSON.parse(message.data);

		// Parse out said blob
		var src = data.src.toUpperCase()+' ('+get_module_name(data.src)+')';
		var len = data.len;
		var dst = data.dst.toUpperCase()+' ('+get_module_name(data.dst)+')';
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
