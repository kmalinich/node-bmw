// Pad string for IKE text screen length (20 characters)
String.prototype.mid_pad = function() {
  var string = this;

  while (string.length < 20) {
    string = string + ' ';
  }

  return string;
}

var MID = function() {
	// Exposed data
  this.text                 = text;
	this.status_loop          = status_loop;
	this.parse_in             = parse_in;
	this.parse_out            = parse_out;
	this.power_on_if_ready    = power_on_if_ready;
	this.request_rad_status   = request_rad_status;
	this.send_button          = send_button;
	this.send_cassette_status = send_cassette_status;
	this.send_device_status   = send_device_status;

	// Interval var
	var interval_status_loop;

  // ASCII to hex for MID message
  function ascii2hex(str) {
    var array = [];
    for (var n = 0, l = str.length; n < l; n ++) {
      var hex = str.charCodeAt(n);
      array.push(hex);
    }
    return array;
  }

  // Top screen - First 11 characters
  // 68 C0 23 00 20 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F CK
  // Top screen - Right half
  // 80 C0 23 00 20 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F 2F CK
  // Menu - First 3 boxes
  // 68 C0 21 00 15 20 2F 2F 2F 2F 05 2F 2F 2F 2F 05 2F 2F 2F 2F 05 2F 2F 2F 2F 05 2F 2F 2F 2F 05 2F 2F 2F 2F CK
  // Menu - Last 3 boxes
  // 68 C0 21 00 15 06 2F 2F 2F 2F 05 2F 2F 2F 2F 05 2F 2F 2F 2F 05 2F 2F 2F 2F 05 2F 2F 2F 2F 05 2F 2F 2F 2F CK

  function text(message) {
    console.log('[node::MID] Sending text to MID screen: \'%s\'', message);
    message = message.mid_pad();

    // Need to center text..
    var message_hex = [0x23, 0x00, 0x20];
    var message_hex = message_hex.concat(ascii2hex(message));
    // var message_hex = message_hex.concat(0x04);

    omnibus.ibus.interface.send({
      src: 'IKE',
      dst: 'MID',
      msg: message_hex,
    });
  }

  // Set or unset the status interval
  function status_loop(action) {
    if (config.emulate.mid === true) {
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
				src : 'MID',
				msg : 'Ping interval '+action,
			});
		}
	}

	// Send MID status, and request status from RAD
	function refresh_status() {
		if (status.vehicle.ignition_level > 0) {
			request_rad_status();
			log.msg({
				src : 'MID',
				msg : 'Ping',
			});
		}
		else {
			status_loop('unset');
		}
	}

	// Send the power on button command if needed/ready
	function power_on_if_ready() {
		// Debug logging
		console.log('[node:MID] MID.power_on_if_ready(): evaluating');
		console.log('[node:MID] MID.power_on_if_ready(): ignition_level    : \'%s\'', status.vehicle.ignition_level);
		console.log('[node:MID] MID.power_on_if_ready(): dsp.ready         : \'%s\'', status.dsp.ready);
		console.log('[node:MID] MID.power_on_if_ready(): rad.audio_control : \'%s\'', status.rad.audio_control);
		console.log('[node:MID] MID.power_on_if_ready(): rad.ready         : \'%s\'', status.rad.ready);

		if (status.rad.audio_control == 'audio off') {
			console.log('[node:MID] MID.power_on_if_ready(): Sending power!');
			send_button('power');
		}
	}

	// Parse data sent to MID module
	function parse_in(data) {
		// Init variables
		switch (data.msg[0]) {
			case 0x01: // Request: device status
				data.command = 'req';
				data.value = 'device status';

				// Send the ready packet since this module doesn't actually exist
				send_device_status();
				break;

			case 0x02: // Device status
				data.command = 'bro';
				data.value   = 'device status ';
				switch (data.msg[1]) {
					case 0x00:
						data.value = data.value+'ready';
						break;
					case 0x01:
						data.value = data.value+'ready after reset';
						break;
				}
				break;

			case 0x4A: // Cassette control
				data.command = 'con';
				data.value = 'cassette ';
				data.value = data.value+data.msg[1];

				send_cassette_status();
				break;

			default:
				data.command = 'unk';
				data.value = Buffer.from(data.msg);
				break;
		}

		log.out(data);
	}

	// Parse data sent from MID module
	function parse_out(data) {
		// Init variables
		var command;
		var value;

		switch (data.msg[0]) {
			case 0x01: // Request: device status
				data.command = 'req';
				data.value = 'device status';
				omnibus.MID.text('hey! hello! holy shit it works!');
				break;

			case 0x02: // Device status
				data.command = 'bro';
				data.value = 'device status ';
				switch (data.msg[1]) {
					case 0x00:
						data.value = data.value+'ready';
						break;
					case 0x01:
						data.value = data.value+'ready after reset';
						break;
				}
				status.mid.ready = true;
				break;

			case 0x10: // Request: ignition status
				data.command = 'req';
				data.value = 'ignition status';
				break;

			case 0x20: // Broadcast: display status
				data.command = 'bro';
				data.value = 'display status';
				break;

			case 0x31: // Broadcast: button pressed
				data.command = 'bro';
				data.value   = 'button pressed';

				// 31 00 00 01,MID,RAD,Button Button_1_pressed
				// 31 00 00 03,MID,RAD,Button Button_3_pressed
				// 31 00 00 03,MID,RAD,Button TP_MUTE_pressed
				// 31 00 00 04,MID,RAD,Button Button_4_pressed
				// 31 00 00 04,MID,RAD,Button VOLUME_+_pressed
				// 31 00 00 05,MID,RAD,Button Button_5_pressed
				// 31 00 00 06,MID,RAD,Button Button_6_pressed
				// 31 00 00 06,MID,RAD,Button SEEK_<_pressed
				// 31 00 00 07,MID,RAD,Button SEEK_>_pressed
				// 31 00 00 08,MID,RAD,Button CC/CD_pressed
				// 31 00 00 09,MID,RAD,Button FM_pressed
				// 31 00 00 0A,MID,RAD,Button Button_A_pressed
				// 31 00 00 0B,MID,RAD,Button Button_B_pressed
				// 31 00 00 0B,MID,RAD,Button TONE_pressed
				// 31 00 00 0C,MID,RAD,Button MAN_pressed
				// 31 00 00 0D,MID,RAD,Button Button_D_pressed
				// 31 00 00 0D,MID,RAD,Button MEM_pressed
				// 31 00 00 0E,MID,RAD,Button SC/RP_pressed
				// 31 00 00 23,MID,RAD,Button Button_3_pressed_long
				// 31 00 00 25,MID,RAD,Button Button_5_pressed_long
				// 31 00 00 2B,MID,RAD,Button Button_B_pressed_long
				// 31 00 00 2D,MID,RAD,Button Button_D_pressed_long
				// 31 00 00 41,MID,RAD,Button Button_1_released
				// 31 00 00 43,MID,RAD,Button Button_3_released
				// 31 00 00 43,MID,RAD,Button TP_MUTE_released
				// 31 00 00 44,MID,RAD,Button Button_4_released
				// 31 00 00 44,MID,RAD,Button VOLUME_+_released
				// 31 00 00 45,MID,RAD,Button Button_5_released
				// 31 00 00 46,MID,RAD,Button Button_6_released
				// 31 00 00 46,MID,RAD,Button SEEK_<_released
				// 31 00 00 47,MID,RAD,Button SEEK_>_released
				// 31 00 00 48,MID,RAD,Button CC/CD_released
				// 31 00 00 49,MID,RAD,Button FM_released
				// 31 00 00 4A,MID,RAD,Button Button_A_released
				// 31 00 00 4B,MID,RAD,Button Button_B_released
				// 31 00 00 4B,MID,RAD,Button TONE_released
				// 31 00 00 4C,MID,RAD,Button MAN_released
				// 31 00 00 4D,MID,RAD,Button Button_D_released
				// 31 00 00 4D,MID,RAD,Button MEM_released
				// 31 00 00 4E,MID,RAD,Button SC/RP_released
				// 31 00 10 06,MID,RAD,Button Button_6_pressed
				// 31 00 10 0B,MID,RAD,Button Button_B_pressed
				// 31 00 10 46,MID,RAD,Button Button_6_released
				// 31 00 10 4B,MID,RAD,Button Button_B_released
				// 31 00 15 07,MID,RAD,Button Button_7_pressed
				// 31 00 15 0B,MID,RAD,Button Button_B_pressed
				// 31 00 15 47,MID,RAD,Button Button_7_released
				// 31 00 15 4B,MID,RAD,Button Button_B_released
				// 31 00 21 06,MID,RAD,Button Button_6_pressed
				// 31 00 21 46,MID,RAD,Button Button_6_released
				// 31 00 33 04,MID,RAD,Button Button_4_pressed
				// 31 00 33 06,MID,RAD,Button Button_6_pressed
				// 31 00 33 09,MID,RAD,Button Button_9_pressed
				// 31 00 33 0A,MID,RAD,Button Button_A_pressed
				// 31 00 33 0B,MID,RAD,Button Button_B_pressed
				// 31 00 33 44,MID,RAD,Button Button_4_released
				// 31 00 33 46,MID,RAD,Button Button_6_released
				// 31 00 33 49,MID,RAD,Button Button_9_released
				// 31 00 33 4A,MID,RAD,Button Button_A_released
				// 31 00 33 4B,MID,RAD,Button Button_B_released
				// 31 00 34 02,MID,RAD,Button Button_2_pressed
				// 31 00 34 04,MID,RAD,Button Button_4_pressed
				// 31 00 34 08,MID,RAD,Button Button_8_pressed
				// 31 00 34 0B,MID,RAD,Button Button_B_pressed
				// 31 00 34 2B,MID,RAD,Button Button_B_pressed_long
				// 31 00 34 42,MID,RAD,Button Button_2_released
				// 31 00 34 44,MID,RAD,Button Button_4_released
				// 31 00 34 48,MID,RAD,Button Button_8_released
				// 31 00 34 4B,MID,RAD,Button Button_B_released
				// 31 00 35 03,MID,RAD,Button Button_3_pressed
				// 31 00 35 43,MID,RAD,Button Button_3_released
				// 31 00 46 06,MID,RAD,Button Button_6_pressed
				// 31 00 46 46,MID,RAD,Button Button_6_released
				// 31 01 20 00,MID,IKE,Button Button_0_pressed
				// 31 01 20 40,MID,IKE,Button Button_0_released
				break;

			case 0x32: // Broadcast: volume control
				data.command = 'bro';
				data.value = 'volume control';
				// data.msg[1] -
				// -1 : 10
				// -2 : 20
				// -3 : 30
				// -4 : 40
				// -5 : 50
				// +1 : 11
				// +2 : 21
				// +3 : 31
				// +4 : 41
				// +5 : 51
				break;

			case 0x4B: // Cassette status
				data.command = 'bro';
				data.value = 'cassette status no tape';
				break;

			case 0x47: // Broadcast: BM status
				data.command = 'bro';
				data.value = 'BM status';
				break;

			case 0x48: // Broadcast: BM button
				data.command = 'bro';
				data.value = 'BM button';
				break;

			case 0x5D: // Request: light dimmer status
				data.command = 'req';
				data.value = 'light dimmer status';
				break;

			case 0x79: // Request: door/flap status
				data.command = 'req';
				data.value = 'door/flap status';
				break;

			default:
				data.command = 'unk';
				data.value = Buffer.from(data.msg);
				break;
		}

		log.out(data);
	}

	// Request status from RAD module
	function request_rad_status() {
		omnibus.ibus.interface.send({
			src: 'MID',
			dst: 'RAD',
			msg: [0x01],
		});
	}

	// Send ready or ready after reset
	function send_device_status() {
		// Init variables
		var msg;

		// Handle 'ready' vs. 'ready after reset'
		if (status.mid.reset === true) {
			status.mid.reset = false;
			msg = [0x02, 0x01];
		}
		else {
			msg = [0x02, 0x00];
		}

		omnibus.ibus.interface.send({
			src: 'MID',
			dst: 'GLO',
			msg: msg,
		});
	}

	// Say we have no tape in the player
	function send_cassette_status() {
		omnibus.ibus.interface.send({
			src: 'MID',
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
				button_up = bitmask.bit_set(button_down, bitmask.bit[7]);
				break;
		}

		console.log('[MID::RAD] Sending button down: %s', button);

		// Init variables
		var command = 0x48; // Button action
		var packet_down = [command, button_down];
		var packet_up = [command, button_up];

		omnibus.ibus.interface.send({
			src: 'MID',
			dst: 'RAD',
			msg: packet_down,
		});

		// Prepare and send the up message after 150ms
		setTimeout(() => {
			console.log('[MID::RAD] Sending button up: %s', button);
			omnibus.ibus.interface.send({
				src: 'MID',
				dst: 'RAD',
				msg: packet_up,
			});
		}, 150);
	}
}

module.exports = MID;
