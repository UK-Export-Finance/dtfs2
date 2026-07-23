import { PortalSessionUser } from '../types';

export type LoginWithSignInOtpResponse = {
  loginStatus?: string;
  token?: string;
  user?: PortalSessionUser;
  isExpired?: boolean;
};

export const OTP_RESULT_TYPE = {
  SUCCESS: 'success',
  INCORRECT_CODE: 'incorrect-code',
  EXPIRED: 'expired',
} as const;

export type OtpLoginResult =
  | { type: typeof OTP_RESULT_TYPE.SUCCESS; loginResponse: LoginWithSignInOtpResponse }
  | { type: typeof OTP_RESULT_TYPE.INCORRECT_CODE }
  | { type: typeof OTP_RESULT_TYPE.EXPIRED };
