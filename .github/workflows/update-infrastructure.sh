#!/usr/bin/env bash

set -exuo pipefail

git checkout -b infrastructure
git push -f --set-upstream origin infrastructure
git checkout master
git branch -d infrastructure
