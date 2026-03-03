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
  const mockLoginResponse = {
    loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    userId: mockUserId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('attemptOtpLogin', () => {
    it('should return success when login API responds with VALID_2FA status', async () => {
      jest.spyOn(api, 'loginWithSignInOtp').mockResolvedValue(mockLoginResponse);

      const result = await attemptOtpLogin({ token: mockToken, userId: mockUserId, signInOTP: mockSignInOTP });

      expect(result.type).toBe(OTP_RESULT_TYPE.SUCCESS);
      expect((result as { type: typeof OTP_RESULT_TYPE.SUCCESS; loginResponse: typeof mockLoginResponse }).loginResponse).toEqual(mockLoginResponse);
    });

    it('should call loginWithSignInOtp with correct parameters', async () => {
      jest.spyOn(api, 'loginWithSignInOtp').mockResolvedValue(mockLoginResponse);

      await attemptOtpLogin({ token: mockToken, userId: mockUserId, signInOTP: mockSignInOTP });

      expect(api.loginWithSignInOtp).toHaveBeenCalledWith({
        token: mockToken,
        userId: mockUserId,
        signInOTP: mockSignInOTP,
      });
      expect(api.loginWithSignInOtp).toHaveBeenCalledTimes(1);
    });

    it(`should return incorrect-code when API throws ${HttpStatusCode.Unauthorized} Unauthorized error`, async () => {
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

    it(`should return incorrect-code when API throws ${HttpStatusCode.Forbidden} Forbidden error`, async () => {
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

    it(`should re-throw error when API throws non-${HttpStatusCode.Unauthorized}/${HttpStatusCode.Forbidden} axios error`, async () => {
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

    it(`should re-throw axios error with ${HttpStatusCode.InternalServerError} status code`, async () => {
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
