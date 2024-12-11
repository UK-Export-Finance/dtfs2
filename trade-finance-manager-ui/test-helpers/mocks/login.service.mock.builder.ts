import { aGetAuthCodeUrlResponse, BaseMockBuilder } from '@ukef/dtfs2-common';
import { LoginService } from '../../server/services/login.service';
import { aHandleSsoRedirectFormResponse } from '../test-data';

export class LoginServiceMockBuilder extends BaseMockBuilder<LoginService> {
  constructor() {
    super({
      defaultInstance: {
        getAuthCodeUrl: jest.fn(async () => Promise.resolve(aGetAuthCodeUrlResponse())),
        handleSsoRedirectForm: jest.fn(async () => Promise.resolve(aHandleSsoRedirectFormResponse())),
      },
    });
  }
}
