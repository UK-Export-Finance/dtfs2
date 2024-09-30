import { EntraIdConfig } from '../../server/configs/entra-id.config';
import { BaseMockBuilder } from './mock-builder.mock.builder';

export class EntraIdConfigMockBuilder extends BaseMockBuilder<EntraIdConfig> {
  constructor() {
    super({
      defaultInstance: {
        msalAppConfig: {
          auth: {
            clientId: 'a-client-id',
          },
        },
        authorityMetadataUrl: 'a-authority-metadata-url',
        scopes: ['a-scope'],
        redirectUri: 'a-redirect-uri',
      },
    });
  }
}
