import { aGetAuthCodeUrlResponse, anEntraIdUser, BaseMockBuilder } from '@ukef/dtfs2-common';
import { EntraIdService } from '../../services/entra-id.service';

export class EntraIdServiceMockBuilder extends BaseMockBuilder<EntraIdService> {
  constructor() {
    super({
      defaultInstance: {
        getAuthCodeUrl: jest.fn(async () => Promise.resolve(aGetAuthCodeUrlResponse())),
        handleRedirect: jest.fn(async () =>
          Promise.resolve({
            entraIdUser: anEntraIdUser(),
            successRedirect: 'a-success-redirect',
          }),
        ),
      },
    });
  }
}
