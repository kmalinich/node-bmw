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
    var message = data.message;

    // Log output
    console.log('[%s->%s]', src, dst);

    // Send message to code module to parse
    if (src == 'ABG')  { omnibus.ABG.parse_data(message);  }
    if (src == 'ANZV') { omnibus.ANZV.parse_data(message); }
    if (src == 'BMBT') { omnibus.BMBT.parse_data(message); }
    if (src == 'CCM')  { omnibus.CCM.parse_data(message);  }
    if (src == 'CDC')  { omnibus.CDC.parse_data(message);  }
    if (src == 'DSP')  { omnibus.DSP.parse_data(message);  }
    if (src == 'EWS')  { omnibus.EWS.parse_data(message);  }
    if (src == 'GM')   { omnibus.GM.parse_data(message);   }
    if (src == 'GT')   { omnibus.GT.parse_data(message);   }
    if (src == 'HAC')  { omnibus.HAC.parse_data(message);  }
    if (src == 'IHKA') { omnibus.IHKA.parse_data(message); }
    if (src == 'IKE')  { omnibus.IKE.parse_data(message);  }
    if (src == 'LCM')  { omnibus.LCM.parse_data(message);  }
    if (src == 'MFL')  { omnibus.MFL.parse_data(message);  }
    if (src == 'MID')  { omnibus.MID.parse_data(message);  }
    if (src == 'PDC')  { omnibus.PDC.parse_data(message);  }
    if (src == 'RAD')  { omnibus.RAD.parse_data(data);     }
    if (src == 'RLS')  { omnibus.RLS.parse_data(message);  }
    if (src == 'SES')  { omnibus.SES.parse_data(message);  }
    if (src == 'SHD')  { omnibus.SHD.parse_data(message);  }
    if (src == 'TEL')  { omnibus.TEL.parse_data(message);  }
  }
}

module.exports = data_handler;
