import { CustomExpressRequest, PortalSessionUser } from '@ukef/dtfs2-common';

export type LoginWithSignInOtpResponse = {
  loginStatus?: string;
  token?: string;
  user?: PortalSessionUser;
};

type ValidationErrors = { text: string; href: string };

export type AccessCodeViewModel = {
  attemptsLeft?: number;
  requestNewCodeUrl: string;
  errors?: false | { errorSummary: ValidationErrors[]; fieldErrors: Record<string, ValidationErrors> };
  email?: string;
};

export type AccessCodePageRequestSession = {
  numberOfSignInOtpAttemptsRemaining?: number;
  userId?: string;
  userToken?: string;
  userEmail?: string;
};

export type AccessCodePageRequest = CustomExpressRequest<Record<string, never>> & {
  session: AccessCodePageRequestSession;
  body: {
    signInOTP: string;
    accessCode: string;
  };
};
