import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import {
  anAuthorisationCodeRequest,
  anEntraIdAuthCodeRedirectResponseBody,
  AuditDetails,
  HandleSsoRedirectFormApiRequest,
  HandleSsoRedirectFormApiResponse,
  HandleSsoRedirectFormRequest,
  withApiErrorTests,
} from '@ukef/dtfs2-common';
import { generateSystemAuditDetails, generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { TFM_SESSION_USER_SCHEMA } from '@ukef/dtfs2-common/schemas';
import { aHandleRedirectResponse, anUpsertTfmUserFromEntraIdUserResponse } from '../../../test-helpers';
import { EntraIdServiceMockBuilder, UserServiceMockBuilder } from '../__mocks__/builders';
import { EntraIdService, HandleRedirectResponse } from '../services/entra-id.service';
import { UpsertTfmUserFromEntraIdUserResponse, UserService } from '../services/user.service';
import { SsoController } from './sso.controller';
import utils from '../../utils/crypto.util';

describe('SsoController', () => {
  describe('handleSsoRedirectForm', () => {
    let entraIdService: EntraIdService;
    let userService: UserService;
    let ssoController: SsoController;
    let req: MockRequest<HandleSsoRedirectFormApiRequest>;
    let res: MockResponse<HandleSsoRedirectFormApiResponse>;

    const handleRedirectMock = jest.fn();
    const upsertTfmUserFromEntraIdUserMock = jest.fn();
    const saveUserLoginInformationMock = jest.fn();

    /**
     * This is to allow us to assert the response from issuing the JWT, as
     * without mocking, the function is not idempotent and will return different values
     */
    const issueJWTMock = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
      entraIdService = new EntraIdServiceMockBuilder().withDefaults().with({ handleRedirect: handleRedirectMock }).build();
      userService = new UserServiceMockBuilder()
        .withDefaults()
        .with({ upsertTfmUserFromEntraIdUser: upsertTfmUserFromEntraIdUserMock, saveUserLoginInformation: saveUserLoginInformationMock })
        .build();
      ssoController = new SsoController({ entraIdService, userService });

      utils.issueJWT = issueJWTMock;
    });

    describe('when the audit details are invalid', () => {
      describe('when the audit details are in an incorrect format', () => {
        beforeEach(() => {
          const incorrectTypeOfAuditDetails = generateTfmAuditDetails(new ObjectId()) as unknown as AuditDetails<'system'>;
          ({ req, res } = getHttpMocksWithBody({
            ...aValidRequest(),
            auditDetails: incorrectTypeOfAuditDetails,
          }));
        });

        it('should return a 400 with error details', async () => {
          // Act
          await ssoController.handleSsoRedirectForm(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(400);
          expect(res._getData()).toEqual({
            status: 400,
            message: "Failed to handle redirect form: Supplied auditDetails 'userType' must be 'system' (was 'tfm')",
            code: 'INVALID_AUDIT_DETAILS',
          });
        });
      });

      describe('when the audit details are not valid', () => {
        beforeEach(() => {
          const invalidAuditDetails = { invalidAuditDetailParam: 'invalid field' } as unknown as AuditDetails<'system'>;
          ({ req, res } = getHttpMocksWithBody({
            ...aValidRequest(),
            auditDetails: invalidAuditDetails,
          }));
        });

        it('should return a 400 with error details', async () => {
          // Act
          await ssoController.handleSsoRedirectForm(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(400);
          expect(res._getData()).toEqual({
            status: 400,
            message: "Failed to handle redirect form: Supplied auditDetails must contain a 'userType' property",
            code: 'INVALID_AUDIT_DETAILS',
          });
        });
      });
    });

    describe('when the audit details are valid', () => {
      describe('when the payload is invalid', () => {
        beforeEach(() => {
          const invalidPayload = { invalidPayloadParam: 'invalid field' };
          ({ req, res } = getHttpMocksWithBody({
            ...aValidRequest(),
            authCodeResponse: invalidPayload as unknown as HandleSsoRedirectFormRequest['authCodeResponse'],
          }));
        });

        it('should return a 400 with error details', async () => {
          // Act
          await ssoController.handleSsoRedirectForm(req, res);

          // Assert
          expect(res._getStatusCode()).toEqual(400);
          expect(res._getData()).toEqual({
            status: 400,
            message: 'Failed to handle redirect form: Invalid payload from SSO redirect',
          });
        });
      });
    });

    describe('when the payload is valid', () => {
      beforeEach(() => {
        ({ req, res } = getHttpMocksWithBody({
          ...aValidRequest(),
        }));
      });

      it('should call handleRedirect with the correct params', async () => {
        // Act
        await ssoController.handleSsoRedirectForm(req, res);

        // Assert
        expect(handleRedirectMock).toHaveBeenCalledWith({
          authCodeResponse: req.body.authCodeResponse,
          originalAuthCodeUrlRequest: req.body.originalAuthCodeUrlRequest,
        });
      });

      it('should call handleRedirect once', async () => {
        // Act
        await ssoController.handleSsoRedirectForm(req, res);

        // Assert
        expect(handleRedirectMock).toHaveBeenCalledTimes(1);
      });

      describe('when handling the redirect is unsuccessful', () => {
        withApiErrorTests({
          makeRequest: async () => await ssoController.handleSsoRedirectForm(req, res),
          mockAnError: (error: unknown) => handleRedirectMock.mockRejectedValue(error),
          getRes: () => res,
          endpointErrorMessage: 'Failed to handle redirect form',
        });
      });

      describe('when handling the redirect is successful', () => {
        let handleRedirectResponse: HandleRedirectResponse;

        beforeEach(() => {
          handleRedirectResponse = aHandleRedirectResponse();
          handleRedirectMock.mockResolvedValue(handleRedirectResponse);
        });

        it('should call upsertTfmUserFromEntraIdUser with the correct params', async () => {
          // Act
          await ssoController.handleSsoRedirectForm(req, res);

          // Assert
          expect(upsertTfmUserFromEntraIdUserMock).toHaveBeenCalledWith({
            entraIdUser: handleRedirectResponse.entraIdUser,
            auditDetails: req.body.auditDetails,
          });
        });

        it('should call upsertTfmUserFromEntraIdUser once', async () => {
          // Act
          await ssoController.handleSsoRedirectForm(req, res);

          // Assert
          expect(upsertTfmUserFromEntraIdUserMock).toHaveBeenCalledTimes(1);
        });

        describe('when upserting the user is unsuccessful', () => {
          withApiErrorTests({
            makeRequest: async () => {
              ({ req, res } = getHttpMocksWithBody({
                ...aValidRequest(),
              }));
              return await ssoController.handleSsoRedirectForm(req, res);
            },
            mockAnError: (error: unknown) => upsertTfmUserFromEntraIdUserMock.mockRejectedValue(error),
            getRes: () => res,
            endpointErrorMessage: 'Failed to handle redirect form',
          });
        });

        describe('when upserting the user is successful', () => {
          let upsertTfmUserFromEntraIdUserResponse: UpsertTfmUserFromEntraIdUserResponse;

          beforeEach(() => {
            upsertTfmUserFromEntraIdUserResponse = anUpsertTfmUserFromEntraIdUserResponse();
            upsertTfmUserFromEntraIdUserMock.mockResolvedValue(upsertTfmUserFromEntraIdUserResponse);
          });

          it('should call issueJWT with the correct params', async () => {
            // Act
            await ssoController.handleSsoRedirectForm(req, res);

            // Assert
            expect(issueJWTMock).toHaveBeenCalledWith(upsertTfmUserFromEntraIdUserResponse);
          });

          it('should call issueJWT once', async () => {
            // Act
            await ssoController.handleSsoRedirectForm(req, res);

            // Assert
            expect(issueJWTMock).toHaveBeenCalledTimes(1);
          });

          describe('when issuing the JWT is successful', () => {
            let issueJWTMockResponse: {
              token: string;
              expires: string;
              sessionIdentifier: string;
            };

            beforeEach(() => {
              issueJWTMockResponse = {
                token: 'a-token',
                expires: 'a-expires',
                sessionIdentifier: 'a-session-identifier',
              };

              issueJWTMock.mockReturnValue(issueJWTMockResponse);
            });

            it('should call saveUserLoginInformation with the correct params', async () => {
              // Act
              await ssoController.handleSsoRedirectForm(req, res);

              // Assert
              expect(saveUserLoginInformationMock).toHaveBeenCalledWith({
                userId: upsertTfmUserFromEntraIdUserResponse._id,
                sessionIdentifier: issueJWTMockResponse.sessionIdentifier,
                auditDetails: req.body.auditDetails,
              });
            });

            it('should call saveUserLoginInformation once', async () => {
              // Act
              await ssoController.handleSsoRedirectForm(req, res);

              // Assert
              expect(saveUserLoginInformationMock).toHaveBeenCalledTimes(1);
            });

            describe('when saving the user login information is unsuccessful', () => {
              withApiErrorTests({
                makeRequest: async () => {
                  ({ req, res } = getHttpMocksWithBody({
                    ...aValidRequest(),
                  }));
                  return await ssoController.handleSsoRedirectForm(req, res);
                },
                mockAnError: (error: unknown) => saveUserLoginInformationMock.mockRejectedValue(error),
                getRes: () => res,
                endpointErrorMessage: 'Failed to handle redirect form',
              });
            });

            describe('when saving the user login information is successful', () => {
              beforeEach(() => {
                saveUserLoginInformationMock.mockResolvedValue(undefined);
              });

              it('should return a 200 with the user, token, expires and successRedirect', async () => {
                // Arrange
                const expectedResponse = {
                  user: TFM_SESSION_USER_SCHEMA.parse(upsertTfmUserFromEntraIdUserResponse),
                  token: issueJWTMockResponse.token,
                  expires: issueJWTMockResponse.expires,
                  successRedirect: handleRedirectResponse.successRedirect,
                };

                // Act
                await ssoController.handleSsoRedirectForm(req, res);

                // Assert
                expect(res._getStatusCode()).toEqual(200);
                expect(res._getData()).toEqual(expectedResponse);
              });
            });
          });
        });
      });
    });
  });

  function getHttpMocksWithBody(body: HandleSsoRedirectFormRequest) {
    return httpMocks.createMocks<HandleSsoRedirectFormApiRequest, HandleSsoRedirectFormApiResponse>({
      body,
    });
  }

  function aValidRequest(): HandleSsoRedirectFormRequest {
    return {
      authCodeResponse: anEntraIdAuthCodeRedirectResponseBody(),
      originalAuthCodeUrlRequest: anAuthorisationCodeRequest(),
      auditDetails: generateSystemAuditDetails(),
    };
  }
});
