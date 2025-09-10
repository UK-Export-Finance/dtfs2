import { anAuthorisationCodeRequest, anEntraIdAuthCodeRedirectResponseBody } from "@ukef/dtfs2-common/test-helpers";
import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import {
  AuditDetails,
  HandleSsoRedirectFormResponse,
  HandleSsoRedirectFormUiRequest,
  InvalidPayloadError,
  UserPartialLoginDataNotDefinedError,
} from '@ukef/dtfs2-common';
import { Session, SessionData } from 'express-session';
import { Response } from 'express';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { LoginController } from './login.controller';
import { aHandleSsoRedirectFormResponse, aTfmSessionUser } from '../../../../test-helpers';
import { PartiallyLoggedInUserSessionData } from '../../../types/express-session';
import { UserSessionService } from '../../../services/user-session.service';
import { LoginService } from '../../../services/login.service';

jest.mock('../../../services/login.service', () => ({
  LoginService: {
    handleSsoRedirectForm: jest.fn(),
  },
}));

jest.mock('../../../services/user-session.service', () => ({
  UserSessionService: {
    createLoggedInSession: jest.fn(),
  },
}));

describe('controllers - login (sso)', () => {
  describe('handleSsoRedirectForm', () => {
    const handleSsoRedirectFormMock = jest.mocked(LoginService.handleSsoRedirectForm);
    const createLoggedInSessionMock = jest.mocked(UserSessionService.createLoggedInSession);
    const consoleErrorMock = jest.fn();
    console.error = consoleErrorMock;

    let res: MockResponse<Response>;
    let req: MockRequest<HandleSsoRedirectFormUiRequest>;

    beforeEach(() => {
      jest.resetAllMocks();
    });

    describe('when the user does not have an active partially logged in session', () => {
      describe.each([
        {
          description: 'no user data',
          session: {},
        },
        {
          description: 'logged in user data',
          session: {
            user: aTfmSessionUser(),
            userToken: 'token',
          },
        },
      ])('when the session has $description', ({ session }) => {
        beforeEach(() => {
          ({ req, res } = getHttpMocks({
            session: session as Session & Partial<SessionData>,
            body: aValidRequestBody(),
          }));
        });

        it('should log an error', async () => {
          await LoginController.handleSsoRedirectForm(req, res);

          expect(consoleErrorMock).toHaveBeenCalledWith('Unable to redirect the user after login %o', expect.any(UserPartialLoginDataNotDefinedError));
        });

        it('should render the problem with service page', async () => {
          await LoginController.handleSsoRedirectForm(req, res);

          expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
        });
      });
    });

    describe('when the user has an active partially logged in session', () => {
      let validSession: PartiallyLoggedInUserSessionData;

      beforeEach(() => {
        validSession = {
          loginData: {
            authCodeUrlRequest: anAuthorisationCodeRequest(),
          },
        };
      });

      describe('when the payload is not verified', () => {
        beforeEach(() => {
          ({ req, res } = getHttpMocks({
            session: validSession as Session & Partial<SessionData>,
            body: { invalidBody: 'invalid-body' } as unknown as HandleSsoRedirectFormUiRequest['body'],
          }));
        });

        it('should log an error', async () => {
          await LoginController.handleSsoRedirectForm(req, res);

          expect(consoleErrorMock).toHaveBeenCalledWith('Unable to redirect the user after login %o', expect.any(InvalidPayloadError));
        });

        it('should render the problem with service page', async () => {
          await LoginController.handleSsoRedirectForm(req, res);

          expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
        });
      });

      describe('when the payload is verified', () => {
        beforeEach(() => {
          ({ req, res } = getHttpMocks({
            session: validSession as Session & Partial<SessionData>,
            body: aValidRequestBody(),
          }));
        });

        it('should call loginService.handleSsoRedirectForm with the correct parameters', async () => {
          await LoginController.handleSsoRedirectForm(req, res);

          expect(handleSsoRedirectFormMock).toHaveBeenCalledWith({
            authCodeResponse: req.body,
            originalAuthCodeUrlRequest: validSession.loginData.authCodeUrlRequest,
            auditDetails: expect.objectContaining(generateSystemAuditDetails()) as AuditDetails,
          });
        });

        it('should call loginService.handleSsoRedirectForm once', async () => {
          await LoginController.handleSsoRedirectForm(req, res);

          expect(handleSsoRedirectFormMock).toHaveBeenCalledTimes(1);
        });

        describe('when loginService.handleSsoRedirectForm returns an error', () => {
          let thrownError: Error;

          beforeEach(() => {
            thrownError = new Error('handleSsoRedirectForm error');
            handleSsoRedirectFormMock.mockRejectedValueOnce(thrownError);
          });

          it('should log an error', async () => {
            await LoginController.handleSsoRedirectForm(req, res);

            expect(consoleErrorMock).toHaveBeenCalledWith('Unable to redirect the user after login %o', thrownError);
            expect(consoleErrorMock).toHaveBeenCalledWith('Unable to redirect the user after login %o', thrownError);
          });

          it('should render the problem with service page', async () => {
            await LoginController.handleSsoRedirectForm(req, res);

            expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
          });
        });

        describe('when loginService.handleSsoRedirectForm resolves', () => {
          describe('when the success redirect parameter is not set', () => {
            let handleSsoRedirectFormResponse: HandleSsoRedirectFormResponse;

            beforeEach(() => {
              handleSsoRedirectFormResponse = aHandleSsoRedirectFormResponse();
              delete handleSsoRedirectFormResponse.successRedirect;
              handleSsoRedirectFormMock.mockResolvedValueOnce(handleSsoRedirectFormResponse);
            });

            it('should update the session', async () => {
              await LoginController.handleSsoRedirectForm(req, res);

              expect(createLoggedInSessionMock).toHaveBeenCalledWith({
                session: req.session,
                user: handleSsoRedirectFormResponse.user,
                userToken: handleSsoRedirectFormResponse.token,
              });
            });

            it('should update the session once', async () => {
              await LoginController.handleSsoRedirectForm(req, res);

              expect(createLoggedInSessionMock).toHaveBeenCalledTimes(1);
            });

            it('should redirect to the home page', async () => {
              await LoginController.handleSsoRedirectForm(req, res);

              expect(res._getRedirectUrl()).toEqual('/');
            });
          });

          describe('when the success redirect parameter is set', () => {
            let handleSsoRedirectFormResponse: HandleSsoRedirectFormResponse;

            beforeEach(() => {
              handleSsoRedirectFormResponse = aHandleSsoRedirectFormResponse();
              handleSsoRedirectFormMock.mockResolvedValueOnce(handleSsoRedirectFormResponse);
            });

            it('should update the session', async () => {
              await LoginController.handleSsoRedirectForm(req, res);

              expect(createLoggedInSessionMock).toHaveBeenCalledWith({
                session: req.session,
                user: handleSsoRedirectFormResponse.user,
                userToken: handleSsoRedirectFormResponse.token,
              });
            });

            it('should update the session once', async () => {
              await LoginController.handleSsoRedirectForm(req, res);

              expect(createLoggedInSessionMock).toHaveBeenCalledTimes(1);
            });

            it('should redirect to the success redirect parameter', async () => {
              await LoginController.handleSsoRedirectForm(req, res);

              expect(res._getRedirectUrl()).toEqual(handleSsoRedirectFormResponse.successRedirect);
            });
          });
        });
      });
    });

    function getHttpMocks({ session, body }: { session: Session & Partial<SessionData>; body: HandleSsoRedirectFormUiRequest['body'] }) {
      return httpMocks.createMocks<HandleSsoRedirectFormUiRequest>({
        session,
        body,
      });
    }

    function aValidRequestBody(): HandleSsoRedirectFormUiRequest['body'] {
      return anEntraIdAuthCodeRedirectResponseBody();
    }
  });
});
