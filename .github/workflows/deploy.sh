#!/usr/bin/env bash
RED='\033[1;31m'
GREEN='\033[1;32m'
BLUE='\033[1;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

printf "📝 Deployment strategy:\n"
printf "=======================\n\n"
printf "${YELLOW}0. Infrastructure 🔧${NC}\n"
printf "${BLUE}1. Development 🧪${NC}\n"
printf "${BLUE}2. Staging 💻${NC}\n"
printf "${RED}3. Production 🚀${NC}\n"
printf "${RED}4. ACR Purge 🗑️${NC}\n\n"

read selection

if [ -n "$selection" ]; then

    if [ "$selection" = "0" ]
    then
    ############### INFRA ###############
    destination=infrastructure
    branch=main
    ############### INFRA ###############
    elif [ "$selection" = "1" ]
    then
    ############### DEV ###############
    destination=dev
    branch=main
    ############### DEV ###############
    elif [ "$selection" = "2" ]
    then
    ############### STAGING ###############
    destination=staging
    branch=main
    ############### STAGING ###############
    elif [ "$selection" = "3" ]
    then
    ############### PRODUCTION ###############
    destination=prod
    branch=main
    ############### PRODUCTION ###############
    elif [ "$selection" = "4" ]
    then
    ############### ACR PURGE ###############
    destination=""
    branch=""
    az acr run --cmd "acr purge --filter 'portal-ui:.*' --filter 'gef-ui:.*' --filter 'trade-finance-manager-ui:.*' --filter 'portal-api:.*' --filter 'trade-finance-manager-api:.*' --filter 'dtfs-central-api:.*' --filter 'reference-data-proxy:.*' --filter 'azure-function-number-generator:.*' --filter 'azure-function-acbs:.*' --ago 15d" --registry tfsdev /dev/null
    az acr run --cmd "acr purge --filter 'portal-ui:.*' --filter 'gef-ui:.*' --filter 'trade-finance-manager-ui:.*' --filter 'portal-api:.*' --filter 'trade-finance-manager-api:.*' --filter 'dtfs-central-api:.*' --filter 'reference-data-proxy:.*' --filter 'azure-function-number-generator:.*' --filter 'azure-function-acbs:.*' --ago 15d" --registry tfsstaging /dev/null
    ############### ACR PURGE ###############
    fi

    if [ -n "$destination" -a -n "$branch" ]
    then
    # Display latest push commit
    git checkout "${branch}"
    git pull
    printf "\n\n${NC}⬆️ ${branch} branch latest push : ${NC}"
    printf "${GREEN}"
    git log -n 1 --pretty | sort | grep commit
    printf "${NC}\n\n"

    # Deploy
    git checkout -b "${destination}"
    git push -f --set-upstream origin $destination

    # Clean up
    git checkout "${branch}"
    git branch -d $destination
    printf "\n\n✅ ${destination} deployment initiated, switched to ${branch}.\n\n"
    fi

else
    printf "${RED} ❌ Invalid input, terminating.${NC}\n\n";
    exit 0;
fi

#######################################
# UKEF deployment shell script v0.0.3
# 26/04/2022
# Abhi Markan
#######################################