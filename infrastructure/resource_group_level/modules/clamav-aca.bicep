param location string = resourceGroup().location
param environment string
param acaClamAvSubnetId string
param logAnalyticsWorkspaceName string

var managedEnvironmentName = '${product}-${environment}-clamav-env'
var applicationInsightsName = '${product}-${environment}-clamav-ai'
var containerName = '${product}-${environment}-clamav'

resource workspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = {
  name: logAnalyticsWorkspaceName
}

resource managedEnvironment 'Microsoft.App/managedEnvironments@2023-05-02-preview' = {
  name: managedEnvironmentName
  location: location
  properties: {
    vnetConfiguration: {
      internal: true
      infrastructureSubnetId: acaClamAvSubnetId
    }
    workloadProfiles: [
      {
        workloadProfileType: 'Consumption'
        name: 'Consumption'
      }
    ]
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: workspace.properties.customerId
        sharedKey: workspace.listKeys().primarySharedKey
      }
    }
  }
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: workspace.id
  }
}

resource clamAvAca 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerName
  location: location
  properties: {
    managedEnvironmentId: managedEnvironment.id
    configuration: {
      ingress: {
        exposedPort: 3310
        targetPort: 3310
        external: true
        transport: 'tcp'
      }
    }
    template: {
      containers: [
        {
          image: 'mkodockx/docker-clamav:1.1.2-alpine'
          name: containerName
          resources: {
            // We need minimal CPU, but 4GiB of memory. 
            // However, currently only some combinations of CPU and memory are allowed.
            // See https://learn.microsoft.com/en-us/azure/container-apps/containers
            cpu: 2
            memory: '4Gi'
          }          
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

output exposedIp string = managedEnvironment.properties.staticIp
output exposedPort int = clamAvAca.properties.configuration.ingress.exposedPort

output fqdn string = clamAvAca.properties.configuration.ingress.fqdn
