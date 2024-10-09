import httpMocks, { MockResponse } from 'node-mocks-http';
import { resetAllWhenMocks } from 'jest-when';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';
import { CustomExpressRequest, InvalidPayloadError } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { UnauthenticatedAuthController } from './unauthenticated-auth.controller';
import { EntraIdAuthCodeRedirectResponseBody } from '../../../types/entra-id';

jest.mock('@ukef/dtfs2-common/payload-verification', () => ({
  isVerifiedPayload: jest.fn(),
}));

describe('controllers - unauthenticated auth (sso)', () => {
  let unauthenticatedAuthController: UnauthenticatedAuthController;
  let res: MockResponse<Response>;
  let req: CustomExpressRequest<{ reqBody: EntraIdAuthCodeRedirectResponseBody }>;
  const mockBody = {
    test: 'test',
  };

  beforeEach(() => {
    resetAllWhenMocks();
    jest.resetAllMocks();

    ({ res, req } = getHttpMocks());
    unauthenticatedAuthController = new UnauthenticatedAuthController();
  });

  describe('postSsoRedirect', () => {
    it('throws an error if body validation fails', () => {
      jest.mocked(isVerifiedPayload).mockReturnValue(false);

      expect(() => unauthenticatedAuthController.postSsoRedirect(req, res)).toThrow('Invalid payload from SSO redirect');
      expect(() => unauthenticatedAuthController.postSsoRedirect(req, res)).toThrow(InvalidPayloadError);
    });

    it('should render sso/accept-sso-redirect.njk with req.body when validation passes', () => {
      jest.mocked(isVerifiedPayload).mockReturnValue(true);

      unauthenticatedAuthController.postSsoRedirect(req, res);

      expect(res._getRenderView()).toBe('sso/accept-sso-redirect.njk');
      expect(res._getRenderData()).toBe(mockBody);
    });
  });

  function getHttpMocks() {
    return httpMocks.createMocks({ body: mockBody });
  }
});
