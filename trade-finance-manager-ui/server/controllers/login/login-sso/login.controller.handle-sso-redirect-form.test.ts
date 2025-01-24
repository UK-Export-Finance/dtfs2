import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import {
  anAuthorisationCodeRequest,
  anEntraIdAuthCodeRedirectResponseBody,
  AuditDetails,
  HandleSsoRedirectFormResponse,
  HandleSsoRedirectFormUiRequest,
  InvalidPayloadError,
  UserPartialLoginDataNotDefinedError,
} from '@ukef/dtfs2-common';
import { Session, SessionData } from 'express-session';
import { Response } from 'express';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { LoginService } from '../../../services/login.service';
import { LoginController } from './login.controller';
import { UserSessionService } from '../../../services/user-session.service';
import { LoginServiceMockBuilder, UserSessionServiceMockBuilder } from '../../../../test-helpers/mocks';
import { aHandleSsoRedirectFormResponse, aTfmSessionUser } from '../../../../test-helpers';
import { PartiallyLoggedInUserSessionData } from '../../../types/express-session';

describe('controllers - login (sso)', () => {
  describe('handleSsoRedirectForm', () => {
    let loginService: LoginService;
    let userSessionService: UserSessionService;
    let loginController: LoginController;

    const handleSsoRedirectFormMock = jest.fn();
    const createLoggedInSessionMock = jest.fn();
    const consoleErrorMock = jest.fn();
    console.error = consoleErrorMock;

    let res: MockResponse<Response>;
    let req: MockRequest<HandleSsoRedirectFormUiRequest>;

    beforeEach(() => {
      jest.resetAllMocks();
      loginService = new LoginServiceMockBuilder().with({ handleSsoRedirectForm: handleSsoRedirectFormMock }).build();
      userSessionService = new UserSessionServiceMockBuilder().with({ createLoggedInSession: createLoggedInSessionMock }).build();
      loginController = new LoginController({ loginService, userSessionService });
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

        it('logs an error', async () => {
          await loginController.handleSsoRedirectForm(req, res);

          expect(consoleErrorMock).toHaveBeenCalledWith('Unable to redirect user after login: %O', expect.any(UserPartialLoginDataNotDefinedError));
        });

        it('renders the problem with service page', async () => {
          await loginController.handleSsoRedirectForm(req, res);

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

        it('logs an error', async () => {
          await loginController.handleSsoRedirectForm(req, res);

          expect(consoleErrorMock).toHaveBeenCalledWith('Unable to redirect user after login: %O', expect.any(InvalidPayloadError));
        });

        it('renders the problem with service page', async () => {
          await loginController.handleSsoRedirectForm(req, res);

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

        it('calls loginService.handleSsoRedirectForm with the correct parameters', async () => {
          await loginController.handleSsoRedirectForm(req, res);

          expect(handleSsoRedirectFormMock).toHaveBeenCalledWith({
            authCodeResponse: req.body,
            originalAuthCodeUrlRequest: validSession.loginData.authCodeUrlRequest,
            auditDetails: expect.objectContaining(generateSystemAuditDetails()) as AuditDetails,
          });
        });

        it('calls loginService.handleSsoRedirectForm once', async () => {
          await loginController.handleSsoRedirectForm(req, res);

          expect(handleSsoRedirectFormMock).toHaveBeenCalledTimes(1);
        });

        describe('when loginService.handleSsoRedirectForm returns an error', () => {
          let thrownError: Error;

          beforeEach(() => {
            thrownError = new Error('handleSsoRedirectForm error');
            handleSsoRedirectFormMock.mockRejectedValueOnce(thrownError);
          });

          it('logs an error', async () => {
            await loginController.handleSsoRedirectForm(req, res);

            expect(consoleErrorMock).toHaveBeenCalledWith('Unable to redirect user after login: %O', thrownError);
          });

          it('renders the problem with service page', async () => {
            await loginController.handleSsoRedirectForm(req, res);

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

            it('updates the session', async () => {
              await loginController.handleSsoRedirectForm(req, res);

              expect(createLoggedInSessionMock).toHaveBeenCalledWith({
                session: req.session,
                user: handleSsoRedirectFormResponse.user,
                userToken: handleSsoRedirectFormResponse.token,
              });
            });

            it('updates the session once', async () => {
              await loginController.handleSsoRedirectForm(req, res);

              expect(createLoggedInSessionMock).toHaveBeenCalledTimes(1);
            });

            it('redirects to the home page', async () => {
              await loginController.handleSsoRedirectForm(req, res);

              expect(res._getRedirectUrl()).toEqual('/');
            });
          });

          describe('when the success redirect parameter is set', () => {
            let handleSsoRedirectFormResponse: HandleSsoRedirectFormResponse;

            beforeEach(() => {
              handleSsoRedirectFormResponse = aHandleSsoRedirectFormResponse();
              handleSsoRedirectFormMock.mockResolvedValueOnce(handleSsoRedirectFormResponse);
            });

            it('updates the session', async () => {
              await loginController.handleSsoRedirectForm(req, res);

              expect(createLoggedInSessionMock).toHaveBeenCalledWith({
                session: req.session,
                user: handleSsoRedirectFormResponse.user,
                userToken: handleSsoRedirectFormResponse.token,
              });
            });

            it('updates the session once', async () => {
              await loginController.handleSsoRedirectForm(req, res);

              expect(createLoggedInSessionMock).toHaveBeenCalledTimes(1);
            });

            it('redirects to the success redirect parameter', async () => {
              await loginController.handleSsoRedirectForm(req, res);

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
