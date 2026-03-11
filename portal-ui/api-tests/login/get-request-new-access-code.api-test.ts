import { createApi } from '@ukef/dtfs2-common/api-test';
import app from '../../server/createApp';
import { withPartial2faAuthValidationApiTests } from '../common-tests/partial-2fa-auth-validation-api-tests';

const { get } = createApi(app);

type RequestHeaders = {
  Cookie: string | string[];
};

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common'),
  verify: jest.fn((_req: unknown, _res: unknown, next: () => void): void => {
    next();
  }),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInOTP: jest.fn(),
  loginWithSignInOtp: jest.fn(),
  validatePortal2FAEnabled: jest.fn(),
  validateToken: () => false,
  validatePartialAuthToken: jest.fn(),
}));

describe('GET /login/request-new-access-code', () => {
  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers?: RequestHeaders) => get('/login/request-new-access-code', {}, headers),
    validateResponseWasSuccessful: (response: { status: number }) => expect(response.status).toEqual(302),
    numberOfSignInOtpAttemptsRemaining: 2,
  });
});
