param environment string
param location string

// TODO:FN-417 why is there a production subnet? Remove if appropriate
// param virtualNetworks_vnet_ukef_uks_prod_externalid string = '/subscriptions/08887298-3821-49f0-8303-f88859c12b9b/resourceGroups/rg-ukef-uks-network/providers/Microsoft.Network/virtualNetworks/vnet-ukef-uks-prod'

param appServicePlanEgressSubnetId string
param gatewaySubnetId string
param privateEndpointsSubnetId string

@description('IPs or CIDRs still allowed to access the storage if the default action is Deny')
param allowedIps array

@description('Is public access to the storage account allowed or denied for evertone')
@allowed(['Allow', 'Deny'])
param networkAccessDefaultAction string

var storageAccountName = 'tfs${environment}storage'
var ipRules = [for ip in allowedIps: {
  value: ip
  action: 'Allow'
}]

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  sku: {
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
  properties: {
    defaultToOAuthAuthentication: false
    publicNetworkAccess: 'Enabled'
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    networkAcls: {
      resourceAccessRules: []
      bypass: 'AzureServices'
      virtualNetworkRules: [
      // TODO:FN-417 why is there a production subnet here? Only include if proved necessary
        // {
        //   id: '${virtualNetworks_vnet_ukef_uks_prod_externalid}/subnets/snet-wvd'
        //   action: 'Allow'
        // }
        {
          id: appServicePlanEgressSubnetId
          action: 'Allow'
        }
        {
          id: gatewaySubnetId
          action: 'Allow'
        }
        {
          id: privateEndpointsSubnetId
          action: 'Allow'
        }
      ]
      ipRules: ipRules
      defaultAction: networkAccessDefaultAction
    }
    supportsHttpsTrafficOnly: true
    encryption: {
      services: {
        file: {
          keyType: 'Account'
          enabled: true
        }
        blob: {
          keyType: 'Account'
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
    accessTier: 'Hot'
  }
}

resource defaultBlobService 'Microsoft.Storage/storageAccounts/blobServices@2022-09-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    containerDeleteRetentionPolicy: {
      enabled: true
      days: 3
    }
    cors: {
      corsRules: []
    }
    deleteRetentionPolicy: {
      allowPermanentDelete: false
      enabled: true
      days: 3
    }
  }
}

resource defaultFileService 'Microsoft.Storage/storageAccounts/fileServices@2022-09-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: []
    }
  }
}

resource queueService 'Microsoft.Storage/storageAccounts/queueServices@2022-09-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: []
    }
  }
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2022-09-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: []
    }
  }
}

resource largeMessageContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: defaultBlobService
  name: 'acbs-largemessages'
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'None'
  }
}

resource acbsLeasesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: defaultBlobService
  name: 'acbs-leases'
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'None'
  }
}

resource webjobsHostsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: defaultBlobService
  name: 'azure-webjobs-hosts'
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'None'
  }
}

resource webjobsSecretsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: defaultBlobService
  name: 'azure-webjobs-secrets'
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'None'
  }
}

resource numberGeneratoreLeasesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: defaultBlobService
  name: 'numbergenerator-leases'
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'None'
  }
}

resource fileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2022-09-01' = {
  parent: defaultFileService
  name: 'files'
  properties: {
    accessTier: 'TransactionOptimized'
    shareQuota: 5120
    enabledProtocols: 'SMB'
  }
}

resource portalFileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2022-09-01' = {
  parent: defaultFileService
  name: 'portal'
  properties: {
    accessTier: 'TransactionOptimized'
    shareQuota: 5120
    enabledProtocols: 'SMB'
  }
}

resource workflowFileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2022-09-01' = {
  parent: defaultFileService
  name: 'workflow'
  properties: {
    accessTier: 'TransactionOptimized'
    shareQuota: 5120
    enabledProtocols: 'SMB'
  }
}

resource acbsControlQueue0 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'acbs-control-00'
  properties: {
    metadata: {}
  }
}

