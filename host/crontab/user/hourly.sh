#!/bin/bash

type jq >/dev/null || sudo apt install -y jq

ROOTDIR=$(docker volume inspect inkbird | grep Mountpoint | awk '{print $2}' | awk -F'"' '{print $2}')
MACHINE_ID=$(sudo cat ${ROOTDIR}/config.json | jq -r .machineId)

function notify() {
    local KEY=$1
    local DATA=$2
    curl -sS "https://brewery-app.com/api/client/log?machineId=${MACHINE_ID}&key=${KEY}&data=${DATA}" >/dev/null
}

function update_inkbird() {
    # Sync to head and restart the server if needed.
    UPDATE_RESULT=$(docker run --rm --privileged --net=host --mount type=volume,src=inkbird,dst=/mnt/inkbird pascaljp/inkbird:0.2 node brewery_kit/monitoring/maintenance/update_job.js)
    notify machine-hourly-update-inkbird "${UPDATE_RESULT}"
}

notify machine-hourly started
update_inkbird
notify machine-hourly finished

# sudo /sbin/reboot
