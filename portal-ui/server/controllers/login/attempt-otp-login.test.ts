import axios, { HttpStatusCode } from 'axios';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { attemptOtpLogin, OTP_RESULT_TYPE } from './attempt-otp-login';
import * as api from '../../api';

jest.mock('axios');
jest.mock('../../api');

describe('controllers/login/attempt-otp-login', () => {
  const mockToken = 'test-token';
  const mockUserId = 'test-user-id';
  const mockSignInOTP = '123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('attemptOtpLogin', () => {
    it('should return success when login API responds with VALID_2FA status', async () => {
      const mockLoginResponse = {
        loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
        userId: mockUserId,
      };

      jest.spyOn(api, 'loginWithSignInOtp').mockResolvedValue(mockLoginResponse);

      const result = await attemptOtpLogin({ token: mockToken, userId: mockUserId, signInOTP: mockSignInOTP });

      expect(result.type).toBe(OTP_RESULT_TYPE.SUCCESS);
      if (result.type === OTP_RESULT_TYPE.SUCCESS) {
        expect(result.loginResponse).toEqual(mockLoginResponse);
      }
      expect(api.loginWithSignInOtp).toHaveBeenCalledWith({
        token: mockToken,
        userId: mockUserId,
        signInOTP: mockSignInOTP,
      });
      expect(api.loginWithSignInOtp).toHaveBeenCalledTimes(1);
    });

    it('should return incorrect-code when API throws 401 Unauthorized error', async () => {
      const axiosError = {
        response: {
          status: HttpStatusCode.Unauthorized,
        },
      };

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      jest.spyOn(api, 'loginWithSignInOtp').mockRejectedValue(axiosError);

      const result = await attemptOtpLogin({ token: mockToken, userId: mockUserId, signInOTP: mockSignInOTP });

      expect(result.type).toBe(OTP_RESULT_TYPE.INCORRECT_CODE);
    });

    it('should return incorrect-code when API throws 403 Forbidden error', async () => {
      const axiosError = {
        response: {
          status: HttpStatusCode.Forbidden,
        },
      };

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      jest.spyOn(api, 'loginWithSignInOtp').mockRejectedValue(axiosError);

      const result = await attemptOtpLogin({ token: mockToken, userId: mockUserId, signInOTP: mockSignInOTP });

      expect(result.type).toBe(OTP_RESULT_TYPE.INCORRECT_CODE);
    });

    it('should re-throw error when API throws non-401/403 axios error', async () => {
      const axiosError = new Error('Server error');

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      jest.spyOn(api, 'loginWithSignInOtp').mockRejectedValue(axiosError);

      await expect(attemptOtpLogin({ token: mockToken, userId: mockUserId, signInOTP: mockSignInOTP })).rejects.toThrow(axiosError);
    });

    it('should re-throw error when API throws non-axios error', async () => {
      const genericError = new Error('Unexpected error');

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(false);
      jest.spyOn(api, 'loginWithSignInOtp').mockRejectedValue(genericError);

      await expect(attemptOtpLogin({ token: mockToken, userId: mockUserId, signInOTP: mockSignInOTP })).rejects.toThrow(genericError);
    });

    it('should re-throw axios error with 500 status code', async () => {
      const axiosError = {
        response: {
          status: HttpStatusCode.InternalServerError,
        },
      };

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      jest.spyOn(api, 'loginWithSignInOtp').mockRejectedValue(axiosError);

      await expect(attemptOtpLogin({ token: mockToken, userId: mockUserId, signInOTP: mockSignInOTP })).rejects.toEqual(axiosError);
    });

    it('should re-throw error when axios error has no response', async () => {
      const axiosError = {
        message: 'Network error',
      };

      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      jest.spyOn(api, 'loginWithSignInOtp').mockRejectedValue(axiosError);

      await expect(attemptOtpLogin({ token: mockToken, userId: mockUserId, signInOTP: mockSignInOTP })).rejects.toEqual(axiosError);
    });
  });
});
