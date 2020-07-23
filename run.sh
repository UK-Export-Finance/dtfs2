#!/usr/bin/env bash

set -exuo pipefail

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

docker rm -f $(docker ps -aq)
docker-compose up
