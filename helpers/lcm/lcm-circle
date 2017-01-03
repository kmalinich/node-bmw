#!/bin/bash -

BASE="http://localhost:3001/lcm?"
SLEEP="0.04"

SFL="output_standing_front_left=true"
SFR="output_standing_front_right=true"
TFR="output_turn_front_right=true"
TFL="output_turn_front_left=true"
TRL="output_turn_rear_left=true"
TRR="output_turn_rear_right=true"
SRL="output_standing_rear_left=true"
SRR="output_standing_rear_right=true"
BRL="output_brake_rear_left=true"
BRM="output_brake_rear_middle=true"
BRR="output_brake_rear_right=true"
RRL="output_reverse_rear_left=true"
RRR="output_reverse_rear_right=true"

while true; do
	curl "${BASE}" -d "${SFR}" ; sleep ${SLEEP}
	curl "${BASE}" -d "${TFR}" ; sleep ${SLEEP}
	curl "${BASE}" -d "${BRR}" ; sleep ${SLEEP}
	curl "${BASE}" -d "${SRR}" ; sleep ${SLEEP}
	curl "${BASE}" -d "${TRR}" ; sleep ${SLEEP}
	curl "${BASE}" -d "${TRL}" ; sleep ${SLEEP}
	curl "${BASE}" -d "${SRL}" ; sleep ${SLEEP}
	curl "${BASE}" -d "${BRL}" ; sleep ${SLEEP}
	curl "${BASE}" -d "${TFL}" ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFL}" ; sleep ${SLEEP}
done
