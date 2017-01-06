#!/usr/bin/env node

var data_handler = function(omnibus) {
	// Self reference
	var _self = this;

	// Exposed data
	this.check_data = check_data;

	// Data handler
	function check_data(data) {
		//console.log('[IBUS:HDLR] Last event %s', omnibus.last_event);
		data.dst_name = omnibus.bus_modules.get_module_name(data.dst);
		data.src_name = omnibus.bus_modules.get_module_name(data.src);

		if (data.msg != 0) {
			// Log output
			// console.log('[%s->%s] ', data.src_name, data.dst_name, data.msg);

			// Send message to code module to parse
			switch (data.src_name) {
				// New model
				case 'BMBT' : omnibus.BMBT.parse_out(data); break;
				case 'CCM'  : omnibus.CCM.parse_out(data);  break;
				case 'DSP'  : omnibus.DSP.parse_out(data);  break;
				case 'DSPC' : omnibus.DSPC.parse_out(data); break;
				case 'EWS'  : omnibus.EWS.parse_out(data);  break;
				case 'GM'   : omnibus.GM.parse_out(data);   break;
				case 'IHKA' : omnibus.IHKA.parse_out(data); break;
				case 'IKE'  : omnibus.IKE.parse_out(data);  break;
				case 'LCM'  : omnibus.LCM.parse_out(data);  break;
				case 'MFL'  : omnibus.MFL.parse_out(data);  break;
				case 'RAD'  : omnibus.RAD.parse_out(data);  break;
				case 'VID'  : omnibus.VID.parse_out(data);  break;

				// Old model
				case 'ABG'  : omnibus.ABG.parse_data(data.msg);  break;
				case 'ANZV' : omnibus.ANZV.parse_data(data.msg); break;
				case 'CDC'  : omnibus.CDC.parse_data(data.msg);  break;
				case 'GT'   : omnibus.GT.parse_data(data.msg);   break;
				case 'HAC'  : omnibus.HAC.parse_data(data.msg);  break;
				case 'MID'  : omnibus.MID.parse_data(data.msg);  break;
				case 'NAV'  : omnibus.NAV.parse_data(data.msg);  break;
				case 'PDC'  : omnibus.PDC.parse_data(data.msg);  break;
				case 'RLS'  : omnibus.RLS.parse_data(data.msg);  break;
				case 'SES'  : omnibus.SES.parse_data(data.msg);  break;
				case 'SHD'  : omnibus.SHD.parse_data(data.msg);  break;
				case 'TEL'  : omnibus.TEL.parse_data(data.msg);  break;

				// Diag/default
				//case 'DIA'  : console.log('[%s->%s] command:',          data.src_name, data.dst_name, data.msg); break;
				case 'DIA'  : break;
				default     : console.log('[%s->%s] No source handler', data.src_name, data.dst_name, data.msg); break;
			}

			switch (data.dst_name) {
				case 'BMBT' : omnibus.BMBT.parse_in(data); break;
				case 'DSPC' : omnibus.DSPC.parse_in(data); break;
			}
		}
	}
}

module.exports = data_handler;
