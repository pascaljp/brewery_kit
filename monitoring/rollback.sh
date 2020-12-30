#!/bin/bash -eux

VERSION=$(curl http://brewery-app.com/rollback_version)
echo "Rolling back to version ${VERSION}"
git checkout ${VERSIOM}
echo "Rolled back to version ${VERSION}"
pm2 restart inkbird
