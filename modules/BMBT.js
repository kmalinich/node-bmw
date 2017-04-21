var module_name = 'bmbt';

// Interval var
var interval_status_loop;

// Set or unset the status interval
function status_loop(action) {
	if (config.emulate.bmbt === true) {
		switch (action) {
			case 'set':
				refresh_status();
				interval_status_loop = setInterval(() => {
					refresh_status();
				}, 25000);
				break;

			case 'unset':
				clearInterval(interval_status_loop, () => {
				});
				break;
		}

		log.msg({
			src : 'BMBT',
			msg : 'Ping interval '+action,
		});
	}
}

// Send BMBT status, and request status from RAD
function refresh_status() {
	if (status.vehicle.ignition_level > 0) {
		bus_commands.request_device_status(module_name, 'RAD');
		return;
	}

	status_loop('unset');
}

// Send the power on button command if needed/ready
function power_on_if_ready() {
	// Debug logging
	// console.log('[node:BMBT] BMBT.power_on_if_ready(): evaluating');
	// console.log('[node:BMBT] BMBT.power_on_if_ready(): ignition_level    : \'%s\'', status.vehicle.ignition_level);
	// console.log('[node:BMBT] BMBT.power_on_if_ready(): dsp.ready         : \'%s\'', status.dsp.ready);
	// console.log('[node:BMBT] BMBT.power_on_if_ready(): rad.audio_control : \'%s\'', status.rad.audio_control);
	// console.log('[node:BMBT] BMBT.power_on_if_ready(): rad.ready         : \'%s\'', status.rad.ready);

	if (status.rad.audio_control == 'audio off' && status.dsp.ready === true) {
		console.log('[node:BMBT] BMBT.power_on_if_ready(): Sending power!');
		send_button('power');
	}
}

// Parse data sent to BMBT module
function parse_in(data) {
	// Init variables
	switch (data.msg[0]) {
		case 0x01: // Request: device status
			data.command = 'req';
			data.value   = 'device status';

			// Send the ready packet since this module doesn't actually exist
			if (config.emulate.bmbt === true) {
				bus_commands.send_device_status(module_name);
			}
			break;

		case 0x4A: // Cassette control
			data.command = 'con';
			data.value   = 'cassette ';
			data.value   = data.value+data.msg[1];

			send_cassette_status();
			break;

		default:
			data.command = 'unk';
			data.value   = Buffer.from(data.msg);
			break;
	}

	log.out(data);
}

// Parse data sent from BMBT module
function parse_out(data) {
	switch (data.msg[0]) {
		case 0x32: // Broadcast: volume control
			data.command = 'bro';
			data.value   = 'volume control';
			break;

		case 0x4B: // Cassette status
			data.command = 'bro';
			data.value   = 'cassette status no tape';
			break;

		case 0x47: // Broadcast: BM status
			data.command = 'bro';
			data.value   = 'BM status';
			break;

		case 0x48: // Broadcast: BM button
			data.command = 'bro';
			data.value   = 'BM button';
			break;

		default:
			data.command = 'unk';
			data.value   = Buffer.from(data.msg);
			break;
	}

	log.out(data);
}

// Say we have no tape in the player
function send_cassette_status() {
	omnibus.data_send.send({
		src: 'BMBT',
		dst: 'RAD',
		msg: [0x4B, 0x05],
	});
}

// Emulate button presses
function send_button(button) {
	var button_down = 0x00;
	var button_hold;
	var button_up;

	// Switch statement to determine button, then encode bitmask
	switch (button) {
		case 'power':
			// Get down value of button
			button_down = bitmask.bit_set(button_down, bitmask.bit[1]);
			button_down = bitmask.bit_set(button_down, bitmask.bit[2]);

			// Generate hold and up values
			button_hold = bitmask.bit_set(button_down, bitmask.bit[6]);
			button_up   = bitmask.bit_set(button_down, bitmask.bit[7]);
			break;
	}

	console.log('[BMBT::RAD] Sending button down: %s', button);

	// Init variables
	var command     = 0x48; // Button action
	var packet_down = [command, button_down];
	var packet_up   = [command, button_up];

	omnibus.data_send.send({
		src: 'BMBT',
		dst: 'RAD',
		msg: packet_down,
	});

	// Prepare and send the up message after 150ms
	setTimeout(() => {
		console.log('[BMBT::RAD] Sending button up: %s', button);
		omnibus.data_send.send({
			src: 'BMBT',
			dst: 'RAD',
			msg: packet_up,
		});
	}, 150);
}


module.exports = {
	parse_in             : (data)        => { parse_in(data); },
	parse_out            : (data)        => { parse_out(data); },
	power_on_if_ready    : ()            => { power_on_if_ready(); },
	send_button          : (button)      => { send_button(button); },
	send_cassette_status : ()            => { send_cassette_status(); },
	send_device_status   : (module_name) => { bus_commands.send_device_status(module_name); },
	status_loop          : (action)      => { status_loop(action); },
}
