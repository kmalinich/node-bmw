#!/usr/bin/env node

// Libraries
var ibus_interface = require('./ibus-interface.js');
var ibus_modules   = require('./ibus-modules.js');

// Serial device path
var device = '/dev/tty.SLAB_USBtoUART';

// IBUS connection handle
var ibus_connection = new ibus_interface(device);

// Run shutdown() on SIGINT
process.on('SIGINT', shutdown);

// Run check_data() on data events
ibus_connection.on('data', check_data);

// Startup function
function startup() {
  // Open serial port
  ibus_connection.startup();

  // Turn phone LED green
  rad_led('green', 'flash');

  // Send welcome message to cluster
  ike_text('    kdm e39 540i    ');
}

// Shutdown function
function shutdown() {
  // Turn phone LED off
  rad_led('red', 'solid');

  // Send goodbye message to cluster
  ike_text('      bye kdm!      ');

  // Terminate connection
  setTimeout(function() {
    ibus_connection.shutdown(function() {
      process.exit();
    });
  }, 1000);
}

// ASCII to hex for cluster message
function ascii2hex(str) { 
  var array = [];

  for (var n = 0, l = str.length; n < l; n ++) {
    var hex = str.charCodeAt(n);
    array.push(hex);
  }

  return array;
}

// Send IBUS message
function ibus_send(ibus_packet) {
  ibus_connection.send_message(ibus_packet);
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
  // var msg = new Buffer([0x0c, 1, 0]); // Unlock doors (no toggle) 
  // var msg = new Buffer([0x0c, 5, 0]); // Driver seat forward
  // var msg = new Buffer([0x0c, 0, 91]); // Interior light, hazard button
  // var msg = new Buffer([0x0c, 0, 92]); // toggle locks ??
  // var msg = new Buffer([0x0c, 0, 101]); // front windows fully down
  // var msg = new Buffer([0x0c, 0, 102]); // Sunroof open
  // var msg = new Buffer([0x0c, 0, 174]); // Red nose flash for 3 sec
  // var msg = new Buffer([0x0c, 0, 177]); // wheel up, down
  // var msg = new Buffer([0x0c, 0, ]); // 
  // var msg = new Buffer([0x0c, 0, ]); // 
  // var msg = new Buffer([0x0c, 0, ]); // 
  // var msg = new Buffer([0x0c, 0, ]); // 
  // var msg = new Buffer([0x0c, 0, ]); // 
  // var msg = new Buffer([0x0c, 0, ]); // 
  // var msg = new Buffer([0x0c, 0, ]); // 

  if (group == 1) {
    var msg = new Buffer([0x0c, 5, 5]); // Drivers seat tilt (not sure which way) 
  }
  // else if (group == 2) {
  //   var msg = new Buffer([0x0c, 1, 0]); // 
  // }
  // else if (group == 3) {
  //   var msg = new Buffer([0x0c, 32, 0]); // 
  // }
  // else if (group == 4) {
  //   var msg = new Buffer([0x0c, 64, 0]); // 
  // }
  // else if (group == 5) {
  //   var msg = new Buffer([0x0c, 128, 0]); // Driver seat forward
  // }
  // else if (group == 6) {
  //   var msg = new Buffer([0x0c, 255, 0]); // 
  // }
  // else if (group == 7) {
  //   var msg = new Buffer([0x0c, 13, 0]); // 
  // }
  // else if (group == 8) {
  //   var msg = new Buffer([0x0c, 14, 0]); // 
  // }
  // else if (group == 9) {
  //   var msg = new Buffer([0x0c, 15, 0]); // 
  // }
  // else if (group == 10) {
  //   var msg = new Buffer([0x0c, 16, 0]); // 
  // }
  // else if (group == 11) {
  //   var msg = new Buffer([0x0c, 17, 0]); // 
  // }
  // else if (group == 12) {
  //   var msg = new Buffer([0x0c, 18, 0]); // 
  // }
  //

  else {
    count++;
    console.log('count: '+count);
    var msg = new Buffer([0x0c, 0, count]);
  }


  var open_fl  = new Buffer([0x0c, 0x52, 0x01]);
  var open_fr  = new Buffer([0x0c, 0x41, 0x01]);
  var open_rr  = new Buffer([0x0c, 0x00, 0x46]);

  var interior_lights_off      = new Buffer([0x7a, 0x10, 0x01]); // Unlocked+WndwFL
  var interior_lights_off      = new Buffer([0x7a, 0x10, 0x02]); // Unlocked+WndwFR
  var interior_lights_off      = new Buffer([0x7a, 0x10, 0x04]); // Unlocked+WndwRL
  var interior_lights_off      = new Buffer([0x7a, 0x10, 0x08]); // Unlocked+WndwRR

  var ibus_packet = {
    src: src, 
    dst: dst,
    msg: msg,
  }
  ibus_send(ibus_packet);
}