resource acbsControlQueue1 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'acbs-control-01'
  properties: {
    metadata: {}
  }
}

resource acbsControlQueue2 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'acbs-control-02'
  properties: {
    metadata: {}
  }
}

resource acbsControlQueue3 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'acbs-control-03'
  properties: {
    metadata: {}
  }
}

resource acbsWorkItemsQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'acbs-workitems'
  properties: {
    metadata: {}
  }
}

resource defaultDurableFunctionsHubControlQueue0 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'durablefunctionshub-control-00'
  properties: {
    metadata: {}
  }
}

resource defaultDurableFunctionsHubControlQueue1 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'durablefunctionshub-control-01'
  properties: {
    metadata: {}
  }
}

resource defaultDurableFunctionsHubControlQueue2 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'durablefunctionshub-control-02'
  properties: {
    metadata: {}
  }
}

resource defaultDurableFunctionsHubControlQueue3 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'durablefunctionshub-control-03'
  properties: {
    metadata: {}
  }
}

resource defaultDurableFunctionsHubWorkItemsQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'durablefunctionshub-workitems'
  properties: {
    metadata: {}
  }
}

resource defaultNumberGeneratorControlQueue0 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'numbergenerator-control-00'
  properties: {
    metadata: {}
  }
}

resource defaultNumberGeneratorControlQueue1 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'numbergenerator-control-01'
  properties: {
    metadata: {}
  }
}

resource defaultNumberGeneratorControlQueue2 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'numbergenerator-control-02'
  properties: {
    metadata: {}
  }
}

resource defaultNumberGeneratorControlQueue3 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'numbergenerator-control-03'
  properties: {
    metadata: {}
  }
}

resource defaultNumberGeneratorWorkItemsQueue 'Microsoft.Storage/storageAccounts/queueServices/queues@2022-09-01' = {
  parent: queueService
  name: 'numbergenerator-workitems'
  properties: {
    metadata: {}
  }
}

resource acbsHistoryTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2022-09-01' = {
  parent: tableService
  name: 'acbsHistory'
  properties: {}
}

resource defaultAcbsInstancesTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2022-09-01' = {
  parent: tableService
  name: 'acbsInstances'
  properties: {}
}

// TODO:FN-417 Is this the right name?
resource azureFunctionsDiagnosticEventsTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2022-09-01' = {
  parent: tableService
  name: 'AzureFunctionsDiagnosticEvents202304'
  properties: {}
}

resource defaultDurableFunctionsHubHistoryTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2022-09-01' = {
  parent: tableService
  name: 'DurableFunctionsHubHistory'
  properties: {}
}

resource durableFunctionsHubInstancesTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2022-09-01' = {
  parent: tableService
  name: 'DurableFunctionsHubInstances'
  properties: {}
}

resource defaultNumbergeneratorHistoryTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2022-09-01' = {
  parent: tableService
  name: 'numbergeneratorHistory'
  properties: {}
}

resource defaultNumbergeneratorInstancesTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2022-09-01' = {
  parent: tableService
  name: 'numbergeneratorInstances'
  properties: {}
}

// This resource definition is taken from the storage-private-endpoint export 
resource storagePrivateEndpoint 'Microsoft.Network/privateEndpoints@2022-11-01' = {
  name: storageAccountName
  location: location
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    privateLinkServiceConnections: [
      {
        name: storageAccountName
        properties: {
          privateLinkServiceId: storageAccount.id
          groupIds: [
            'file'
          ]
          privateLinkServiceConnectionState: {
            status: 'Approved'
            description: 'Auto-Approved'
            actionsRequired: 'None'
          }
        }
      }
    ]
    manualPrivateLinkServiceConnections: []
    subnet: {
      id: privateEndpointsSubnetId
    }
    ipConfigurations: []
    // Note that the customDnsConfigs array gets created automatically and doesn't need setting here.
  }
}
