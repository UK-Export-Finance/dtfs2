param location string
param product string
param target string
param version string

param appServicePlanEgressSubnetId string
param gatewaySubnetId string
param privateEndpointsSubnetId string

@description('IPs or CIDRs still allowed to access the storage if the default action is Deny')
@secure()
param onPremiseNetworkIpsString string

@description('Is public access to the storage account allowed or denied for everyone')
@allowed(['Allow', 'Deny'])
param networkAccessDefaultAction string

param shareDeleteRetentionEnabled bool

param filesDnsZoneId string

var storageAccountName = '${product}${target}${version}storage'

var allowedIps = json(onPremiseNetworkIpsString)

var queueNames = [
  'acbs-control-00'
  'acbs-control-01'
  'acbs-control-02'
  'acbs-control-03'
  'acbs-workitems'
  'durablefunctionshub-control-00'
  'durablefunctionshub-control-01'
  'durablefunctionshub-control-02'
  'durablefunctionshub-control-03'
  'durablefunctionshub-workitems'
  'numbergenerator-control-00'
  'numbergenerator-control-01'
  'numbergenerator-control-02'
  'numbergenerator-control-03'
  'numbergenerator-workitems'
]

var tableNames = [
  'acbsHistory'
  'acbsInstances'
  'AzureFunctionsDiagnosticEvents202304'
  'DurableFunctionsHubHistory'
  'DurableFunctionsHubInstances'
  'numbergeneratorHistory'
  'numbergeneratorInstances'
]

var blobContainerNames = [
  'acbs-largemessages'
  'acbs-leases'
  'azure-webjobs-hosts'
  'azure-webjobs-secrets'
  'numbergenerator-leases'
]

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_ZRS'
  }
  kind: 'StorageV2'
  properties: { // NOSONAR – accepted risk, managed by platform team
    defaultToOAuthAuthentication: false
    publicNetworkAccess: 'Enabled'
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    networkAcls: {
      bypass: 'AzureServices'
      virtualNetworkRules: [
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
      ipRules: [for ip in allowedIps: {
        action: 'Allow'
        value: ip
      }]
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

resource defaultBlobService 'Microsoft.Storage/storageAccounts/blobServices@2025-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    containerDeleteRetentionPolicy: {
      enabled: true
      days: 3
    }
    deleteRetentionPolicy: {
      allowPermanentDelete: false
      enabled: true
      days: 3
    }
  }
}

resource defaultFileService 'Microsoft.Storage/storageAccounts/fileServices@2025-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    shareDeleteRetentionPolicy: {
      enabled: shareDeleteRetentionEnabled
      days: 7
    }
  }
}

resource queueService 'Microsoft.Storage/storageAccounts/queueServices@2025-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2025-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource blobContainers 'Microsoft.Storage/storageAccounts/blobServices/containers@2025-01-01' = [for blobContainerName in blobContainerNames: {
  parent: defaultBlobService
  name: blobContainerName
  properties: {
    immutableStorageWithVersioning: {
      enabled: false
    }
    defaultEncryptionScope: '$account-encryption-key'
    denyEncryptionScopeOverride: false
    publicAccess: 'None'
  }
}]

resource fileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2025-01-01' = {
  parent: defaultFileService
  name: 'files'
  properties: {
    accessTier: 'TransactionOptimized'
    shareQuota: 5120
    enabledProtocols: 'SMB'
  }
}

resource portalFileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2025-01-01' = {
  parent: defaultFileService
  name: 'portal'
  properties: {
    accessTier: 'TransactionOptimized'
    shareQuota: 5120
    enabledProtocols: 'SMB'
  }
}

resource utilisationReportsFileShare 'Microsoft.Storage/storageAccounts/fileServices/shares@2025-01-01' = {
  parent: defaultFileService
  name: 'utilisation-reports'
  properties: {
    accessTier: 'TransactionOptimized'
    shareQuota: 5120
    enabledProtocols: 'SMB'
  }
}

resource queues 'Microsoft.Storage/storageAccounts/queueServices/queues@2025-01-01' = [for queueName in queueNames: {
  parent: queueService
  name: queueName
}]


resource tables 'Microsoft.Storage/storageAccounts/tableServices/tables@2025-01-01' = [for tableName in tableNames: {
  parent: tableService
  name: tableName
}]

// This resource definition is taken from the storage-private-endpoint export
resource storagePrivateEndpoint 'Microsoft.Network/privateEndpoints@2024-10-01' = {
  name: storageAccountName
  location: location
  properties: {
    privateLinkServiceConnections: [
      {
        name: storageAccountName
        properties: {
          privateLinkServiceId: storageAccount.id
          groupIds: [
            'file'
          ]
        }
      }
    ]
    subnet: {
      id: privateEndpointsSubnetId
    }
  }
}

resource zoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-10-01' = {
  parent: storagePrivateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'zoneConfig'
        properties: {
          privateDnsZoneId: filesDnsZoneId
        }
      }
    ]
  }
}


output storageAccountName string = storageAccount.name
