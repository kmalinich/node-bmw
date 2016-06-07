#!/bin/bash - 

BASE="http://localhost:8080/lcm?"
SLEEP="0.04"

while true; do
  # Start of loop
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"      ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"   ; sleep ${SLEEP}

  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"  ; sleep ${SLEEP}

  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"      ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"   ; sleep ${SLEEP}

  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"  ; sleep ${SLEEP}

  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"      ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"  ; sleep ${SLEEP}

  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"  ; sleep ${SLEEP}

  # Center of loop
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"      ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"  ; sleep ${SLEEP}

  # Reverse the loop
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"  ; sleep ${SLEEP}

  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"      ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"  ; sleep ${SLEEP}

  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"  ; sleep ${SLEEP}

  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"      ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"   ; sleep ${SLEEP}

  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_standing_rear_right" ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_right&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"  ; sleep ${SLEEP}

  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_left"      ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_right&output_turn_rear_left&output_brake_rear_right"     ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_left"   ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_standing_rear_right"  ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_reverse_rear_left"    ; sleep ${SLEEP}
  curl "${BASE}output_standing_front_left&output_turn_front_left&output_turn_rear_right&output_reverse_rear_right"   ; sleep ${SLEEP}
done
