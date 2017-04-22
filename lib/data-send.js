var module_name = __filename.slice(__dirname.length + 1, -3);

module.exports = {
	// Data router based on module name,
	// directs to particular network (IBUS/KBUS)
	send : (data) => {
		// Lightly validate packet
		if (data.src == null || data.dst == null || data.msg == null) {
			return;
		}

		// If data source is DIA, attempt to send via DBUS, then KBUS, then IBUS
		if (data.src == 'DIA') {
			if (config.interface.dbus !== null) {
				omnibus.dbus.interface.send(data);
			}
			else if (config.interface.kbus !== null) {
				omnibus.kbus.interface.send(data);
			}
			else if (config.interface.ibus !== null) {
				omnibus.ibus.interface.send(data);
			}
			return;
		}

		// Switch based on destination
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
			case 'ABG'  : omnibus.data_send.kbus(data); break;
			case 'GM'   : omnibus.data_send.kbus(data); break;
			case 'EWS'  : omnibus.data_send.kbus(data); break;
			case 'HAC'  : omnibus.data_send.kbus(data); break;
			case 'IHKA' : omnibus.data_send.kbus(data); break;
			case 'RLS'  : omnibus.data_send.kbus(data); break;
			case 'SHD'  : omnibus.data_send.kbus(data); break;

			// LOC/GLO
			case 'LOC' : omnibus.ibus.interface.send(data); break;
			// IKE will mirror packets to other network when dst is GLO
			case 'GLO' : omnibus.data_send.kbus(data); break;

			// case 'DIA' : console.log('[node:SEND] [%s->%s] command:', data.src, data.dst, data.msg); break;
			case 'DIA': break;

			default : // Dunno? Welp, try to send to both.
				if (omnibus.data_send.kbus.send(data) === true) {
					omnibus.ibus.interface.send(data);
				}
				break;
		};
	},

	// Try to send over KBUS, but if not available, send over IBUS
	kbus : (data) => {
		if (config.interface.kbus !== null) {
			omnibus.kbus.interface.send(data);
			return true;
		}
		if (config.interface.ibus !== null) {
			omnibus.ibus.interface.send(data);
			return false;
		}
	},
};
