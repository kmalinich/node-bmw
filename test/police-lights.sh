#!/bin/bash - 

BASE="http://localhost:3001/lcm?"
SLEEP="0.03"

SFL="output_standing_front_left=true"
SFR="output_standing_front_right=true"
TFR="output_turn_front_right=true"
TFL="output_turn_front_left=true"
TRL="output_turn_rear_left=true"
TRR="output_turn_rear_right=true"
SORL="output_standing_rear_left=true"
SORR="output_standing_rear_right=true"
BRL="output_brake_rear_left=true"
BRR="output_brake_rear_right=true"
RRL="output_reverse_rear_left=true"
RRR="output_reverse_rear_right=true"

while true; do
	# Start of loop
	curl "${BASE}" -d "${SFR}&${TFR}&${SORL}&${BRL}&${RRL}&${TRR}" ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFR}&${TFL}&${SORL}&${BRL}&${TRL}"               ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFL}&${TFR}&${SORL}&${BRR}&${RRL}"        ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFL}&${TFL}&${SORL}&${BRR}&"              ; sleep ${SLEEP}

	curl "${BASE}" -d "${SFR}&${TFR}&${SORR}&${BRL}"               ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFR}&${TFL}&${SORR}&${BRL}&${RRR}"        ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFL}&${TFR}&${SORR}&${BRR}&${RRL}"        ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFL}&${TFL}&${SORR}&${BRR}"               ; sleep ${SLEEP}

	curl "${BASE}" -d "${SFR}&${TFR}&${SORL}&${BRL}&${TRL}"        ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFR}&${TFL}&${SORL}&${BRL}&${TRR}&${RRR}"        ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFL}&${TFR}&${SORL}&${BRR}"               ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFL}&${TFL}&${SORL}&${BRR}&${RRR}"        ; sleep ${SLEEP}

	curl "${BASE}" -d "${SFR}&${TFR}&${SORR}&${BRL}"               ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFR}&${TFL}&${SORR}&${BRL}&${RRR}"        ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFL}&${TFR}&${SORR}&${BRR}&${RRL}"        ; sleep ${SLEEP}
	curl "${BASE}" -d "${SFL}&${TFL}&${SORR}&${BRR}&"              ; sleep ${SLEEP}
done
