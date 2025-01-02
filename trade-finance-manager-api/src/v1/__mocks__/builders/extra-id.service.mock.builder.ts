import { anAuthorisationCodeRequest, anEntraIdUser, BaseMockBuilder } from '@ukef/dtfs2-common';
import { EntraIdService } from '../../services/entra-id.service';

export class EntraIdServiceMockBuilder extends BaseMockBuilder<EntraIdService> {
  constructor() {
    super({
      defaultInstance: {
        getAuthCodeUrl: jest.fn(async () => {
          return Promise.resolve({
            authCodeUrl: 'a-auth-code-url',
            authCodeUrlRequest: anAuthorisationCodeRequest(),
          });
        }),
        handleRedirect: jest.fn(async () => {
          return Promise.resolve({
            entraIdUser: anEntraIdUser(),
            successRedirect: 'a-success-redirect',
          });
        }),
      },
    });
  }
}
