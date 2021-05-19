#!/usr/bin/env bash

resource_group=Digital-Dev
environments=(dev demo)
app_service_plan=dev

az configure --defaults group=$resource_group

function delete-private-endpoint {
  echo Deleting private endpoint $1
  az network private-endpoint delete --name $1  
  echo Deleted private endpoint $1
}

function delete-webapp {
  echo Deleting webapp-vnet $1
  az webapp vnet-integration remove --name $1
  az webapp delete --name $1
  echo Deleted webapp-vnet $1
}

function delete-application-gateway {
  echo Deleting Application Gateway $1
  az network application-gateway delete --name $1
  echo Deleted Application Gateway $1
}

function delete-subnet {
  echo Deleting subnet $1
  az network vnet subnet update --name $1 --vnet-name tfs-${app_service_plan}-vnet  --remove natGateway
  az network vnet subnet update --name $1 --vnet-name tfs-${app_service_plan}-vnet  --remove delegations
  az network vnet subnet update --name $1 --vnet-name tfs-${app_service_plan}-vnet  --remove serviceAssociationLinks
  az network vnet subnet delete --name $1 --vnet-name tfs-${app_service_plan}-vnet
  echo Deleted subnet $1
}

for environment in "${environments[@]}"
do
  # Delete webapp vnet integration
  delete-webapp tfs-${environment}-reference-data-proxy
  delete-webapp tfs-${environment}-dtfs-central-api
  delete-webapp tfs-${environment}-portal-api
  delete-webapp tfs-${environment}-trade-finance-manager-api
  delete-webapp tfs-${environment}-portal-ui
  delete-webapp tfs-${environment}-trade-finance-manager-ui
  delete-webapp tfs-${environment}-gef-ui
  
  # Delete db
  echo Deleting MongoDB tfs-${environment}-mongo
  az cosmosdb delete --name tfs-${environment}-mongo --yes
  echo Deleted MongoDB tfs-${environment}-mongo

  # Delete private endpoint subnet
  delete-private-endpoint tfs-${environment}-mongo
  delete-private-endpoint tfs${environment}storage
  delete-private-endpoint tfs-${environment}-reference-data-proxy
  delete-private-endpoint tfs-${environment}-dtfs-central-api
  delete-private-endpoint tfs-${environment}-portal-api
  delete-private-endpoint tfs-${environment}-trade-finance-manager-api
  delete-private-endpoint tfs-${environment}-portal-ui
  delete-private-endpoint tfs-${environment}-trade-finance-manager-ui 
  delete-private-endpoint tfs-${environment}-gef-ui

  delete-application-gateway tfs-${environment}-gw
  delete-application-gateway tfs-${environment}-tfm-gw

  delete-subnet ${environment}-private-endpoints
  delete-subnet ${environment}-gateway
done

delete-subnet ${resource_group}-vm
delete-subnet ${app_service_plan}-app-service-plan-egress