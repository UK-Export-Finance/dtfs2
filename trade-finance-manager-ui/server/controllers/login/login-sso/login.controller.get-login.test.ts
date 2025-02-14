import httpMocks from 'node-mocks-http';
import { resetAllWhenMocks, when } from 'jest-when';
import { anAuthorisationUrlRequest } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import { aRequestSession } from '../../../../test-helpers';
import { LoginController } from './login.controller';
import { LoginService } from '../../../services/login.service';

jest.mock('../../../services/login.service', () => ({
  LoginService: {
    getAuthCodeUrl: jest.fn(),
  },
}));

describe('controllers - login (sso)', () => {
  describe('getLogin', () => {
    let res: httpMocks.MockResponse<Response>;
    let req: httpMocks.MockRequest<Request>;

    const requestOriginalUrl = '/the-original-url';
    const mockAuthCodeUrl = `mock-auth-code-url`;
    const mockAuthCodeUrlRequest = anAuthorisationUrlRequest();
    const getAuthCodeUrlMock = jest.mocked(LoginService.getAuthCodeUrl);

    beforeEach(() => {
      resetAllWhenMocks();
      jest.resetAllMocks();
    });

    describe('when there is a user session', () => {
      beforeEach(() => {
        ({ req, res } = httpMocks.createMocks({
          session: aRequestSession(),
          originalUrl: requestOriginalUrl,
        }));
      });

      it('redirects to /home', async () => {
        // Act
        await LoginController.getLogin(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual('/home');
      });
    });

    describe('when there is no user session', () => {
      describe('when the getAuthCodeUrl api call is successful', () => {
        describe('when existing session login data is present', () => {
          beforeEach(() => {
            ({ req, res } = httpMocks.createMocks({
              session: { loginData: { authCodeUrlRequest: 'an old auth code url request', aField: 'another field' } },
              originalUrl: requestOriginalUrl,
            }));

            mockSuccessfulGetAuthCodeUrl();
          });

          it('should redirect to login URL', async () => {
            // Act
            await LoginController.getLogin(req, res);

            // Assert
            expect(res._getRedirectUrl()).toEqual(mockAuthCodeUrl);
          });

          it('overrides session login data if present', async () => {
            // Act
            await LoginController.getLogin(req, res);

            // Assert
            expect(req.session.loginData).toEqual({ authCodeUrlRequest: mockAuthCodeUrlRequest });
          });
        });

        describe('when existing session login data is not present', () => {
          beforeEach(() => {
            ({ req, res } = httpMocks.createMocks({ session: {}, originalUrl: requestOriginalUrl }));
            mockSuccessfulGetAuthCodeUrl();
          });

          it('should redirect to login URL', async () => {
            // Act
            await LoginController.getLogin(req, res);

            // Assert
            expect(res._getRedirectUrl()).toEqual(mockAuthCodeUrl);
          });

          it('should set session login data', async () => {
            // Act
            await LoginController.getLogin(req, res);

            // Assert
            expect(req.session.loginData).toEqual({ authCodeUrlRequest: mockAuthCodeUrlRequest });
          });
        });
      });

      describe('when the getAuthCodeUrl api call is unsuccessful', () => {
        let consoleErrorMock: jest.Mock;

        beforeAll(() => {
          consoleErrorMock = jest.fn();
          console.error = consoleErrorMock;
        });

        beforeEach(() => {
          ({ req, res } = httpMocks.createMocks({ session: {}, originalUrl: requestOriginalUrl }));

          mockFailedGetAuthCodeUrl();
        });

        afterAll(() => {
          consoleErrorMock.mockRestore();
        });

        it('should log the error', async () => {
          // Act
          await LoginController.getLogin(req, res);

          // Assert
          expect(consoleErrorMock).toHaveBeenCalled();
        });

        it('should redirect to problem-with-service page', async () => {
          // Act
          await LoginController.getLogin(req, res);

          // Assert
          expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
        });
      });

      function mockSuccessfulGetAuthCodeUrl(whenCalledWith = { successRedirect: requestOriginalUrl }) {
        when(getAuthCodeUrlMock)
          .calledWith(whenCalledWith)
          .mockImplementation(() => Promise.resolve({ authCodeUrl: mockAuthCodeUrl, authCodeUrlRequest: mockAuthCodeUrlRequest }));
      }

      function mockFailedGetAuthCodeUrl() {
        when(getAuthCodeUrlMock).calledWith({ successRedirect: requestOriginalUrl }).mockRejectedValueOnce(new Error('getAuthCodeUrl error'));
      }
    });
  });
});
