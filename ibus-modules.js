var ibus_modules = {
  'get_module_name': get_module_name
};

var _modules = {
  'ABG'                      : 0xA4,
  'Assist'                   : 0xCA,
  'CC'                       : 0x30,
  'CD changer DIN size'      : 0x76,
  'CDC'                      : 0x18,
  'CID'                      : 0x46,
  'DIA'                      : 0x3F,
  'DSP'                      : 0x6A,
  'EWS'                      : 0x44,
  'GM'                       : 0x00,
  'GraphicsDriverRearScreen' : 0x43,
  'GraphicsNavigationDriver' : 0x3B,
  'IHKA'                     : 0x5B,
  'IKE'                      : 0x80,
  'IRIS'                     : 0xE0,
  'Key fob'                  : 0x40,
  'LCM'                      : 0xBF,
  'GLO'                      : 0xFF,
  'Seats'                    : 0xED,
  'MFL'                      : 0x50,
  'MID'                      : 0xC0,
  'Dimmer'                   : 0xD0,
  'Navigation (EUR)'         : 0x7F,
  'Navigation (JP)'          : 0xBB,
  'OBC'                      : 0xE7,
  'OBM'                      : 0xF0,
  'PDC'                      : 0x60,
  'Power mirror 1'           : 0x51,
  'Power mirror 2'           : 0x9B,
  'Power mirror 3'           : 0x9C,
  'RAD'                      : 0x68,
  'RLS'                      : 0xE8,
  'Radio controlled clock'   : 0x28,
  'Rear Multinfo display'    : 0xA0,
  'SM'                       : 0x08,
  'SPEED'                    : 0xB0,
  'Seat 1'                   : 0x72,
  'Seat 2'                   : 0xDA,
  'Sirius radio'             : 0x73,
  'TEL'                      : 0xC8,
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

module.exports = ibus_modules;
