import httpMocks, { MockResponse } from 'node-mocks-http';
import { resetAllWhenMocks } from 'jest-when';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';
import { CustomExpressRequest, EntraIdAuthCodeRedirectResponseBody, InvalidPayloadError } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { LoginController } from './login.controller';

jest.mock('@ukef/dtfs2-common/payload-verification', () => ({
  isVerifiedPayload: jest.fn(),
}));

describe('controllers - unauthenticated auth (sso)', () => {
  let res: MockResponse<Response>;
  let req: CustomExpressRequest<{ reqBody: EntraIdAuthCodeRedirectResponseBody }>;
  const mockBody = {
    client_info: 'mock client info',
    code: 'mock code',
    session_state: 'mock session state',
    state: 'mock state',
  };

  beforeEach(() => {
    resetAllWhenMocks();
    jest.resetAllMocks();

    ({ res, req } = getHttpMocks());
  });

  describe('postSsoRedirect', () => {
    it('should throw an error if body validation fails', () => {
      jest.mocked(isVerifiedPayload).mockReturnValue(false);

      expect(() => LoginController.postSsoRedirect(req, res)).toThrow('Invalid payload from SSO redirect');
      expect(() => LoginController.postSsoRedirect(req, res)).toThrow(InvalidPayloadError);
    });

    it('should render sso/accept-sso-redirect.njk with mapped parameters when validation passes', () => {
      jest.mocked(isVerifiedPayload).mockReturnValue(true);

      LoginController.postSsoRedirect(req, res);

      expect(res._getRenderView()).toEqual('auth/accept-sso-redirect.njk');
      expect(res._getRenderData()).toEqual({
        clientInfo: mockBody.client_info,
        state: mockBody.state,
        sessionState: mockBody.session_state,
        code: mockBody.code,
      });
    });
  });

  function getHttpMocks() {
    return httpMocks.createMocks({ body: mockBody });
  }
});
