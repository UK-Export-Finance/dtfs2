/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createMocks } from 'node-mocks-http';
import api from '../../api';
import loginController from '.';
import loginService from './loginService';

jest.mock('./loginService');

describe('controllers - login', () => {
  loginService.acceptExternalSsoPost = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST - handleSsoRedirect', () => {
    const requestBody = {
      code: 'test1',
      client_info: 'test2',
      state: 'test3',
      session_state: 'test4',
    };

    it('should call acceptExternalSsoPost if request is without formId', async () => {
      // Arrange
      const { req, res } = createMocks({ body: requestBody });

      // Act
      await loginController.handleSsoRedirect(req, res);

      // Assert
      expect(loginService.acceptExternalSsoPost).toHaveBeenCalledWith(req, res);
    });

    it('should redirect to / if sso pkceCodes are missing in session', async () => {
      // Arrange
      const { req, res } = createMocks({ body: { formId: 'any-value' } });

      // Act
      await loginController.handleSsoRedirect(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/');
      expect(res._getStatusCode()).toEqual(302);
    });

    it('should redirect to / if sso pkceCodes are empty in session', async () => {
      // Arrange
      const { req, res } = createMocks({ session: { auth: { pkceCodes: '' } }, body: { formId: 'any-value' } });

      // Act
      await loginController.handleSsoRedirect(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/');
      expect(res._getStatusCode()).toEqual(302);
    });

    it('should call processSsoRedirect if this is second post from TFM Form', async () => {
      // Arrange
      api.processSsoRedirect = jest.fn(() => {
        const returnVal = {
          token: 'token',
          user: 'user',
          redirectUrl: '/after-login-test-url',
        };
        return Promise.resolve(returnVal);
      });
      const reqData = {
        session: {
          auth: {
            pkceCodes: 'test1',
            authCodeUrlRequest: 'test2',
            authCodeRequest: 'test3',
          },
        },
        body: {
          formId: 'any-value',
          ...requestBody,
        },
      };
      const { req, res } = createMocks(reqData);
      const expectedApiParams = {
        pkceCodes: reqData.session.auth.pkceCodes,
        authCodeUrlRequest: reqData.session.auth.authCodeUrlRequest,
        authCodeRequest: reqData.session.auth.authCodeRequest,
        code: requestBody.code,
        state: requestBody.state,
      };

      // Act
      await loginController.handleSsoRedirect(req, res);

      // Assert
      expect(api.processSsoRedirect).toHaveBeenCalledWith(expectedApiParams);
      expect(res._getRedirectUrl()).toEqual('/after-login-test-url');
      expect(res._getStatusCode()).toEqual(302);
    });
  });
});
