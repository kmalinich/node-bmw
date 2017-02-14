#!/usr/bin/env node

module.exports = {
	api : {
		port : 3001,
	},
	emulate : {
		bmbt : true,
		cdc  : false,
		mid  : false,
		dspc : true,
	},
	lights : {
		auto : true,
		dimmer_lights_on  : 254,
		dimmer_lights_off : 255,
	},
	bluetooth   : false,
	hdmi        : true,
	kodi        : true,
};
