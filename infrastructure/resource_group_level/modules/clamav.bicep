param location string = resourceGroup().location
param containerName string = 'clamav'


resource containerInstanceClamAv 'Microsoft.ContainerInstance/containerGroups@2023-05-01' = {
  location: location
  name: containerName
  properties: {
    sku: 'Standard'
    containers: [
      {
        name: containerName
        properties: {
          image: 'mkodockx/docker-clamav:alpine'
          resources: {
            requests: {
              cpu: 1
              memoryInGB: 4
            }
          }
          ports: [
            {
              port: 3310
              protocol: 'TCP'
            }
          ]
        }
      }
    ]
    osType: 'Linux'
    restartPolicy: 'OnFailure'
    ipAddress: {
      ports: [
        {
          port: 3310
          protocol: 'TCP'
        }
      ]
      type: 'Public'
      // dnsNameLabel: containerName
    }
  }
}

output containerInstanceIpV4Address string = containerInstanceClamAv.properties.ipAddress.ip
output containerInstancePort int = containerInstanceClamAv.properties.ipAddress.ports[0].port

