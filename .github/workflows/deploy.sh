#!/usr/bin/env bash

RED='\033[1;31m'
GREEN='\033[1;32m'
BLUE='\033[1;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Checkout main
git checkout main

printf "\n\n${NC}⬆️ main branch latest push : ${NC}"
printf "${GREEN}"
# Display latest push commit hash
git log -n 1 --pretty | sort | grep commit
printf "${NC}\n\n"

printf "🔀 Please select deployment environment:\n"
printf "➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖\n\n"
printf "${YELLOW}0. Infrastructure 🔧${NC}\n"
printf "${BLUE}1. Development 🧪${NC}\n"
printf "${BLUE}2. Staging 💻${NC}\n"
printf "${RED}3. Production 🚀${NC}\n"
printf "${RED}4. ACR Purge 🗑️${NC}\n\n"

read selection

if [ "$selection" = "0" ]
then
############### INFRA ###############
destination=infrastructure
############### INFRA ###############
elif [ "$selection" = "1" ]
then
############### DEV ###############
destination=dev
############### DEV ###############
elif [ "$selection" = "2" ]
then
############### STAGING ###############
destination=staging
############### STAGING ###############
elif [ "$selection" = "3" ]
then
############### PRODUCTION ###############
destination=prod
############### PRODUCTION ###############
elif [ "$selection" = "4" ]
then
############### ACR PURGE ###############
destination=""
az acr run --cmd "acr purge --filter 'portal-ui:.*' --filter 'gef-ui:.*' --filter 'trade-finance-manager-ui:.*' --filter 'portal-api:.*' --filter 'trade-finance-manager-api:.*' --filter 'dtfs-central-api:.*' --filter 'reference-data-proxy:.*' --filter 'azure-function-number-generator:.*' --filter 'azure-function-acbs:.*' --ago 15d" --registry tfsdev /dev/null
############### ACR PURGE ###############
fi

if [ -n "$destination" ]
then
# Deploy
git checkout -b $destination
git push -f --set-upstream origin $destination
# Clean up
git checkout main
git branch -d $destination
printf "\n\n✅ Deployment initiated.\n\n"
fi

#######################################
# UKEF deployment shell script v0.0.2
# 06/03/2022
# Abhi Markan
#######################################