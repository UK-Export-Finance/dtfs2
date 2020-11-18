#!/usr/bin/env bash

set -euo pipefail

home=${PWD}

for f in $(ls secrets/set_*); do 
    echo " - $f"
    source $f
done

npm run lint:fix

cd portal
docker build --tag dtfs/portal .
cd $home

#cd deal-api
#docker build --tag deal-api .
#cd $home

if [ ! -z "$(docker ps -aq)"; then
    docker rm -f $(docker ps -aq)
fi
docker-compose up
