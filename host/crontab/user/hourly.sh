#!/bin/bash -eu

type jq >/dev/null || sudo apt install -y jq

ROOTDIR=$(docker volume inspect inkbird | grep Mountpoint | awk '{print $2}' | awk -F'"' '{print $2}')
MACHINE_ID=$(sudo cat ${ROOTDIR}/config.json | jq -r .machineId)

function notify() {
    local KEY=$1
    local DATA=$2
    curl -sS "https://brewery-app.com/api/client/log?machineId=${MACHINE_ID}&key=${KEY}&data=${DATA}" >/dev/null
}

function run() {
    docker run --rm --privileged --net=host --name tmp --mount type=volume,src=inkbird,dst=/mnt/inkbird pascaljp/inkbird:0.3 bash -c "$1"
}

function update_inkbird() {
    # Sync to head and restart the server if needed.
    UPDATE_RESULT=$(docker run --rm --privileged --net=host --mount type=volume,src=inkbird,dst=/mnt/inkbird pascaljp/inkbird:0.2 node brewery_kit/monitoring/maintenance/update_job.js)
    notify machine-hourly-update-inkbird finished
    # $(echo "${UPDATE_RESULT}" | nkf -WwMQ | sed 's/=$//g' | tr = % | tr -d '\n')
}

notify machine-hourly started
update_inkbird
notify machine-hourly finished

notify install-new-updater-started
run "cd /mnt/inkbird; rm -rf brewery_kit_tools; git clone https://github.com/pascaljp/brewery_kit_tools.git; cd brewery_kit_tools; npm install"
if [[ $(crontab -l | grep brewery-kit-tools-instance) ]]; then
  (crontab -l; echo '@reboot docker run -d --rm --privileged --net=host --name brewery-kit-tools-instance --mount type=volume,src=inkbird,dst=/mnt/inkbird pascaljp/inkbird:0.2 bash -c "node brewery_kit_tools/dist/index.js"') | crontab -
fi
notify install-new-updater-finished

if [[ ${1:-} != "noreboot" ]]; then
    sudo /sbin/reboot
fi
