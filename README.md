# node-bmw

A node.js powered interface for IBUS BMW vehicles, for use with whatever runs the dependencies.
It builds (but isn't _really_ tested) on Linux x86_64, Linux ARMv7 (raspi), and macOS 10.10/10.11.

Currently being developed using my US-spec 2000 E39 540i, and a Raspberry Pi 3 running the latest Raspbian and NodeJS 7.4.x.
About 90% of it is done in a way I don't really like, but I have so little time to work on this... =/

It provides these custom features for me:
* Automatic lights based on locale and sun position (currently hardcoded to my latitude/longitude)
  * Rear fog LED as status light
* HDMI CEC control to power on/off display with ignition
* Kodi WebSocket integration so the steering wheel controls work with Kodi, among other things
* Dynamic welcome lights (the more you press inside a 15 second window, the more lights illuminate)
* 5-flash "comfort" turn signal emulation a la newer BMWs
* Custom heads-up display in gauge cluster (IKE) with fuel economy, coolant temp in deg C, and time (from OS, not from car)
* WebUI
  * Current vehicle status
  * Control/configure DSP amp/equalizer
  * Control LCM (light module)
  * Control IKE (gauge cluster) and OBC data set/reset
  * Control GM (windows/doors/locks and their status)
* Time/date sync from OS to car
* Auto-unlock door locks when key is turned off
* Parsing/decoding of IO status from LCM and GM
* WebSocket UI/dynamic table for displaying decoded data in WebUI, with 2-way communication for sending data as well
* What I'm about 97% certain is the single largest documented collection of BMW IBUS commands, under /ref 
* .. and a lot of other stuff, I'm probably forgetting.

Future plans/ideas/to do list:
* [My current todo list (Google Docs)](https://docs.google.com/document/d/18HyEHyixTG1MqpJNxdOfWh4I4G5pGTjdKz1ye05hFMA/edit?usp=sharing)

I'll add more to this once I'm out of the dirty-dev weeds, which might be never
