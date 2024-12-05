import { BaseMockBuilder } from '@ukef/dtfs2-common';
import { EntraIdApi } from '../../third-party-apis/entra-id.api';

export class EntraIdApiMockBuilder extends BaseMockBuilder<EntraIdApi> {
  constructor() {
    super({
      defaultInstance: {
        getAuthorityMetadataUrl: jest.fn().mockResolvedValue({ aMetaDataObject: 'a-meta-data-value' }),
      },
    });
  }
}
