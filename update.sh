#!/bin/bash -eu

SCRIPT_DIR=$(cd $(dirname $0); pwd)
cd $SCRIPT_DIR

OLD_HASH=$(git show -s --format=%H)
git pull > /dev/null
NEW_HASH=$(git show -s --format=%H)

if [[ "$OLD_HASH" != "$NEW_HASH" ]]; then
    echo 'The program is updated.'
    npm install
    sudo pm2 restart inkbird > /dev/null
fi
