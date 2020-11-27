#!/usr/bin/env bash

if [ -z "$1" ]; then
    echo "Please specify a source environment branch, e.g. master, test or staging."
    exit 1
fi

if [ -z "$2" ]; then
    echo "Please specify a destination environment branch, e.g. test, staging, prod or demo."
    exit 1
fi

set -exuo pipefail
environment_source=$1
environment_destination=$2

# Promote
git checkout $environment_source
git checkout -b $environment_destination
git push -f --set-upstream origin $environment_destination

# Clean up
git checkout master
git branch -d $environment_source
git branch -d $environment_destination
