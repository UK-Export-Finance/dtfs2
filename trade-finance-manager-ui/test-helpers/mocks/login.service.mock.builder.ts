import { AuthorizationCodeRequest } from '@azure/msal-node';
import { LoginService } from '../../server/services/login.service';
import { BaseMockBuilder } from './mock-builder.mock.builder';

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
