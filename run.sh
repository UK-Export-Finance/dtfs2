#!/usr/bin/env bash

set -euo pipefail

home=${PWD}

for f in $(ls secrets/set_*); do 
    echo " - $f"
    source $f
done

npm run lint:fix

cd portal
docker build --tag dtfs/portal --build-arg GITHUB_SHA=portal-ui-local .
cd $home

#cd deal-api
#docker build --tag deal-api --build-arg GITHUB_SHA=portal-api-local .
#cd $home

if [ ! -z "$(docker ps -aq)"; then
    docker rm -f $(docker ps -aq)
fi
docker-compose up
