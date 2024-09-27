import { AuthorizationCodeRequest } from '@azure/msal-node';
import { EntraIdService } from '../../server/services/entra-id.service';
import { BaseMockBuilder } from './mock-builder.mock';

export class EntraIdServiceMockBuilder extends BaseMockBuilder<EntraIdService> {
  constructor() {
    super({
      defaultInstance: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
