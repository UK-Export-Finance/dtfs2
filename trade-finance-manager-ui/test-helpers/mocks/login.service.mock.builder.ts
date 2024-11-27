import { AuthorizationCodeRequest } from '@azure/msal-node';
import { BaseMockBuilder } from '@ukef/dtfs2-common';
import { LoginService } from '../../server/services/login.service';

export class LoginServiceMockBuilder extends BaseMockBuilder<LoginService> {
  constructor() {
    super({
      defaultInstance: {
        getAuthCodeUrl: jest.fn(async () => {
          return Promise.resolve({
            authCodeUrl: 'a-auth-code-url',
            authCodeUrlRequest: {} as AuthorizationCodeRequest,
          });
        }),
      },
    });
  }
}
