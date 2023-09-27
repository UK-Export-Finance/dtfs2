param location string
param environment string
param appServicePlanEgressSubnetId string
param mongoDbDnsZoneId string
param privateEndpointsSubnetId string
param databaseName string


@description('Network IPs to permit access to CosmosDB')
@secure()
param allowedIpsString string

// See https://learn.microsoft.com/en-gb/azure/cosmos-db/throughput-serverless
@allowed(['Provisioned Throughput', 'Serverless'])
param capacityMode string

@allowed(['Continuous7Days', 'Continuous30Days'])
param backupPolicyTier string

var cosmosDbAccountName = 'tfs-${environment}-mongo'
var privateEndpointName = 'tfs-${environment}-mongo'

var allowedIps = json(allowedIpsString)

// On activating "Allow access from Azure Portal":
// https://github.com/Azure/azure-cli/issues/7495 ->
// https://docs.microsoft.com/en-us/azure/cosmos-db/how-to-configure-firewall#allow-requests-from-the-azure-portal
// As mentioned above, adding the following is equivalent to checking "Allow access from Azure Portal" "Accept connections from within public Azure datacenters" in the portal.
var azurePortalIps = [
  '104.42.195.92'
  '40.76.54.131'
  '52.176.6.30'
  '52.169.50.45'
  '52.187.184.26'
]

// As mentioned above, adding the following is equivalent to checking "Accept connections from within public Azure datacenters" in the portal.
// We need this for Azure functions.
var acceptPublicAzureDatacentersIp = ['0.0.0.0']

var allAllowedIps = concat(allowedIps, azurePortalIps, acceptPublicAzureDatacentersIp)

var capabilities = capacityMode == 'Provisioned Throughput' ? [
  {
    name: 'EnableMongo'
  }
] : [
  {
    name: 'EnableMongo'
  }
  {
    name: 'DisableRateLimitingResponses'
  }
  {
    name: 'EnableServerless'
  }  
]


resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosDbAccountName
  location: location
  tags: {}
  kind: 'MongoDB'
  identity: {
    type: 'None'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    enableAutomaticFailover: false
    enableMultipleWriteLocations: false
    isVirtualNetworkFilterEnabled: true
    virtualNetworkRules: [
      {
        id: appServicePlanEgressSubnetId
        ignoreMissingVNetServiceEndpoint: false
      }
    ]
    disableKeyBasedMetadataWriteAccess: false
    enableFreeTier: false
    enableAnalyticalStorage: false
    analyticalStorageConfiguration: {}
    createMode: 'Default'
    databaseAccountOfferType: 'Standard'
    defaultIdentity: 'FirstPartyIdentity'
    networkAclBypass: 'None'
    disableLocalAuth: false
    enablePartitionMerge: false
    minimalTlsVersion: 'Tls12'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
      maxIntervalInSeconds: 5
      maxStalenessPrefix: 100
    }
    apiProperties: {
      serverVersion: '4.2'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    cors: []
    capabilities: capabilities
    ipRules: [for ip in allAllowedIps: {
      ipAddressOrRange: ip
    }]
    backupPolicy: {
      type: 'Continuous'
      continuousModeProperties: {
        tier: backupPolicyTier
      }
    }
    networkAclBypassResourceIds: []
    capacity: {
      totalThroughputLimit: 4000
    }
  }
}


resource submissionsDb 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2023-04-15' = {
  parent: cosmosDbAccount
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
  }
}

var collectionsArray = [
  {
    name: 'banks'
    properties: {
      resource: {
        id: 'banks'
        shardKey: {
          _id: 'Hash'
        }
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'cron-job-logs'
    properties: {
      resource: {
        id: 'cron-job-logs'
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'deals'
    properties: {
      resource: {
        id: 'deals'
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'durable-functions-log'
    properties: {
      resource: {
        id: 'durable-functions-log'
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
          {
            key: {
              keys: [
                'status'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'eligibilityCriteria'
    properties: {
      resource: {
        id: 'eligibilityCriteria'
        shardKey: {
          _id: 'Hash'
        }
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
          {
            key: {
              keys: [
                'version'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'facilities'
    properties: {
      resource: {
        id: 'facilities'
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'feedback'
    properties: {
      resource: {
        id: 'feedback'
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'files'
    properties: {
      resource: {
        id: 'files'
        shardKey: {
          _id: 'Hash'
        }
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'gef-eligibilityCriteria'
    properties: {
      resource: {
        id: 'gef-eligibilityCriteria'
        shardKey: {
          _id: 'Hash'
        }
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
          {
            key: {
              keys: [
                'version'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'gef-mandatoryCriteriaVersioned'
    properties: {
      resource: {
        id: 'gef-mandatoryCriteriaVersioned'
        shardKey: {
          _id: 'Hash'
        }
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
          {
            key: {
              keys: [
                'version'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'mandatoryCriteria'
    properties: {
      resource: {
        id: 'mandatoryCriteria'
        shardKey: {
          _id: 'Hash'
        }
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
          {
            key: {
              keys: [
                'version'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'tfm-deals'
    properties: {
      resource: {
        id: 'tfm-deals'
        shardKey: {
          _id: 'Hash'
        }
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'tfm-facilities'
    properties: {
      resource: {
        id: 'tfm-facilities'
        shardKey: {
          _id: 'Hash'
        }
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'tfm-feedback'
    properties: {
      resource: {
        id: 'tfm-feedback'
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'tfm-teams'
    properties: {
      resource: {
        id: 'tfm-teams'
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'tfm-users'
    properties: {
      resource: {
        id: 'tfm-users'
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  }
  {
    name: 'users'
    properties: {
      resource: {
        id: 'users'
        shardKey: {
          _id: 'Hash'
        }
        indexes: [
          {
            key: {
              keys: [
                '_id'
              ]
            }
          }
        ]
      }
    }
  } 
]

// We set a batch size because otherwise Azure tries to create all of the resources in parallel and we get 429 errors.
@batchSize(4)
resource collections 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases/collections@2023-04-15' = [for collection in collectionsArray: {
  parent: submissionsDb
  name: collection.name
  properties: collection.properties
}]


// Setting the throughput only makes sense for 'Provisioned Throughput' mode
resource defaultThroughputSettings 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases/throughputSettings@2023-04-15' = if (capacityMode == 'Provisioned Throughput') {
  parent: submissionsDb
  name: 'default'
  properties: {
    resource: {
      throughput: 400
      autoscaleSettings: {
        maxThroughput: 4000
      }
    }
  }
}

// The private endpoint is taken from the cosmosdb/private-endpoint export
resource privateEndpoint 'Microsoft.Network/privateEndpoints@2022-11-01' = {
  name: privateEndpointName
  location: location
  tags: {}
  properties: {
    privateLinkServiceConnections: [
      {
        name: privateEndpointName
        properties: {
          privateLinkServiceId: cosmosDbAccount.id
          groupIds: [
            'MongoDB'
          ]
          privateLinkServiceConnectionState: {
            status: 'Approved'
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

// Adding the Zone group sets up automatic DNS for the private link. 
resource zoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2022-11-01' = {
  parent: privateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'zoneConfig'
        properties: {
          privateDnsZoneId: mongoDbDnsZoneId
        }
      }
    ]
  }
}

output cosmosDbAccountName string = cosmosDbAccount.name
output cosmosDbDatabaseName string = submissionsDb.name
