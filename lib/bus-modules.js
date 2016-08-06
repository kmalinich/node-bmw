var bus_modules = {
	'get_module_name': get_module_name
};

var _modules = {
	'ABG'                    : 0xA4, // Airbag
	'ANZV'                   : 0xE7, // Display group
	'Assist'                 : 0xCA,
	'BMBT'                   : 0xF0, // On board monitor
	'CCM'                    : 0x30, // Check control messages
	'CD changer DIN size'    : 0x76,
	'CDC'                    : 0x18, // CD changer
	'CID'                    : 0x46,
	'DIA'                    : 0x3F, // Diagnostic
	'DME'                    : 0x12, // Digital Motor Electronics
	'DMEK2000'               : 0xB8,
	'DSP'                    : 0x6A, // Digital sound processor/amplifier
	'EHC'                    : 0xAC, // Electronic height control
	'EWS'                    : 0x44, // EWS immobilizer
	'FBZV'                   : 0x40, // Key fob (only older E38)
	'GLO'                    : 0xBF, // Global
	'GM'                     : 0x00, // General module
	'GT'                     : 0x3B, // Navigation
	'GTR'                    : 0x43,
	'HAC'                    : 0x9A, // Headlight aim control
	'IHKA'                   : 0x5B, // Auto HVAC
	'IKE'                    : 0x80, // Cluster
	'IRIS'                   : 0xE0, // Integrated radio information system
	'LCM'                    : 0xD0, // Light/check module
	'LOC'                    : 0xFF, // Local
	'MFL'                    : 0x50, // Multi function lever
	'MID'                    : 0xC0, // Information display
	'NAVE'                   : 0x7F, // Navigation Europe
	'NAVJ'                   : 0xBB, // Navigation Japan
	'PDC'                    : 0x60, // Park distance control
	'Power mirror 1'         : 0x51,
	'Power mirror 2'         : 0x9B,
	'Power mirror 3'         : 0x9C,
	'RAD'                    : 0x68, // Radio
	'RLS'                    : 0xE8, // Rain+Light sensor
	'Radio controlled clock' : 0x28,
	'Rear Multinfo display'  : 0xA0,
	'SES'                    : 0xB0,
	'SHD'                    : 0x08, // Sunroof module
	'SRS'                    : 0x73, // Sirius sat radio
	'Seat 1'                 : 0x72,
	'Seat 2'                 : 0xDA,
	'TEL'                    : 0xC8, // Telephone
	'VID'                    : 0xED,
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

module.exports = bus_modules;
