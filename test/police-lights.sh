#!/bin/bash - 

BASE="http://localhost:8080/lcm?"
SLEEP="0.04"

while true; do
  # Start of loop
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"      ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"   ; sleep ${SLEEP}

  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"  ; sleep ${SLEEP}

  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"      ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"   ; sleep ${SLEEP}

  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"  ; sleep ${SLEEP}

  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"      ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"  ; sleep ${SLEEP}

  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"  ; sleep ${SLEEP}

  # Center of loop
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"      ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"  ; sleep ${SLEEP}

  # Reverse the loop
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"  ; sleep ${SLEEP}

  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"      ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"  ; sleep ${SLEEP}

  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"  ; sleep ${SLEEP}

  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"      ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"   ; sleep ${SLEEP}

  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true" ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_right=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"  ; sleep ${SLEEP}

  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_left=true"      ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_right=true&output_turn_rear_left=true&output_brake_rear_right=true"     ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_left=true"   ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_standing_inner_rear_right=true"  ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_left=true"    ; sleep ${SLEEP}
  curl "${BASE}" -d "output_standing_front_left=true&output_turn_front_left=true&output_turn_rear_right=true&output_reverse_rear_right=true"   ; sleep ${SLEEP}
done
