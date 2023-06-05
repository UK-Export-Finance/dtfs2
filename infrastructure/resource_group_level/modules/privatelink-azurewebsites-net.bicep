param privateDnsZones_privatelink_azurewebsites_net_name string = 'privatelink.azurewebsites.net'
param virtualNetworks_tfs_dev_vnet_externalid string = '/subscriptions/8beaa40a-2fb6-49d1-b080-ff1871b6276f/resourceGroups/Digital-Dev/providers/Microsoft.Network/virtualNetworks/tfs-dev-vnet'

resource privateDnsZones_privatelink_azurewebsites_net_name_resource 'Microsoft.Network/privateDnsZones@2018-09-01' = {
  name: privateDnsZones_privatelink_azurewebsites_net_name
  location: 'global'
  tags: {
    Environment: 'Preproduction'
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_dtfs_central_api 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-dtfs-central-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.9'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_dtfs_central_api_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-dtfs-central-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.9'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_function_acbs 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-function-acbs'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.6'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_function_acbs_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-function-acbs.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.6'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_function_number_generator 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-function-number-generator'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.16'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_function_number_generator_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-function-number-generator.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.16'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_gef_ui 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-gef-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.14'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_gef_ui_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-gef-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.14'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_portal_api 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-portal-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.12'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_portal_api_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-portal-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.12'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_portal_ui 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-portal-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.13'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_portal_ui_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-portal-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.13'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_reference_data_proxy 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-reference-data-proxy'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.5'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_reference_data_proxy_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-reference-data-proxy.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.5'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_trade_finance_manager_api 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-trade-finance-manager-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.10'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_trade_finance_manager_api_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-trade-finance-manager-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.10'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_trade_finance_manager_ui 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-trade-finance-manager-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.11'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_demo_trade_finance_manager_ui_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-demo-trade-finance-manager-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.60.11'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_dtfs_central_api 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-dtfs-central-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.8'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_dtfs_central_api_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-dtfs-central-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.8'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_function_acbs 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-function-acbs'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.14'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_function_acbs_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-function-acbs.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.14'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_function_number_generator 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-function-number-generator'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.16'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_function_number_generator_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-function-number-generator.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.16'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_gef_ui 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-gef-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.12'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_gef_ui_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-gef-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.12'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_portal_api 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-portal-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.11'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_portal_api_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-portal-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.11'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_portal_ui 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-portal-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.13'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_portal_ui_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-portal-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.13'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_reference_data_proxy 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-reference-data-proxy'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.5'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_reference_data_proxy_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-reference-data-proxy.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.5'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_trade_finance_manager_api 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-trade-finance-manager-api'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.9'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_trade_finance_manager_api_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-trade-finance-manager-api.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.9'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_trade_finance_manager_ui 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-trade-finance-manager-ui'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.10'
      }
    ]
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_tfs_dev_trade_finance_manager_ui_scm 'Microsoft.Network/privateDnsZones/A@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'tfs-dev-trade-finance-manager-ui.scm'
  properties: {
    ttl: 3600
    aRecords: [
      {
        ipv4Address: '172.16.40.10'
      }
    ]
  }
}

resource Microsoft_Network_privateDnsZones_SOA_privateDnsZones_privatelink_azurewebsites_net_name 'Microsoft.Network/privateDnsZones/SOA@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: '@'
  properties: {
    ttl: 3600
    soaRecord: {
      email: 'azureprivatedns-host.microsoft.com'
      expireTime: 2419200
      host: 'azureprivatedns.net'
      minimumTtl: 10
      refreshTime: 3600
      retryTime: 300
      serialNumber: 1
    }
  }
}

resource privateDnsZones_privatelink_azurewebsites_net_name_app_service_dns 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2018-09-01' = {
  parent: privateDnsZones_privatelink_azurewebsites_net_name_resource
  name: 'app-service-dns'
  location: 'global'
  tags: {
    Environment: 'Preproduction'
  }
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: virtualNetworks_tfs_dev_vnet_externalid
    }
  }
}
