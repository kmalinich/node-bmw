#!/bin/bash -

BASE="http://localhost:3001/lcm?"
SLEEP="0.5"

ARRAY_LIGHTS_REAR=(
output_license_rear_right
output_brake_rear_left
output_standing_inner_rear_left
output_reverse_rear_left
output_turn_rear_left
output_brake_rear_right
output_standing_inner_rear_right
output_reverse_rear_right
output_turn_rear_right
)

#output_fog_front_left
#output_fog_front_right
ARRAY_LIGHTS_FRONT=(
output_highbeam_front_left
output_standing_front_left
output_turn_front_left
output_highbeam_front_right
output_standing_front_right
output_turn_front_right
)

#output_led_switch_hazard
#output_led_switch_light

#output_standing_rear_left
#output_standing_rear_right
#output_license_rear_left
#output_fog_rear_left
#output_brake_rear_middle
#output_reverse_rear_trailer
#output_lowbeam_front_left
#output_lowbeam_front_right

while true; do
	for LIGHT in ${ARRAY_LIGHTS_REAR[@]}; do
		echo "${LIGHT}"
		curl "${BASE}" -d "${LIGHT}=true"
		sleep ${SLEEP}
	done
done
