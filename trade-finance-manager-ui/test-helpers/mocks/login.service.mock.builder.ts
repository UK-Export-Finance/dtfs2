import { aGetAuthCodeUrlResponse, BaseMockBuilder } from '@ukef/dtfs2-common';
import { LoginService } from '../../server/services/login.service';

export class LoginServiceMockBuilder extends BaseMockBuilder<LoginService> {
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
