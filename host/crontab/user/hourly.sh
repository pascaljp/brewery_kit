#!/bin/bash

type jq >/dev/null || sudo apt install -y jq

ROOTDIR=$(docker volume inspect inkbird | grep Mountpoint | awk '{print $2}' | awk -F'"' '{print $2}')
MACHINE_ID=$(sudo cat ${ROOTDIR}/config.json | jq -r .machineId)

function notify() {
    MACHINE_ID=$1
    KEY=$2
    DATA=$3
    curl -sS "https://brewery-app.com/api/client/log?machineId=${MACHINE_ID}&key=${KEY}&data=${DATA}" >/dev/null
}

function update_inkbird() {
    # Sync to head and restart the server if needed.
    UPDATE_RESULT=$(docker run --rm --privileged --net=host --mount type=volume,src=inkbird,dst=/mnt/inkbird pascaljp/inkbird:0.2 bash -c brewery_kit/monitoring/maintenance/update_job.sh | tail -1)
    if [[ "${UPDATE_RESULT}" == "Updated" ]]; then
        echo "Restart"
        notify ${MACHINE_ID} job-restart ongoing
        docker restart brewery-kit-instance
        notify ${MACHINE_ID} job-restart done
    fi
}

function install_crontab() {
    # Update crontab.
    sudo cat ${ROOTDIR}/brewery_kit/host/crontab.user | crontab -
}

notify ${MACHINE_ID} user-hourly started

update_inkbird
install_crontab

notify ${MACHINE_ID} machine-crontab updated
notify ${MACHINE_ID} user-hourly finished

sudo /sbin/reboot
