import { EntraIdConfig } from '../../server/configs/entra-id.config';
import { BaseMockBuilder } from './mock-builder.mock.builder';

export class EntraIdConfigMockBuilder extends BaseMockBuilder<EntraIdConfig> {
  constructor() {
    super({
      defaultInstance: {
        msalAppConfig: {
          auth: {
            clientId: 'a-client-id',
            authority: undefined,
            clientSecret: undefined,
            clientAssertion: undefined,
            clientCertificate: undefined,
            knownAuthorities: undefined,
            cloudDiscoveryMetadata: undefined,
            authorityMetadata: undefined,
            clientCapabilities: undefined,
            protocolMode: undefined,
            azureCloudOptions: undefined,
            skipAuthorityMetadataCache: undefined,
          },
          broker: undefined,
          cache: undefined,
          system: undefined,
          telemetry: undefined,
        },
        authorityMetadataUrl: 'a-authority-metadata-url',
        scopes: ['a-scope'],
        redirectUri: 'a-redirect-uri',
      },
    });
  }
}