function windows_up() {
  var src = 0x3f; // DIS
  var dst = 0x00; // GM

  var msg = new Buffer([0x0c, 0x01, 0x00]);
  var close_fr = new Buffer([0x0c, 0x42, 0x01]);
  var close_rl = new Buffer([0x0c, 0x00, 0x01]);
  var close_rr = new Buffer([0x0c, 0x00, 0x46]);

  var interior_lights_off      = new Buffer([0x7a, 0x10, 0x01]); // Unlocked+WndwFL
  var interior_lights_off      = new Buffer([0x7a, 0x10, 0x02]); // Unlocked+WndwFR
  var interior_lights_off      = new Buffer([0x7a, 0x10, 0x04]); // Unlocked+WndwRL
  var interior_lights_off      = new Buffer([0x7a, 0x10, 0x08]); // Unlocked+WndwRR

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

  var src = 0x3f; // DIS
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

// Flash lights indefstartupely
function lcm_flash(beam) {
  var src = 0x00; // All
  var dst = 0xbf; // LCM

  // Bit 1 = hazard light
  // Bit 2 = low beam
  // Bit 3 = fade
  // Bit 4 = high beam
  // The bits may be combined
  // eg low beam and hazard lights =
  // 0 0 0 0 0 1 1 0 = 06 (hex)
  // 7 6 5 4 3 2 1 0

  var lcm_flash_hz_ike = new Buffer([0x76, 0x01]);
  var lights           = 'hazards in cluster';
  var lcm_flash_hz     = new Buffer([0x76, 0x02]);
  var lights           = 'hazards';
  var lcm_flash_hzlb   = new Buffer([0x76, 0x0a]);
  var lights           = 'hazards and low beams';
  var lcm_flash_off    = new Buffer([0x76, 0x00]);
  var lights           = 'none';

  console.log('Flashing lights:', lights);

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

// RAD phone LED control
function rad_led(color, flash) {
  var src = 0xc8; // TEL
  var dst = 0xe7; // OBC

  // Green  (left)   : 1
  // Yellow (middle) : 2
  // Red    (right)  : 3

  // Yellow solid: 1
  // Red    solid: 4
  // Green  solid: 16
  // Yellow flash: 2
  // Red    flash: 8
  // Green  flash: 32

  var led_s1     = new Buffer([0x2b, 0x10]);
  var led_s2     = new Buffer([0x2b, 0x01]);
  var led_s3     = new Buffer([0x2b, 0x04]);
  var led_s1s2   = new Buffer([0x2b, 0x11]);
  var led_s1s3   = new Buffer([0x2b, 0x14]);
  var led_s2s3   = new Buffer([0x2b, 0x05]);
  var led_s1s2s3 = new Buffer([0x2b, 0x15]);

  var led_f1     = new Buffer([0x2b, 0x20]);
  var led_f2     = new Buffer([0x2b, 0x02]);
  var led_f3     = new Buffer([0x2b, 0x08]);
  var led_f1f2   = new Buffer([0x2b, 0x0a]);
  var led_f1f3   = new Buffer([0x2b, 0x22]);
  var led_f2f3   = new Buffer([0x2b, 0x28]);
  var led_f1f2f3 = new Buffer([0x2b, 0x2a]);

  var led_f1s2   = new Buffer([0x2b, 0x21]);
  var led_f2s3   = new Buffer([0x2b, 0x06]);
  var led_s1f2   = new Buffer([0x2b, 0x12]);
  var led_s1f2s3 = new Buffer([0x2b, 0x16]);
  var led_s1f3   = new Buffer([0x2b, 0x18]);
  var led_s1s2f3 = new Buffer([0x2b, 0x19]);
  var led_s2f3   = new Buffer([0x2b, 0x09]);

  var led_off    = new Buffer([0x2b, 0x00]);

  if (color == 'green') {
    if (flash == 'solid') {
      var msg = led_s1;
    }
    else if (flash == 'flash') {
      var msg = led_f1;
    }
  }
  else if (color == 'yellow') {
    if (flash == 'solid') {
      var msg = led_s2;
    }
    else if (flash == 'flash') {
      var msg = led_f2;
    }
  }
  else if (color == 'red') {
    if (flash == 'solid') {
      var msg = led_s3;
    }
    else if (flash == 'flash') {
      var msg = led_f3; 
    }
  }
  else if (color == 'off') {
    var msg = led_off; 
  }

  var ibus_packet = {
    src: src, // TEL
    dst: dst, // OBC
    msg: msg,
  }

  ibus_send(ibus_packet);
}

// LCM lights control
function lights(beam) {

  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x06 - Right fog, sidemarker, rear turn 
  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x0c - Right tail, cluster 

  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x06 - stop light above
  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x06 - stop light left (+A)
  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x06 - stop light right (+A)

  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x06 - left lowbeam, rear fog 
  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x06 - right lowbeam, rear turn 

  // 0x0c, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x06 - headlight low beam + with ignition high beam (IKE+LCM)

  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x06 - RL turn signal
  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, 0x06 - RR turn signal
  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x06 - FL turn signal
  // 0x0c, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x06 - FR turn signal

  // 0x0c, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x06 - L side marker
  // 0x0c, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x06 - R side marker
  // var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]; // Cluster illumination

  // Left IKE turn, IKE high beams, IKE fogs, low beams, cluster
  // var buffer_data = [0x0c, 0x08, 0x0c];
  // Left IKE turn, cluster, low beams
  // var buffer_data = [0x0c, 0x08, 0x06];
  // Left IKE turn, low beams, rear fogs
  // var buffer_data = [0x0c, 0x08, 0x00];
  // Left IKE turn, IKE high beams, IKE front fogs
  // var buffer_data = [0x0c, 0x07, 0x00];
  // Right IKE turn, IKE high beams, IKE rear fogs
  // var buffer_data = [0x0c, 0x07];

  // Bit 1 = hazards
  // Bit 2 = low beam
  // Bit 3 = fade
  // Hazards = 1
  // Low beam = 2
  // Fade = 3
  // High beam = 
  // cluster = 
  // right sidemarker
  // left sidemarker
  // FR turn
  // FL turn
  // RL turn
  // L tail
  // R tail
  // R reverse
  // L reverse
  // L license
  // R license
  // L lowbeam
  // R lowbeam
  // L highbeam
  // R highbeam
  // L fog
  // R fog
  // L parking
  // R parking

  // RR turn, R sidemarker
  var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02];
  // Cluster
  var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04];
  // RR turn, R tail, R sidemarker
  var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0a];

  // 2 = rear fog
  // 4 = license place
  // Cluster
  // var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01];

  // Rear fog
  var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00];
  // License place + cluster 
  var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00];

  // 1, 2, 4, 8, 16, 32, 64, 128, 256

  // 0x02  2 = L tail
  // 0x04  4 = L fog 
  // 0x08  8 = L reverse
  // 0x10 16 = L lowbeam 
  // 0x20 32 = R lowbeam
  // 0x40 64 = R fog 



  // L reverse
  var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00];
  // L lowbeam
  var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00];
  // R lowbeam
  var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00];
  // R fog
  var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00];
  // Both lowbeams + both fogs 
  var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x74, 0x00, 0x00];


  var foglights  = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x06];
  var fl_fog     = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x06]; // with right rear turn signal
  var backlight  = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x06];
  var rearfog    = [0x0c, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06];

  if (beam == "fl_lowbeam") {
    console.log("Front left lowbeam");
    var buffer_data = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x06];
  } else if (beam == "fr_lowbeam") {
    console.log("Front right lowbeam");
    var buffer_data = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x06];
  } else if (beam == "l_sidemarker") {
    console.log("Left sidemarker");
    var buffer_data = [0x0c, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x06];
  } else if (beam == "r_sidemarker") {
    console.log("Right sidemarker");
    var buffer_data = [0x0c, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x06];
  } else if (beam == "l_taillight") {
    console.log("Left taillight");
    var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00];
  } else if (beam == "r_taillight") {
    console.log("Right taillight");
    var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08];
  } else if (beam == "front") {
    console.log("Front fogs and front lowbeams");
    var buffer_data   = [0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x74, 0x00, 0x00];
  }


  // L tail
  // R tail, cluster	

  var data_packet = {
    src: 0x3f, // DIA
    dst: 0xbf, // GLO 
    msg: new Buffer(buffer_data)
  }

  ibus_send(data_packet);
}

