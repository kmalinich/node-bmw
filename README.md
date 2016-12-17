node-bmw
======
A node.js powered interface for IBUS BMW vehicles, for use with whatever runs the dependencies.
It builds (but isn't tested) on Linux x86_64, Linux ARMv7 (raspi), and macOS 10.10/10.11.

Currently being developed using my US-spec 2000 E39 540i, and a Raspberry Pi 3 running the latest Raspbian and NodeJS 7.2.x.
About 90% of it is done in a way I don't really like, but I have so little time to work on this... =/

It provides these custom features for me:
* Automatic lights based on locale and sun position (currently hardcoded to my latitude/longitude)
* Kodi WebSocket integration so the steering wheel controls work with Kodi, among other things
* Dynamic welcome lights (the more you press inside a 15 second window, the more lights illuminate)
* 5-flash "comfort" turn signal emulation a la newer BMWs
* Custom heads-up display in gauge cluster (IKE) with fuel economy, coolant temp in deg C, and time (from OS, not from car)
* WebUI with current status, full control of light control module (LCM) and body module (windows/doors/locks and their status)
* Time/date sync from OS to car
* Auto-unlock door locks when key is turned off
* Parsing/decoding of IO status from LCM and GM
* WebSocket UI/dynamic table for displaying decoded data in WebUI, with 2-way communication for sending data as well
* What I'm about 97% certain is the single largest documented collection of BMW IBUS commands, under /ref 
* .. and a lot of other stuff, I'm probably forgetting.

Future plans/ideas/to do list:
* IKE LEDs as status light(s) - with LCM status, same as turn signal works 
* Common power off and on code objects 
* Websocket for status page (!!!!! dear god, I need to get on this)
* Auto door locks after exit?
* Better icon for desktop
* Auto launch Kodi on OS boot
* Kodi python plugins
* HDMI CEC control
* Fix crash on Kodi exit related to websocket handling
* Threading and wait for a write queue (.. yeah.)
* Garage door control API
* Read/write JSON config file for persistent storage
* Make IKE.js just call auto_lights_process instead of setting/clearing auto_lights_interval
* Long press media controls on steering wheel for more functions
* Make NTP sync script a daemon instead, or learn ntpd
* Custom oil change and service reminders
* NTP integration w/car, use car as source on NTP fail 
* Window down warning when leaving car
* Persistent/better welcome lights, with power off on door open
* Find reason for whole-device freeze up on long Kodi run (2days+)
* Priority queue for IKE messages

I'll add more to this once I'm out of the dirty-dev weeds, which might be never
