#!/usr/bin/env node

module.exports = {
	// Data router based on module name,
	// directs to particular network (IBUS/KBUS)
	send : (data) => {
		switch (data.dst) {
			// IBUS
			case 'ANZV' : omnibus.ibus.interface.send(data); break;
			case 'BMBT' : omnibus.ibus.interface.send(data); break;
			case 'CCM'  : omnibus.ibus.interface.send(data); break;
			case 'CDC'  : omnibus.ibus.interface.send(data); break;
			case 'DSP'  : omnibus.ibus.interface.send(data); break;
			case 'DSPC' : omnibus.ibus.interface.send(data); break;
			case 'IKE'  : omnibus.ibus.interface.send(data); break;
			case 'GT'   : omnibus.ibus.interface.send(data); break;
			case 'LCM'  : omnibus.ibus.interface.send(data); break;
			case 'MFL'  : omnibus.ibus.interface.send(data); break;
			case 'MID'  : omnibus.ibus.interface.send(data); break;
			case 'NAV'  : omnibus.ibus.interface.send(data); break;
			case 'PDC'  : omnibus.ibus.interface.send(data); break;
			case 'RAD'  : omnibus.ibus.interface.send(data); break;
			case 'SES'  : omnibus.ibus.interface.send(data); break;
			case 'TEL'  : omnibus.ibus.interface.send(data); break;
			case 'VID'  : omnibus.ibus.interface.send(data); break;

			// KBUS
			case 'ABG'  : omnibus.kbus.interface.send(data); break;
			case 'GM'   : omnibus.kbus.interface.send(data); break;
			case 'EWS'  : omnibus.kbus.interface.send(data); break;
			case 'HAC'  : omnibus.kbus.interface.send(data); break;
			case 'IHKA' : omnibus.kbus.interface.send(data); break;
			case 'RLS'  : omnibus.kbus.interface.send(data); break;
			case 'SHD'  : omnibus.kbus.interface.send(data); break;

			// LOC/GLO
			case 'LOC' : omnibus.ibus.interface.send(data); break;
			case 'GLO' :
				omnibus.ibus.interface.send(data);
				omnibus.kbus.interface.send(data);
				break;

			// Diag/default
			case 'DIA' : console.log('[node:SEND] [%s->%s] command:',               data.src, data.dst, data.msg); break;
			default    : console.log('[node:SEND] [%s->%s] No destination handler', data.src, data.dst, data.msg);
		};
	},
};