// Data handler
function check_data(packet) {
  var dst = ibus_modules.get_module_name(packet.dst);
  var src = ibus_modules.get_module_name(packet.src);
  var msg = packet.msg;

  // RAD
  if (src == 'RAD') {
    if (msg.compare(rad_phone_down) == 0) {
      var command = 'depressed';
      var data    = 'phone';
    }
    else if (msg.compare(rad_power_down) == 0) {
      var command = 'depressed';
      var data    = 'power';
    }
    else if (msg.compare(rad_power_up) == 0) {
      var command = 'released';
      var data    = 'power';
    }
    else if (msg.compare(rad_1_down) == 0) {
      var command = 'depressed';
      var data    = '1';
    }
    else if (msg.compare(rad_2_down) == 0) {
      var command = 'depressed';
      var data    = '2';
    }
    else if (msg.compare(rad_3_down) == 0) {
      var command = 'depressed';
      var data    = '3';
    }
    else if (msg.compare(rad_4_down) == 0) {
      var command = 'depressed';
      var data    = '4';
    }
    else if (msg.compare(rad_5_down) == 0) {
      var command = 'depressed';
      var data    = '5';
    }
    else if (msg.compare(rad_6_down) == 0) {
      var command = 'depressed';
      var data    = '6';
    }
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
        ike_text('coolant: '+coolant_temp_c+'C        ');
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

  // BMBT
  if (src == 'BMBT') {
    if (msg[0] == 0x48) {
      var command = 'button';
      if (msg[1] == 0x11) {
        var data    = '1 pressed';
        windows(1);
      }
      else if (msg[1] == 0x01) {
        var data    = '2 pressed';
        windows(2);
      }
      else if (msg[1] == 0x12) {
        var data    = '3 pressed';
        windows(3);
      }
      else if (msg[1] == 0x02) {
        var data    = '4 pressed';
        windows(4);
      }
      else if (msg[1] == 0x13) {
        var data    = '5 pressed';
        windows(5);
      }
      else if (msg[1] == 0x03) {
        var data    = '6 pressed';
        windows(6);
      }
      else if (msg[1] == 0x32) {
        var data    = 'pty pressed';
        windows(7);
      }
      else if (msg[1] == 0x22) {
        var data    = 'rds pressed';
        windows(8);
      }
      else if (msg[1] == 0x31) {
        var data    = 'fm pressed';
        windows(9);
      }
      else if (msg[1] == 0x21) {
        var data    = 'am pressed';
        windows(10);
      }
      else if (msg[1] == 0x33) {
        var data    = 'dolby pressed';
        windows(11);
      }
      else if (msg[1] == 0x23) {
        var data    = 'mode pressed';
        windows(12);
      }
      else if (msg[1] == 0x91) {
        var data    = '1 released';
      }
      else if (msg[1] == 0x81) {
        var data    = '2 released';
      }
      else if (msg[1] == 0x92) {
        var data    = '3 released';
      }
      else if (msg[1] == 0x82) {
        var data    = '4 released';
      }
      else if (msg[1] == 0x93) {
        var data    = '5 released';
      }
      else if (msg[1] == 0x83) {
        var data    = '6 released';
      }
      else if (msg[1] == 0xb2) {
        var data    = 'pty released';
      }
      else if (msg[1] == 0xa2) {
        var data    = 'rds released';
      }
      else if (msg[1] == 0xb1) {
        var data    = 'fm released';
      }
      else if (msg[1] == 0xa1) {
        var data    = 'am released';
      }
      else if (msg[1] == 0xb3) {
        var data    = 'dolby released';
      }
      else if (msg[1] == 0xa3) {
        var data    = 'mode released';
      }
    }
    else {
      var command = msg[0];
      var data    = msg[1];
    }
  }

  // IKE
  if (src == 'IKE') {
    // if (msg.compare(bc_in) == 0) {
    // 	var command = 'depressed';
    // 	var data    = 'BC button';
    // }
    if (msg[0] == 0x17) {
      var command = 'odometer';
      var data    = 'not sure yet.'
    }
    else if (msg[0] == 0x18) {
      var command = 'speed/RPM';
      if (msg[2] != 0) {
        var data    = msg[1]+' km/h, '+msg[2]+'00 RPM';
      }
      else {
        var data    = msg[1]+' km/h, 0 RPM';
      }
    }
    else if (msg[0] == 0x24) {
      var command    = 'obc text';
      var data       = ' '+msg+' ';
    }
    else if (msg[0] == 0x19) {
      var command    = 'temperature';
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

  msg_count++;
  if (msg_count == 10) {
    msg_count = 0;
  }

  console.log(src, dst, command, data)

}

var rad_phone_down      = new Buffer([0x48, 0x08]);
var rad_1_down          = new Buffer([0x48, 0x11]);
var rad_2_down          = new Buffer([0x48, 0x01]);
var rad_3_down          = new Buffer([0x48, 0x12]);
var rad_4_down          = new Buffer([0x48, 0x02]);
var rad_5_down          = new Buffer([0x48, 0x13]);
var rad_6_down          = new Buffer([0x48, 0x03]);
var rad_power_down      = new Buffer([0x48, 0x06]);
var rad_power_up        = new Buffer([0x48, 0x86]);
var bc_in               = new Buffer([0x57, 0x02]);
var key_out             = new Buffer([0x74, 0x00, 0xff]);
var key_1_in            = new Buffer([0x74, 0x04, 0x01]);
var fob_lock_down       = new Buffer([0x72, 0x12]);
var fob_unlock_down     = new Buffer([0x72, 0x22]);
var fob_trunk_down      = new Buffer([0x72, 0x42]);

// var interior_lights_off = new Buffer([0x7a, 0x10, 0x00]); // Unlocked
// var interior_lights_off = new Buffer([0x7a, 0x10, 0x01]); // Unlocked+WndwFL
// var interior_lights_off = new Buffer([0x7a, 0x10, 0x02]); // Unlocked+WndwFR
// var interior_lights_off = new Buffer([0x7a, 0x10, 0x04]); // Unlocked+WndwRL
// var interior_lights_off = new Buffer([0x7a, 0x10, 0x08]); // Unlocked+WndwRR
// var interior_lights_off = new Buffer([0x7a, 0x10, 0x10]); // Unlocked+WndwSun
// var interior_lights_off = new Buffer([0x7a, 0x10, 0x20]); // Unlocked+Trunk
// var interior_lights_off = new Buffer([0x7a, 0x11, 0x00]); // Unlocked+DoorFL
// var interior_lights_off = new Buffer([0x7a, 0x12, 0x00]); // Unlocked+DoorFR
// var interior_lights_off = new Buffer([0x7a, 0x14, 0x00]); // Unlocked+DoorRL
// var interior_lights_off = new Buffer([0x7a, 0x18, 0x00]); // Unlocked+DoorRR
// var interior_lights_off = new Buffer([0x7a, 0x50, 0x00]); // Unlocked+Interior lights
// var interior_lights_off = new Buffer([0x7a, 0x10, 0x10]); // Unlocked+Sunroof+Interior lights
// var interior_lights_off = new Buffer([0x7a, 0x20, 0x00]); // Locked
// var interior_lights_off = new Buffer([0x7a, 0x60, 0x00]); // Locked+Interior lights
// var interior_lights_off = new Buffer([0x7a, 0x20, 0x10]); // Locked+Sunroof
// var interior_lights_on  = new Buffer([0x7a, 0x50, 0x10]); // Unlocked+Sunroof+Interior lights

var count = 170;
var handbrake      = 'off';
var engine         = 'off';
var ignition       = 'off';
var msg_count      = 0;
var ext_temp_c     = 0;
var coolant_temp_c = 0;

startup();
