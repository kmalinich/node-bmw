#!/bin/bash - 

BASE="http://localhost:8080/lcm?"
SLEEP="0.04"

while true; do
  # Start of loop
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  # Center of loop
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  # Reverse the loop
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFR}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}

  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFR}&${TRL}&${BRR}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORL}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${SORR}"; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${RRL}" ; sleep ${SLEEP}
  curl "${BASE}" -d "${SFL}&${TFL}&${TRR}&${RRR}" ; sleep ${SLEEP}
done
