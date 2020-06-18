#!/usr/bin/env bash

set -euxo pipefail

git checkout master
git pull --rebase
git checkout github-actions
git pull --rebase
git rebase master
