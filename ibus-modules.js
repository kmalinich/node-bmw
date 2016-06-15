var ibus_modules = {
  'get_module_name': get_module_name
};

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

module.exports = ibus_modules;
