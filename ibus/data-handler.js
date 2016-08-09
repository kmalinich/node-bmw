#!/usr/bin/env node

var data_handler = function(omnibus) {

	// Self reference
	var _self = this;

	// Exposed data
	this.check_data = check_data;

	// Run check_data(); when new bus data appears 
	omnibus.ibus_connection.on('data', check_data)

	// Data handler
	function check_data(data) {
		var dst     = omnibus.bus_modules.get_module_name(data.dst);
		var src     = omnibus.bus_modules.get_module_name(data.src);
		var message = data.msg;

		if (message.length != 0) {
			// Log output
			// console.log('[%s->%s]', src, dst);

			// Send message to code module to parse
			switch (src) {
				case 'ABG'  : omnibus.ABG.parse_data(message);  break;
				case 'ANZV' : omnibus.ANZV.parse_data(message); break;
				case 'BMBT' : omnibus.BMBT.parse_data(message); break;
				case 'CCM'  : omnibus.CCM.parse_data(message);  break;
				case 'CDC'  : omnibus.CDC.parse_data(message);  break;
				case 'DSP'  : omnibus.DSP.parse_data(message);  break;
				case 'EWS'  : omnibus.EWS.parse_data(message);  break;
				case 'GM'   : omnibus.GM.parse_data(message);   break;
				case 'GT'   : omnibus.GT.parse_data(message);   break;
				case 'HAC'  : omnibus.HAC.parse_data(message);  break;
				case 'IHKA' : omnibus.IHKA.parse_data(message); break;
				case 'IKE'  : omnibus.IKE.parse_data(message);  break;
				case 'LCM'  : omnibus.LCM.parse_data(message);  break;
				case 'MFL'  : omnibus.MFL.parse_data(message);  break;
				case 'MID'  : omnibus.MID.parse_data(message);  break;
				case 'PDC'  : omnibus.PDC.parse_data(message);  break;
				case 'RAD'  : omnibus.RAD.parse_data(data);     break;
				case 'RLS'  : omnibus.RLS.parse_data(message);  break;
				case 'SES'  : omnibus.SES.parse_data(message);  break;
				case 'SHD'  : omnibus.SHD.parse_data(message);  break;
				case 'TEL'  : omnibus.TEL.parse_data(message);  break;
			}
		}
	}
}

module.exports = data_handler;
