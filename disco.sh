#!/bin/bash - 

BASE="http://localhost:8080/lcm?"
SLEEP="0.05"

ARR_LIGHTS=(
turn_rear
brake
tail
reverse
)

ARR_SIDES=(
left
right
)

while true; do
	echo 1
	curl "${BASE}turn_rear_left&halo_right&turn_front_right&cluster_led_off&hazard_led_off"
	sleep ${SLEEP}
	echo 2
	curl "${BASE}turn_rear_left&halo_right&turn_front_right&cluster_led_off&hazard_led_off"
	sleep ${SLEEP}
	echo 3
	curl "${BASE}turn_rear_left&halo_left&brake_left&turn_front_right&cluster_led_off&hazard_led_off"
	sleep ${SLEEP}
	echo 4
	curl "${BASE}turn_rear_left&halo_left&brake_right&turn_front_right&cluster_led_off&hazard_led_off" # rfog
	sleep ${SLEEP}
	echo 5
	curl "${BASE}turn_rear_right&halo_right&tail_left&turn_front_left&cluster_led_off&hazard_led_off" #
	sleep ${SLEEP}
	echo 6
	curl "${BASE}turn_rear_right&halo_right&tail_right&turn_front_left&cluster_led_off&hazard_led_off"
	sleep ${SLEEP}
	echo 7
	curl "${BASE}turn_rear_right&halo_left&reverse_left&turn_front_left&cluster_led_off&hazard_led_off"
	sleep ${SLEEP}
	echo 8
	curl "${BASE}turn_rear_right&halo_left&reverse_right&turn_front_left&cluster_led_off&hazard_led_off"
	sleep ${SLEEP}
done
