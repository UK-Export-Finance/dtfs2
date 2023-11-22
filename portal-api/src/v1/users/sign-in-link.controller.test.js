const { when, resetAllWhenMocks } = require('jest-when');
const { SignInLinkController } = require('./sign-in-link.controller');
const { TEST_USER, TEST_USER_SANITISED } = require('../../../test-helpers/unit-test-mocks/mock-user');
const utils = require('../../crypto/utils');
const { LOGIN_STATUSES } = require('../../constants');
const { InvalidSignInTokenError } = require('../errors');
const UserBlockedError = require('../errors/user-blocked.error');

jest.mock('../../crypto/utils');
jest.mock('./controller');

describe('sign in link controller', () => {
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
      updateLastLogin: jest.fn(),
    };
    signInLinkController = new SignInLinkController(signInLinkService);
  });

  beforeEach(() => {
    resetAllWhenMocks();
    jest.resetAllMocks();
    res.status.mockReturnThis();
  });

  describe('createAndEmailSignInLink', () => {
    const req = {
      user: TEST_USER,
    };

    const numberOfSendSignInLinkAttemptsRemaining = 1;

    it('should create and send a sign in token for req.user', async () => {
      mockSuccessfulCreateAndEmailSignInLink();

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(signInLinkService.createAndEmailSignInLink).toHaveBeenCalledWith(TEST_USER);
    });

    it('should respond with a 201 if the sign in token is emailed', async () => {
      mockSuccessfulCreateAndEmailSignInLink();

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should respond with numberOfSendSignInLinkAttemptsRemaining if the sign in token is emailed', async () => {
      mockSuccessfulCreateAndEmailSignInLink();

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.json).toHaveBeenCalledWith({ numberOfSendSignInLinkAttemptsRemaining });
    });

    it('should respond with a 500 if the sign in token fails', async () => {
      when(signInLinkService.createAndEmailSignInLink).calledWith(TEST_USER).mockRejectedValueOnce(new Error());

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return a 403 with the error message as a response body if the user is blocked', async () => {
      const errorMessage = 'a test userIsBlockedError';
      when(signInLinkService.createAndEmailSignInLink).calledWith(TEST_USER).mockRejectedValueOnce(new UserBlockedError(errorMessage));

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ error: 'Forbidden', message: `User blocked: ${errorMessage}` });
    });

    it('should return a 500 with the error message as a response body if the sign in token fails', async () => {
      const errorMessage = 'a test error';
      when(signInLinkService.createAndEmailSignInLink).calledWith(TEST_USER).mockRejectedValueOnce(new Error(errorMessage));

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: errorMessage,
      });
    });

    function mockSuccessfulCreateAndEmailSignInLink() {
      when(signInLinkService.createAndEmailSignInLink).calledWith(TEST_USER).mockResolvedValueOnce(numberOfSendSignInLinkAttemptsRemaining);
    }
  });

  describe('loginWithSignInLink', () => {
    const signInToken = 'dummy-sign-in-token';
    const req = {
      user: TEST_USER,
      params: { signInToken },
    };

    const expiresIn = 'dummy-expires-in';
    const token = 'dummy-token';

    const successfulResContent = {
      expiresIn,
      loginStatus: LOGIN_STATUSES.VALID_2FA,
      success: true,
      token,
      user: TEST_USER_SANITISED,
    };

    describe('given isValidSignInToken returns true', () => {
      beforeEach(() => {
        mockSuccessfulIsValidSignInTokenReturnTrue();
      });

      it('should call deleteSignInToken on the signInLinkService with the user id', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(signInLinkService.deleteSignInToken).toHaveBeenCalledWith(TEST_USER._id);
      });

      describe('given issueValid2faJWT succeeds', () => {
        beforeEach(() => {
          mockSuccessfulIssueValid2faJWT();
        });

        describe('given updateLastLogin succeeds', () => {
          beforeEach(() => {
            mockSuccessfulUpdateLastLogin();
          });

          it('should respond with a 200', async () => {
            await signInLinkController.loginWithSignInLink(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
          });

          it('should respond with expected json', async () => {
            await signInLinkController.loginWithSignInLink(req, res);

            expect(res.json).toHaveBeenCalledWith(successfulResContent);
          });
        });

        describe('given updateLastLogin throws an error', () => {
          beforeEach(() => {
            mockUnsuccessfulUpdateLastLogin();
          });

          itShouldReturnA500WithMessage('Invalid User Id');
        });
      });

      describe('given issueValid2faJWT throws an error', () => {
        beforeEach(() => {
          mockUnsuccessfulIssueValid2faJWT();
        });

        itShouldReturnA500WithMessage('User does not have a session identifier');
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

      itShouldReturnA403();
    });

    describe('given isValidSignInToken throws an InvalidSignInTokenError', () => {
      beforeEach(() => {
        mockUnsuccessfulIsValidSignInToken();
      });

      itShouldReturnA403();
    });

    function itShouldReturnA403() {
      it('should respond with a 403', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.send).toHaveBeenCalledWith({
          error: 'Forbidden',
          message: `Invalid sign in token for user ID: ${TEST_USER._id}`,
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
          error: 'Internal Server Error',
          message,
        });
      });
    }

    function mockUnsuccessfulIsValidSignInToken() {
      when(signInLinkService.isValidSignInToken).calledWith(expect.anything()).mockRejectedValue(new InvalidSignInTokenError(TEST_USER._id));
    }

    function mockUnsuccessfulIssueValid2faJWT() {
      when(utils.issueValid2faJWT)
        .calledWith(expect.anything())
        .mockImplementation(() => {
          throw new Error('User does not have a session identifier');
        });
    }

    function mockUnsuccessfulUpdateLastLogin() {
      when(signInLinkService.updateLastLogin)
        .calledWith({ userId: expect.anything(), sessionIdentifier: expect.anything() })
        .mockRejectedValue(new Error('Invalid User Id'));
    }

    function mockSuccessfulIsValidSignInToken(resolvedValue) {
      when(signInLinkService.isValidSignInToken).calledWith(expect.anything()).mockResolvedValue(resolvedValue);
    }

    function mockSuccessfulIsValidSignInTokenReturnFalse() {
      mockSuccessfulIsValidSignInToken(false);
    }

    function mockSuccessfulIsValidSignInTokenReturnTrue() {
      mockSuccessfulIsValidSignInToken(true);
    }

    function mockSuccessfulIssueValid2faJWT() {
      const issueValid2faJWTResponse = { sessionIdentifier: 'dummy-session-identifier', token, expires: expiresIn };

      when(utils.issueValid2faJWT).calledWith(expect.anything()).mockReturnValue(issueValid2faJWTResponse);
    }

    function mockSuccessfulUpdateLastLogin() {
      when(signInLinkService.updateLastLogin).calledWith({ userId: expect.anything(), sessionIdentifier: expect.anything() }).mockResolvedValue(true);
    }
  });
});
