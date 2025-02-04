import { aGetAuthCodeUrlResponse, BaseMockBuilder } from '@ukef/dtfs2-common';
import { EntraIdService } from '../../services/entra-id.service';

export class EntraIdServiceMockBuilder extends BaseMockBuilder<EntraIdService> {
  constructor() {
    super({
      defaultInstance: {
        getAuthCodeUrl: jest.fn(async () => {
          return Promise.resolve(aGetAuthCodeUrlResponse());
        }),
      },
    });
  }
}
