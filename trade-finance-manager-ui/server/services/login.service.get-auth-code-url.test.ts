import { AuthorizationCodeRequest } from '@azure/msal-node';
import { LoginService } from './login.service';
import * as api from '../api';
import { GetAuthCodeUrlResponse } from '../types/login/get-auth-code';

jest.mock('../api');

describe('login service', () => {
  describe('getAuthCodeUrl', () => {
    const getAuthCodeUrlSpy = jest.spyOn(api, 'getAuthCodeUrl');
    const loginService = new LoginService();
    const successRedirect = '/';

    afterEach(() => {
      getAuthCodeUrlSpy.mockReset();
    });

    it('calls api.getAuthCodeUrl with the request', async () => {
      // Act
      await loginService.getAuthCodeUrl({ successRedirect });

      // Assert
      expect(getAuthCodeUrlSpy).toHaveBeenCalledWith({ successRedirect });
    });

    describe('when the getAuthCodeUrl api call is successful', () => {
      const mockGetAuthCodeResponse: GetAuthCodeUrlResponse = {
        authCodeUrl: 'a-auth-code-url',
        authCodeUrlRequest: {} as AuthorizationCodeRequest,
      };

      beforeEach(() => {
        getAuthCodeUrlSpy.mockResolvedValueOnce(mockGetAuthCodeResponse);
      });

      it('returns the auth code url', async () => {
        // Act
        const result = await loginService.getAuthCodeUrl({ successRedirect });

        // Assert
        expect(result).toEqual(mockGetAuthCodeResponse);
      });
    });

    describe('when the getAuthCodeUrl api call is unsuccessful', () => {
      const error = new Error('getAuthCodeUrl error');

      beforeEach(() => {
        getAuthCodeUrlSpy.mockRejectedValueOnce(error);
      });

      it('throws the error', async () => {
        // Act & Assert
        await expect(loginService.getAuthCodeUrl({ successRedirect })).rejects.toThrow(error);
      });
    });
  });
});
