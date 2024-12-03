#!/usr/bin/env bash
RED='\033[1;31m'
GREEN='\033[1;32m'
BLUE='\033[1;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

printf "📝 CICD\n"
printf "=======================\n\n"
printf "${YELLOW}0. Infrastructure 🔧${NC}\n"
printf "${BLUE}1. Deployment 🧪${NC}\n"
printf "${RED}2. ACR Purge 🗑️${NC}\n\n"

read selection

if [ -n "$selection" ]; then

    ############### INFRASTRUCTURE ###############
    if [ "$selection" = "0" ]; then
        destination=infrastructure
        branch=main
    ############### DEPLOYMENT ###############
    elif [ "$selection" = "1" ]; then
        read destination
        ############### DEVELOPMENT ###############
        if [ "$destination" = "dev" ]; then
            branch=main
        ############### FEATURE ###############
        elif [ "$destination" = "feature" ]; then
            branch=main-application
        ############### STAGING ###############
        elif [ "$destination" = "staging" ]; then
            branch=dev
        ############### PRODUCTION ###############
        elif [ "$destination" = "prod" ]; then
            branch=staging
        fi
    ############### ACR PURGE ###############
    elif [ "$selection" = "2" ]; then
        destination=""
        branch=""
        az acr run --cmd "acr purge --filter 'portal-ui:.*' --filter 'gef-ui:.*' --filter 'trade-finance-manager-ui:.*' --filter 'portal-api:.*' --filter 'trade-finance-manager-api:.*' --filter 'dtfs-central-api:.*' --filter 'external-api:.*' --filter 'azure-function-acbs:.*' --ago 15d" --registry "${ACR}" /dev/null
    ############### ACR PURGE ###############
    fi

    if [ -n "$destination" -a -n "$branch" ]; then
        # Display latest push commit
        git checkout "${branch}"
        git pull
        printf "\n\n${NC}⬆️ ${branch} branch latest push : ${NC}"
        printf "${GREEN}"
        git log -n 1 --pretty | sort | grep commit
        printf "${NC}\n\n"

        # Deploy
        git checkout -b "${destination}"
        git push -f --set-upstream origin "${destination}"

        # Clean up
        git checkout "${branch}"
        git branch -d "${destination}"
        printf "\n\n✅ ${destination} deployment initiated, switched to ${branch}.\n\n"
    fi

else
    printf "${RED} ❌ Invalid input, terminating.${NC}\n\n"
    exit 0
fi

#######################################
# UKEF deployment shell script v0.0.7
# 03/01/2024
#######################################
