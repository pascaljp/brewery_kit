#!/bin/bash -eux

SCRIPT_DIR=$(cd $(dirname $0); pwd)
cd $SCRIPT_DIR
ls

OLD_HASH=$(git show -s --format=%H)
git pull
NEW_HASH=$(git show -s --format=%H)

if [[ "$OLD_HASH" != "$NEW_HASH" ]]; then
    sudo pm2 restart inkbird
fi
