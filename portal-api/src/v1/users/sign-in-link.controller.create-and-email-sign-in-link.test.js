const { when, resetAllWhenMocks } = require('jest-when');
const { generateNoUserLoggedInAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { SignInLinkController } = require('./sign-in-link.controller');
const { TEST_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');
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
      loginUser: jest.fn(),
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

    it('should create and send a sign in link for req.user', async () => {
      mockSuccessfulCreateAndEmailSignInLink();

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(signInLinkService.createAndEmailSignInLink).toHaveBeenCalledWith(TEST_USER, generateNoUserLoggedInAuditDetails());
    });

    it('should respond with a 201 if the sign in link is emailed', async () => {
      mockSuccessfulCreateAndEmailSignInLink();

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should respond with numberOfSendSignInLinkAttemptsRemaining if the sign in link is emailed', async () => {
      mockSuccessfulCreateAndEmailSignInLink();

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.json).toHaveBeenCalledWith({ numberOfSendSignInLinkAttemptsRemaining });
    });

    it('should respond with a 500 if creating or emailing the sign in link fails', async () => {
      when(signInLinkService.createAndEmailSignInLink).calledWith(TEST_USER, generateNoUserLoggedInAuditDetails()).mockRejectedValueOnce(new Error());

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return a 403 with the error message as a response body if the user is blocked', async () => {
      const errorMessage = 'a test userIsBlockedError';
      when(signInLinkService.createAndEmailSignInLink)
        .calledWith(TEST_USER, generateNoUserLoggedInAuditDetails())
        .mockRejectedValueOnce(new UserBlockedError(errorMessage));

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ error: 'Forbidden', message: `User blocked: ${errorMessage}` });
    });

    it('should return a 500 with the error message as a response body if creating or emailing the sign in link fails', async () => {
      const errorMessage = 'a test error';
      when(signInLinkService.createAndEmailSignInLink)
        .calledWith(TEST_USER, generateNoUserLoggedInAuditDetails())
        .mockRejectedValueOnce(new Error(errorMessage));

      await signInLinkController.createAndEmailSignInLink(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: errorMessage,
      });
    });

    function mockSuccessfulCreateAndEmailSignInLink() {
      when(signInLinkService.createAndEmailSignInLink)
        .calledWith(TEST_USER, generateNoUserLoggedInAuditDetails())
        .mockResolvedValueOnce(numberOfSendSignInLinkAttemptsRemaining);
    }
  });
});
