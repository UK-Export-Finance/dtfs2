const { when, resetAllWhenMocks } = require('jest-when');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');
const { SignInLinkController } = require('./sign-in-link.controller');
const {
  TEST_USER_SANITISED_FOR_FRONTEND,
  TEST_USER_PARTIAL_2FA,
  TEST_USER_TRANSFORMED_FROM_DATABASE,
} = require('../../../test-helpers/unit-test-mocks/mock-user');
const { SIGN_IN_LINK, HTTP_ERROR_CAUSES } = require('../../constants');
const { InvalidSignInTokenError, InvalidUserIdError, UserNotFoundError } = require('../errors');
const UserBlockedError = require('../errors/user-blocked.error');

jest.mock('../../crypto/utils');
jest.mock('./controller');

describe('SignInLinkController', () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };

  let signInLinkService;
  let signInLinkController;

  beforeAll(() => {
    signInLinkService = {
      createAndEmailSignInLink: jest.fn(),
      getSignInTokenStatus: jest.fn(),
      resetSignInData: jest.fn(),
      loginUser: jest.fn(),
    };
    signInLinkController = new SignInLinkController(signInLinkService);
  });

  beforeEach(() => {
    resetAllWhenMocks();
    jest.resetAllMocks();
    res.status.mockReturnThis();
  });

  describe('loginWithSignInLink', () => {
    const signInToken = 'dummy-sign-in-token';
    let req;
    const expiresIn = 'dummy-expires-in';
    const token = 'dummy-token';

    const successfulLoginResponse = {
      expiresIn,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
      success: true,
      token,
      user: TEST_USER_SANITISED_FOR_FRONTEND,
    };

    describe('given the userId does not match the userId in the request', () => {
      beforeEach(() => {
        req = {
          user: { _id: 'A different Id' },
          params: { userId: TEST_USER_PARTIAL_2FA._id, signInToken },
        };
      });

      itShouldReturnAnInvalidUserId400();
    });
    describe('given the userId matches the userId in the request', () => {
      beforeEach(() => {
        req = {
          user: { _id: TEST_USER_PARTIAL_2FA._id },
          params: { userId: TEST_USER_PARTIAL_2FA._id, signInToken },
        };
      });

      describe('given getSignInTokenStatus returns valid', () => {
        beforeEach(() => {
          mockGetSignInTokenStatusValid();
        });

        it('should call resetSignInData on the signInLinkService with the user id', async () => {
          await signInLinkController.loginWithSignInLink(req, res);

          expect(signInLinkService.resetSignInData).toHaveBeenCalledWith(TEST_USER_PARTIAL_2FA._id, generatePortalAuditDetails(req.params.userId));
        });

        describe('given loginUser throws a UserBlockedError', () => {
          beforeEach(() => {
            when(signInLinkService.loginUser)
              .calledWith(TEST_USER_PARTIAL_2FA._id, generatePortalAuditDetails(req.params.userId))
              .mockRejectedValueOnce(new UserBlockedError(TEST_USER_PARTIAL_2FA._id));
          });

          itShouldReturnAUserBlocked403();
        });

        describe('given loginUser succeeds', () => {
          beforeEach(() => {
            when(signInLinkService.loginUser)
              .calledWith(TEST_USER_PARTIAL_2FA._id, generatePortalAuditDetails(req.params.userId))
              .mockResolvedValueOnce({
                user: TEST_USER_TRANSFORMED_FROM_DATABASE,
                tokenObject: { token, expires: expiresIn },
              });
          });

          it('should respond with a 200', async () => {
            await signInLinkController.loginWithSignInLink(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
          });

          it('should respond with the login token and user details', async () => {
            await signInLinkController.loginWithSignInLink(req, res);

            expect(res.json).toHaveBeenCalledWith(successfulLoginResponse);
          });
        });

        describe('given loginUser throws an error', () => {
          const loginUserError = new Error('test error');

          beforeEach(() => {
            when(signInLinkService.loginUser)
              .calledWith(TEST_USER_PARTIAL_2FA._id, generatePortalAuditDetails(req.params.userId))
              .mockRejectedValueOnce(loginUserError);
          });

          itShouldReturnA500WithMessage(loginUserError.message);
        });
      });

      describe('given getSignInTokenStatus returns expired', () => {
        beforeEach(() => {
          mockGetSignInTokenStatusExpired();
        });

        itShouldNotCallResetSignInData();

        itShouldNotCallLoginUser();

        itShouldReturnAnExpiredToken403();
      });

      describe('given getSignInTokenStatus returns not found', () => {
        beforeEach(() => {
          mockGetSignInTokenStatusNotFound();
        });

        itShouldNotCallResetSignInData();

        itShouldNotCallLoginUser();
        itShouldReturnANoMatchingToken404();
      });

      describe('given isValidSignInToken throws an InvalidSignInTokenError', () => {
        beforeEach(() => {
          mockGetSignInTokenStatusErrorWithInvalidSignInTokenError();
        });

        itShouldNotCallResetSignInData();

        itShouldNotCallLoginUser();

        itShouldReturnAnInvalidSignInToken400();
      });

      describe('given isValidSignInToken throws an InvalidUserIdError', () => {
        beforeEach(() => {
          mockGetSignInTokenStatusErrorWithInvalidUserIdError();
        });

        itShouldNotCallResetSignInData();

        itShouldNotCallLoginUser();

        itShouldReturnAnInvalidUserId400();
      });

      describe('given isValidSignInToken throws a UserNotFoundError', () => {
        beforeEach(() => {
          mockGetSignInTokenStatusErrorWithUserNotFoundError();
        });

        itShouldNotCallResetSignInData();

        itShouldNotCallLoginUser();

        itShouldReturnAUserNotFound404();
      });

      describe('given isValidSignInToken throws an Error', () => {
        beforeEach(() => {
          mockGetSignInTokenStatusErrorWithGenericError();
        });

        itShouldNotCallResetSignInData();

        itShouldNotCallLoginUser();

        itShouldReturnA500WithMessage();
      });
    });

    function itShouldNotCallResetSignInData() {
      it('should not call resetSignInData on the signInLinkService', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(signInLinkService.resetSignInData).not.toHaveBeenCalled();
      });
    }

    function itShouldNotCallLoginUser() {
      it('should not call loginUser on the signInLinkService', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(signInLinkService.loginUser).not.toHaveBeenCalled();
      });
    }

    function itShouldReturnAUserBlocked403() {
      it('should respond with a 403 "User blocked"', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
          message: 'Forbidden',
          errors: [
            {
              cause: HTTP_ERROR_CAUSES.USER_BLOCKED,
              msg: `User blocked: ${TEST_USER_PARTIAL_2FA._id}`,
            },
          ],
        });
      });
    }

    function itShouldReturnAnInvalidSignInToken400() {
      it('should respond with a 400 "Invalid sign in token"', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
          message: 'Bad Request',
          errors: [
            {
              msg: `Invalid sign in token ${signInToken}`,
            },
          ],
        });
      });
    }

    function itShouldReturnAnInvalidUserId400() {
      it('should respond with a 400 "Invalid user id"', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
          message: 'Bad Request',
          errors: [
            {
              msg: `Invalid user id ${TEST_USER_PARTIAL_2FA._id}`,
            },
          ],
        });
      });
    }

    function itShouldReturnAnExpiredToken403() {
      it('should respond with a 403 "The provided token is no longer valid for user with id"', async () => {
        await signInLinkController.loginWithSignInLink(req, res);
        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
          message: 'Forbidden',
          errors: [
            {
              cause: HTTP_ERROR_CAUSES.TOKEN_EXPIRED,
              msg: `The provided token is no longer valid for user with id ${TEST_USER_PARTIAL_2FA._id}`,
            },
          ],
        });
      });
    }

    function itShouldReturnANoMatchingToken404() {
      it('should respond with a 404 "No matching token for user with id"', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
          message: 'Not Found',
          errors: [
            {
              msg: `No matching token for user with id ${TEST_USER_PARTIAL_2FA._id}`,
            },
          ],
        });
      });
    }

    function itShouldReturnAUserNotFound404() {
      it('should respond with a 404 "No user found with id"', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.status).toHaveBeenCalledWith(404);

        expect(res.json).toHaveBeenCalledWith({
          message: 'Not Found',
          errors: [
            {
              msg: `No user found with id ${TEST_USER_PARTIAL_2FA._id}`,
            },
          ],
        });
      });
    }

    function itShouldReturnA500WithMessage(message) {
      it('should respond with a 500', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should respond with expected error message', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.json).toHaveBeenCalledWith({
          message: 'Internal Server Error',
          errors: [
            {
              msg: message,
            },
          ],
        });
      });
    }

    function mockGetSignInTokenStatusWithResolvedValue(response) {
      when(signInLinkService.getSignInTokenStatus).calledWith({ userId: TEST_USER_PARTIAL_2FA._id, signInToken }).mockResolvedValue(response);
    }

    function mockGetSignInTokenStatusNotFound() {
      mockGetSignInTokenStatusWithResolvedValue(SIGN_IN_LINK.STATUS.NOT_FOUND);
    }

    function mockGetSignInTokenStatusExpired() {
      mockGetSignInTokenStatusWithResolvedValue(SIGN_IN_LINK.STATUS.EXPIRED);
    }

    function mockGetSignInTokenStatusValid() {
      mockGetSignInTokenStatusWithResolvedValue(SIGN_IN_LINK.STATUS.VALID);
    }

    function mockGetSignInTokenStatusToRejectWithError(error) {
      when(signInLinkService.getSignInTokenStatus).calledWith({ userId: TEST_USER_PARTIAL_2FA._id, signInToken }).mockRejectedValue(error);
    }
    function mockGetSignInTokenStatusErrorWithInvalidSignInTokenError() {
      mockGetSignInTokenStatusToRejectWithError(new InvalidSignInTokenError(signInToken));
    }

    function mockGetSignInTokenStatusErrorWithInvalidUserIdError() {
      mockGetSignInTokenStatusToRejectWithError(new InvalidUserIdError(TEST_USER_PARTIAL_2FA._id));
    }

    function mockGetSignInTokenStatusErrorWithUserNotFoundError() {
      mockGetSignInTokenStatusToRejectWithError(new UserNotFoundError(TEST_USER_PARTIAL_2FA._id));
    }

    function mockGetSignInTokenStatusErrorWithGenericError() {
      mockGetSignInTokenStatusToRejectWithError(Error);
    }
  });
});
