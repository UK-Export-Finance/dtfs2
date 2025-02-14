import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';
import { asPartiallyLoggedInUserSession } from '../helpers/express-session';
import { aRequestSession } from '../../test-helpers';
import { validateUser } from './user-validation';
import { LoginController } from '../controllers/login/login-sso/login.controller';

// Mock the isTfmSsoFeatureFlagEnabled function to control SSO feature flag in tests
jest.mock('@ukef/dtfs2-common', (): typeof import('@ukef/dtfs2-common') => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmSsoFeatureFlagEnabled: jest.fn(),
}));

jest.mock('../controllers/login/login-sso/login.controller', () => ({
  LoginController: {
    getLogin: jest.fn(),
  },
}));

describe('validateUser', () => {
  let res: httpMocks.MockResponse<Response>;
  let req: httpMocks.MockRequest<Request>;
  let next: jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when there is a logged in user session', () => {
    beforeEach(() => {
      ({ req, res } = httpMocks.createMocks({ session: aRequestSession() }));
      next = jest.fn();
    });

    it('should call next', async () => {
      // Act
      await validateUser(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });
  });

  const noLoggedInUserSessionTestCases = [
    { description: 'when there is a partially logged in user session', session: asPartiallyLoggedInUserSession },
    { description: 'when there is no user session', session: undefined },
  ];

  describe('when there is no logged in user session', () => {
    describe('when SSO is enabled', () => {
      let getLoginMock: jest.Mock;

      beforeEach(() => {
        jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(true);
        getLoginMock = jest.mocked(LoginController.getLogin);
      });

      describe.each(noLoggedInUserSessionTestCases)('when $description', (session) => {
        beforeEach(() => {
          ({ req, res } = httpMocks.createMocks({ session }));
          next = jest.fn();
        });

        it('should call LoginController.getLogin with the request and response objects', async () => {
          // Act
          await validateUser(req, res, next);

          // Assert
          expect(getLoginMock).toHaveBeenCalledWith(req, res);
        });
      });
    });

    describe('when SSO is disabled', () => {
      beforeEach(() => {
        jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(false);
      });

      describe.each(noLoggedInUserSessionTestCases)('when $description', (session) => {
        beforeEach(() => {
          ({ req, res } = httpMocks.createMocks({ session }));
          next = jest.fn();
        });
        it('should redirect to "/"', async () => {
          // Arrange

          // Act
          await validateUser(req, res, next);

          // Assert
          expect(res._getRedirectUrl()).toEqual('/');
        });
      });
    });
  });
});
