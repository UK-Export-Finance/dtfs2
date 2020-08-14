#!/usr/bin/env bash

if [ -z "$1" ]; then
    echo "Please specify an environment, e.g. test, prod or demo."
    exit 1
fi

set -exuo pipefail
environment=$1

git checkout master
git checkout -b $environment
git push -f --set-upstream origin $environment
git checkout master
git branch -d $environment
