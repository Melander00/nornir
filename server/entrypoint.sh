#!/bin/sh

FLAG="$HOME/hasbuilt.flag"

RESET="\033[0m"
RED_BOLD="\033[31;49;1m"
GREEN="\033[32;49m"
YELLOW="\033[33;49m"

printf "\n${RED_BOLD}==== STARTING APP ====${RESET}\n\n"

if [ ! -f "$FLAG" ]; then
    printf "${GREEN}Building and migrating.${RESET}\n"
    npm run deploy
    npm run seed
    touch "$FLAG"
else
    prinft "${YELLOW}Nothing to migrate or build. Skipping...${RESET}\n"
fi

npm run start