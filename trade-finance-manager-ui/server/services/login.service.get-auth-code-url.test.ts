import { aGetAuthCodeUrlResponse } from "@ukef/dtfs2-common/test-helpers";
import { LoginService } from './login.service';
import * as api from '../api';

jest.mock('../api');

describe('login service', () => {
  describe('getAuthCodeUrl', () => {
    const getAuthCodeUrlSpy = jest.spyOn(api, 'getAuthCodeUrl');
    const successRedirect = '/';

    afterEach(() => {
      getAuthCodeUrlSpy.mockReset();
    });

    it('should call api.getAuthCodeUrl with the request', async () => {
      // Act
      await LoginService.getAuthCodeUrl({ successRedirect });

      // Assert
      expect(getAuthCodeUrlSpy).toHaveBeenCalledTimes(1);
      expect(getAuthCodeUrlSpy).toHaveBeenCalledWith({ successRedirect });
    });

    describe('when the getAuthCodeUrl api call is successful', () => {
      const mockGetAuthCodeResponse = aGetAuthCodeUrlResponse();

      beforeEach(() => {
        getAuthCodeUrlSpy.mockResolvedValueOnce(mockGetAuthCodeResponse);
      });

      it('should return the auth code url', async () => {
        // Act
        const result = await LoginService.getAuthCodeUrl({ successRedirect });

        // Assert
        expect(result).toEqual(mockGetAuthCodeResponse);
      });
    });

    describe('when the getAuthCodeUrl api call is unsuccessful', () => {
      const error = new Error('getAuthCodeUrl error');

      beforeEach(() => {
        getAuthCodeUrlSpy.mockRejectedValueOnce(error);
      });

      it('should throw the error', async () => {
        // Act & Assert
        await expect(LoginService.getAuthCodeUrl({ successRedirect })).rejects.toThrow(error);
      });
    });
  });
});
