const { when } = require('jest-when');
const { SignInLinkService } = require('./sign-in-link.service');
const { TEST_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');
const utils = require('../../crypto/utils');

jest.mock('../../crypto/utils');

describe('SignInLinkService', () => {
  const token = '0a1b2c3d4e5f67890a1b2c3d4e5f6789';
  const sessionIdentifier = 'a session id';
  const tokenObjectWithoutSessionIdentifier = {
    token,
    expiresIn: Date.now(),
  };
  const tokenObject = {
    ...tokenObjectWithoutSessionIdentifier,
    sessionIdentifier,
  };

  let service;

  let randomGenerator;
  let hasher;
  let userRepository;

  beforeEach(() => {
    jest.resetAllMocks();
    randomGenerator = {
      randomHexString: jest.fn(),
    };
    hasher = {
      hash: jest.fn(),
      verifyHash: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      updateLastLogin: jest.fn(),
    };
    service = new SignInLinkService(randomGenerator, hasher, userRepository);
  });

  describe('loginUser', () => {
    describe('when the user is blocked', () => {
      it('throws a UserBlockedError if the user is blocked', async () => {});
    });

    describe('when the user is not blocked', () => {
      beforeEach(() => {
        mockUserTestConfig(TEST_USER);
      });

      it('updates the last login of the user', async () => {
        await service.loginUser(TEST_USER._id);
        expect(userRepository.updateLastLogin).toHaveBeenCalledWith({ userId: TEST_USER._id, sessionIdentifier });
      });

      it('returns the user and a new 2FA JWT for the user', async () => {
        await expect(service.loginUser(TEST_USER._id)).resolves.toStrictEqual({ user: TEST_USER, tokenObject: tokenObjectWithoutSessionIdentifier });
      });
    });

    function mockUserTestConfig(user) {
      when(userRepository.findById).calledWith(user._id).mockResolvedValueOnce(user);
      when(utils.issueValid2faJWT).calledWith(user).mockReturnValueOnce(tokenObject);
      when(userRepository.updateLastLogin).calledWith({ userId: user._id, sessionIdentifier }).mockResolvedValueOnce(undefined);
    }
  });
});
