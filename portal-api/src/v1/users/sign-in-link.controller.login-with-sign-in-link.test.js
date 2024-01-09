const { when, resetAllWhenMocks } = require('jest-when');
const { SignInLinkController } = require('./sign-in-link.controller');
const { TEST_USER, TEST_USER_SANITISED_FOR_FRONTEND } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { LOGIN_STATUSES } = require('../../constants');
const { InvalidSignInTokenError } = require('../errors');
const UserBlockedError = require('../errors/user-blocked.error');

jest.mock('../../crypto/utils');
jest.mock('./controller');

describe('SignInLinkController', () => {
  const res = {
    status: jest.fn(),
    send: jest.fn(),
    json: jest.fn(),
  };

  let signInLinkService;
  let signInLinkController;

  beforeAll(() => {
    signInLinkService = {
      createAndEmailSignInLink: jest.fn(),
      isValidSignInToken: jest.fn(),
      deleteSignInToken: jest.fn(),
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
    const req = {
      params: { userId: TEST_USER._id, signInToken },
    };

    const expiresIn = 'dummy-expires-in';
    const token = 'dummy-token';

    const successfulLoginResponse = {
      expiresIn,
      loginStatus: LOGIN_STATUSES.VALID_2FA,
      success: true,
      token,
      user: TEST_USER_SANITISED_FOR_FRONTEND,
    };

    describe('given isValidSignInToken returns true', () => {
      beforeEach(() => {
        mockSuccessfulIsValidSignInTokenReturnTrue();
      });

      it('should call deleteSignInToken on the signInLinkService with the user id', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(signInLinkService.deleteSignInToken).toHaveBeenCalledWith(TEST_USER._id);
      });

      describe('given loginUser throws a UserBlockedError', () => {
        beforeEach(() => {
          when(signInLinkService.loginUser).calledWith(TEST_USER._id).mockRejectedValueOnce(new UserBlockedError(TEST_USER._id));
        });

        itShouldReturnAUserBlocked403();
      });

      describe('given loginUser succeeds', () => {
        beforeEach(() => {
          when(signInLinkService.loginUser)
            .calledWith(TEST_USER._id)
            .mockResolvedValueOnce({ user: TEST_USER, tokenObject: { token, expires: expiresIn } });
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
          when(signInLinkService.loginUser).calledWith(TEST_USER._id).mockRejectedValueOnce(loginUserError);
        });

        itShouldReturnA500WithMessage(loginUserError.message);
      });
    });

    describe('given isValidSignInToken returns false', () => {
      beforeEach(() => {
        mockSuccessfulIsValidSignInTokenReturnFalse();
      });

      it('should not call deleteSignInToken on the signInLinkService', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(signInLinkService.deleteSignInToken).not.toHaveBeenCalled();
      });

      itShouldReturnAnInvalidSignInToken403();
    });

    describe('given isValidSignInToken throws an InvalidSignInTokenError', () => {
      beforeEach(() => {
        mockUnsuccessfulIsValidSignInToken();
      });

      itShouldReturnAnInvalidSignInToken403();
    });

    function itShouldReturnAUserBlocked403() {
      it('should respond with a 403 "User blocked"', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.send).toHaveBeenCalledWith({
          message: 'Forbidden',
          errors: [
            {
              msg: `User blocked: ${TEST_USER._id}`,
            },
          ],
        });
      });
    }

    function itShouldReturnAnInvalidSignInToken403() {
      it('should respond with a 403 "Invalid sign in token for user ID"', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.send).toHaveBeenCalledWith({
          message: 'Forbidden',
          errors: [
            {
              msg: `Invalid sign in token for user ID: ${TEST_USER._id}`,
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

        expect(res.send).toHaveBeenCalledWith({
          message: 'Internal Server Error',
          errors: [
            {
              msg: message,
            },
          ],
        });
      });
    }

    function mockUnsuccessfulIsValidSignInToken() {
      when(signInLinkService.isValidSignInToken).calledWith(expect.anything()).mockRejectedValue(new InvalidSignInTokenError(signInToken));
    }

    function mockSuccessfulIsValidSignInToken(resolvedValue) {
      when(signInLinkService.isValidSignInToken).calledWith({ userId: TEST_USER._id, signInToken }).mockResolvedValue(resolvedValue);
    }

    function mockSuccessfulIsValidSignInTokenReturnFalse() {
      mockSuccessfulIsValidSignInToken(false);
    }

    function mockSuccessfulIsValidSignInTokenReturnTrue() {
      mockSuccessfulIsValidSignInToken(true);
    }
  });
});
