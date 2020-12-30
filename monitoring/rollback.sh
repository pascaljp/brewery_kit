#!/bin/bash -eux

SHA=$(curl http://brewery-app.com/rollback_version)
echo "Rolling back to version ${SHA}"
git checkout ${SHA}
echo "Rolled back to version ${SHA}"
pm2 restart inkbird
