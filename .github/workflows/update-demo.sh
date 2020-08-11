#!/usr/bin/env bash

set -exuo pipefail

git checkout -b demo
git push -f --set-upstream origin demo
git checkout master
git branch -d demo
