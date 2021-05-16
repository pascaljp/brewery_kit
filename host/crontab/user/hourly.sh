#!/bin/bash -eu

function update_inkbird() {
    # BRANCH=$(curl http://brewery-app.com/current_version)
    BRANCH=master
    local URL="https://raw.githubusercontent.com/pascaljp/brewery_kit/${BRANCH}/monitoring/maintenance/update_job.ts"
    echo docker run --rm --privileged --net=host --mount type=volume,src=inkbird,dst=/mnt/inkbird pascaljp/inkbird:0.3 bash -c "\"curl ${URL} | ts-node\""
}

update_inkbird
