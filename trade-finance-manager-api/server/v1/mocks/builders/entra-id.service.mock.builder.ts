import { aGetAuthCodeUrlResponse, BaseMockBuilder } from '@ukef/dtfs2-common/test-helpers';
import { EntraIdService } from '../../services/entra-id.service';
import { aHandleRedirectResponse } from '../../../../test-helpers';

export class EntraIdServiceMockBuilder extends BaseMockBuilder<EntraIdService> {
  constructor() {
    super({
      defaultInstance: {
        getAuthCodeUrl: jest.fn(async () => {
          return Promise.resolve(aGetAuthCodeUrlResponse());
        }),
        handleRedirect: jest.fn(async () => {
          return Promise.resolve(aHandleRedirectResponse());
        }),
      },
    });
  }
}
