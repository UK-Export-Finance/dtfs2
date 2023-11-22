const { when, resetAllWhenMocks } = require('jest-when');
const { SignInLinkController } = require('./sign-in-link.controller');
const { TEST_USER, TEST_USER_SANITISED } = require('../../../test-helpers/unit-test-mocks/mock-user');
const utils = require('../../crypto/utils');
const userController = require('./controller');
const { LOGIN_STATUSES } = require('../../constants');

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

    it('should create and send a sign in token for req.user', async () => {
      await signInLinkController.createAndEmailSignInLink(req, res);
      expect(signInLinkService.createAndEmailSignInLink).toHaveBeenCalledWith(TEST_USER);
    });

    it('should respond with a 201 if the sign in token is sent', async () => {
      await signInLinkController.createAndEmailSignInLink(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should respond with an empty body if the sign in token is sent', async () => {
      await signInLinkController.createAndEmailSignInLink(req, res);
      expect(res.send).toHaveBeenCalledWith();
    });

    it('should respond with a 500 if the sign in token fails', async () => {
      when(signInLinkService.createAndEmailSignInLink).calledWith(TEST_USER).mockRejectedValueOnce(new Error());

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should respond with the error message as a response body if the sign in token fails', async () => {
      const errorMessage = 'a test error';
      when(signInLinkService.createAndEmailSignInLink).calledWith(TEST_USER).mockRejectedValueOnce(new Error(errorMessage));

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.send).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: errorMessage,
      });
    });
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

      it('should respond with a 403', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
      });

      it('should respond with expected error message', async () => {
        await signInLinkController.loginWithSignInLink(req, res);

        expect(res.send).toHaveBeenCalledWith({
          error: 'Forbidden',
          message: `Invalid sign in token for user: ${TEST_USER._id}`,
        });
      });
    });

    describe('given isValidSignInToken throws an error', () => {
      beforeEach(() => {
        mockUnsuccessfulIsValidSignInToken();
      });

      itShouldReturnA500WithMessage('User does not have a valid sign in token.');
    });

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
      when(signInLinkService.isValidSignInToken).calledWith(expect.anything()).mockRejectedValue(new Error('User does not have a valid sign in token.'));
    }

    function mockUnsuccessfulIssueValid2faJWT() {
      when(utils.issueValid2faJWT)
        .calledWith(expect.anything())
        .mockImplementation(() => {
          throw new Error('User does not have a session identifier');
        });
    }

    function mockUnsuccessfulUpdateLastLogin() {
      when(userController.updateLastLogin).calledWith(expect.anything(), expect.anything()).mockRejectedValue(new Error('Invalid User Id'));
    }

    function mockSuccessfulIsValidSignInTokenReturnFalse() {
      when(signInLinkService.isValidSignInToken).calledWith(expect.anything()).mockResolvedValue(false);
    }

    function mockSuccessfulIsValidSignInTokenReturnTrue() {
      when(signInLinkService.isValidSignInToken).calledWith(expect.anything()).mockResolvedValue(true);
    }

    function mockSuccessfulIssueValid2faJWT() {
      const issueValid2faJWTResponse = { sessionIdentifier: 'dummy-session-identifier', token, expires: expiresIn };

      when(utils.issueValid2faJWT).calledWith(expect.anything()).mockReturnValue(issueValid2faJWTResponse);
    }

    function mockSuccessfulUpdateLastLogin() {
      when(userController.updateLastLogin).calledWith(expect.anything(), expect.anything()).mockResolvedValue(true);
    }
  });
});
