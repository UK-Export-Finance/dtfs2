import { BaseMockBuilder } from '@ukef/dtfs2-common';
import { EntraIdConfig } from '../../configs/entra-id.config';

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
