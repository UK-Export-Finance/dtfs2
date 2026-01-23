param location string
param appServicePlanEgressSubnetId string
param mongoDbDnsZoneId string
param privateEndpointsSubnetId string
param databaseName string
param product string
param target string
param version string


@description('Network IPs to permit access to CosmosDB')
@secure()
param allowedIpsString string
@secure()
param azurePortalIpsString string

@allowed(['Provisioned Throughput', 'Serverless'])
param capacityMode string

@allowed(['Continuous7Days', 'Continuous30Days'])
param backupPolicyTier string

var cosmosDbAccountName = '${product}-${target}-${version}-mongo'
var privateEndpointName = '${product}-${target}-${version}-mongo'


var allowedIps = json(allowedIpsString)
var azureAllowedIps = json(azurePortalIpsString)

var allAllowedIps = concat(allowedIps, azureAllowedIps)

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


resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
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
      totalThroughputLimit: 8500
    }

  }
}


resource submissionsDb 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2025-05-01-preview' = {
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
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
      options: {
        throughput: 400 
      }
    }
  }
  {
    name: 'utilisationData'
    properties: {
      resource: {
        id: 'utilisationData'
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
      options: {
        throughput: 400 
      }
    }
  }
  {
    name: 'utilisationReports'
    properties: {
      resource: {
        id: 'utilisationReports'
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
      options: {
        throughput: 400 
      }
    }
  }
]

@batchSize(4)
resource collections 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases/collections@2024-11-15' = [for collection in collectionsArray: {
  parent: submissionsDb
  name: collection.name
  properties: collection.properties
}]


/*  The private endpoint is taken from the cosmosdb/private-endpoint export */
resource privateEndpoint 'Microsoft.Network/privateEndpoints@2024-10-01' = {
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
        }
      }
    ]
    manualPrivateLinkServiceConnections: []
    subnet: {
      id: privateEndpointsSubnetId
    }
    ipConfigurations: []
  }
}

/* Adding the Zone group sets up automatic DNS for the private link. */
resource zoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-10-01' = {
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
