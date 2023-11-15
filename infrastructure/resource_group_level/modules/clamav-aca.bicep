param location string = resourceGroup().location
param environment string
param containerName string
param acaSubnetId string
param logAnalyticsWorkspaceName string

var managedEnvironmentName = 'tfs-${environment}-clamav-env'
var applicationInsightsName = 'tfs-${environment}-clamav-ai'

resource workspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = {
  name: logAnalyticsWorkspaceName
}

resource managedEnvironment 'Microsoft.App/managedEnvironments@2023-05-02-preview' = {
  name: managedEnvironmentName
  location: location
  properties: {
    vnetConfiguration: {
      internal: true
      infrastructureSubnetId: acaSubnetId
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

// TODO: Use our own Registry?

resource clamAvAca 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerName
  location: location
  properties: {
    managedEnvironmentId: managedEnvironment.id
    configuration: {
      ingress: {
        exposedPort: 3310
        targetPort: 3310
        external: false
        transport: 'tcp'
      }
    }
    template: {
      containers: [
        {
          image: 'mkodockx/docker-clamav:alpine'
          name: containerName
          resources: {
            // We need minimal CPU, but 4GiB of memory. 
            // However, currently only some combinations of CPU and memory are allowed.
            // See https://learn.microsoft.com/en-us/azure/container-apps/containers
            cpu: 2
            memory: '4.0Gi'
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
