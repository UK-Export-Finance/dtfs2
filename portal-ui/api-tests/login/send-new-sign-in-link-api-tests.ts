import { resetAllWhenMocks, when } from 'jest-when';
import { ROLES } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/api-test';
import extractSessionCookie from '../helpers/extractSessionCookie';
import type { SessionCookieResponse, RequestHeaders, ApiResponse } from '../types';
import mockLogin from '../helpers/login';
import app from '../../server/createApp';
import * as api from '../../server/api';
import { withPartial2faAuthValidationApiTests } from '../common-tests/partial-2fa-auth-validation-api-tests';
import { withRoleValidationApiTests } from '../common-tests/role-validation-api-tests';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common'),
  verify: jest.fn((_req: unknown, _res: unknown, next: () => void): void => {
    next();
  }),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => false,
  validatePartialAuthToken: jest.fn(),
}));

export const withSendNewSignInLinkApiTests = (endpoint: string) => {
  describe(`POST /login/${endpoint}`, () => {
    const { post } = createApi(app);
    const mockedLogin = api.login as jest.Mock;
    const mockedValidatePartialAuthToken = api.validatePartialAuthToken as jest.Mock;
    const mockedSendSignInLink = api.sendSignInLink as jest.Mock;
    const extractSessionCookieAsFn = extractSessionCookie as (response: SessionCookieResponse) => string;
    const extractSessionCookieTyped = (response: unknown): string => extractSessionCookieAsFn(response as SessionCookieResponse);
    const allRoles: string[] = Object.values(ROLES) as string[];

    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers?: RequestHeaders) => post({}, headers).to(`/login/${endpoint}`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: '/login/check-your-email' },
    });

    withPartial2faAuthValidationApiTests({
      makeRequestWithHeaders: (headers?: RequestHeaders) => post({}, headers).to(`/login/${endpoint}`),
      validateResponseWasSuccessful: (response: ApiResponse) => {
        expect(response.status).toEqual(302);
        expect(response.headers.location).toEqual('/login/check-your-email');
      },
    });

    describe('with a valid partial auth token', () => {
      const partialAuthToken = 'partial auth token';
      const email = 'email@example.com';
      const password = 'a password';
      const numberOfSendSignInLinkAttemptsRemaining = 1;
      let sessionCookie: string;
      beforeEach(async () => {
        resetAllWhenMocks();
        jest.clearAllMocks();
        mockedLogin.mockImplementation(mockLogin(partialAuthToken));
        sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookieTyped);
        when(mockedValidatePartialAuthToken)
          .calledWith(partialAuthToken)
          .mockResolvedValueOnce({} as any);
      });

      describe('when the user does not have a session', () => {
        beforeEach(() => {
          mockSuccessfulSendSignInLinkResponse();
        });

        it('should not send a new sign in link', async () => {
          mockedSendSignInLink.mockClear();
          await post({}).to(`/login/${endpoint}`);

          expect(mockedSendSignInLink).not.toHaveBeenCalled();
        });

        it('should redirect the user to /login', async () => {
          const { status, headers } = await post({}).to(`/login/${endpoint}`);

          expect(status).toEqual(302);
          expect(headers.location).toEqual('/login');
        });
      });

      describe.each([
        {
          description: 'when a user is not blocked',
          beforeEachSetUp: () => {
            mockSuccessfulSendSignInLinkResponse();
          },
        },
        {
          description: 'when a user is blocked',
          beforeEachSetUp: () => {
            mock403SendSignInLinkResponse();
          },
        },
        {
          description: 'when sending an email fails',
          beforeEachSetUp: () => {
            mock500SendSignInLinkResponse();
          },
        },
      ])('$description', ({ beforeEachSetUp }) => {
        beforeEach(() => {
          beforeEachSetUp();
        });

        itRedirectsTheUserToCheckYourEmail();
        itSendsANewSignInLink();
      });

      function itRedirectsTheUserToCheckYourEmail() {
        it('should redirect the user to /login/check-your-email', async () => {
          const { status, headers } = await post({}, { Cookie: sessionCookie }).to('/login/check-your-email');

          expect(status).toEqual(302);
          expect(headers.location).toEqual('/login/check-your-email');
        });
      }

      function itSendsANewSignInLink() {
        it('should send a new sign in link', async () => {
          mockedSendSignInLink.mockClear();
          await post({}, { Cookie: sessionCookie }).to(`/login/${endpoint}`);

          expect(mockedSendSignInLink).toHaveBeenCalledTimes(1);
          expect(mockedSendSignInLink).toHaveBeenCalledWith(partialAuthToken);
        });
      }

      function mockSuccessfulSendSignInLinkResponse() {
        when(mockedSendSignInLink).calledWith(expect.anything()).mockResolvedValue({ data: { numberOfSendSignInLinkAttemptsRemaining } });
      }

      function mockUnsuccessfulSendSignInLinkResponseWithStatusCode(statusCode: number) {
        const error = new Error(`Request failed with status: ${statusCode}`) as Error & { response?: { status: number } };
        error.response = { status: statusCode };
        when(mockedSendSignInLink).calledWith(expect.anything()).mockRejectedValue(error);
      }

      function mock403SendSignInLinkResponse() {
        mockUnsuccessfulSendSignInLinkResponseWithStatusCode(403);
      }

      function mock500SendSignInLinkResponse() {
        mockUnsuccessfulSendSignInLinkResponseWithStatusCode(500);
      }
    });
  });
};
