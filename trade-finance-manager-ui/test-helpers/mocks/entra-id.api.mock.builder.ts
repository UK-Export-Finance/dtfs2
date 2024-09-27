import { EntraIdApi } from '../../server/apis/entra-id.api';
import { BaseMockBuilder } from './mock-builder.mock.builder';

export class EntraIdApiMockBuilder extends BaseMockBuilder<EntraIdApi> {
  constructor() {
    super({
      defaultInstance: {
        getAuthorityMetadataUrl: jest.fn().mockResolvedValue({ aMetaDataObject: 'a-meta-data-value' }),
      },
    });
  }
}
