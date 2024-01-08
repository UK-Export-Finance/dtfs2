const { SignInLinkService } = require('./sign-in-link.service');
const { SIGN_IN_LINK } = require('../../constants');
const { UserNotFoundError, InvalidSignInTokenError } = require('../errors');
const { TEST_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');

describe('SignInLinkService', () => {
  const hash = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  const salt = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';

  const token = '0a1b2c3d4e5f67890a1b2c3d4e5f6789';
  const user = {
    _id: 'aaaa1234aaaabbbb5678bbbb',
    firstname: 'a first name',
    surname: 'a last name',
    email: 'an email',
    hash,
    salt,
    signInToken: {
      hash: 'a sign in token hash',
      salt: 'a sign in token salt',
      expiry: new Date().getTime() + SIGN_IN_LINK.DURATION_MILLISECONDS,
    },
  };

  const userWithExpiredSignInToken = JSON.parse(JSON.stringify(user));
  userWithExpiredSignInToken.signInToken.expiry = new Date().getTime() - 1;

  let service;

  let randomGenerator;
  let hasher;
  let userRepository;

  beforeAll(() => {
    jest.useFakeTimers();
  });

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
      saveSignInTokenForUser: jest.fn(),
      incrementSignInLinkSendCount: jest.fn(),
      setSignInLinkSendDate: jest.fn(),
      resetSignInLinkSendCountAndDate: jest.fn(),
      findById: jest.fn(),
      blockUser: jest.fn(),
    };
    service = new SignInLinkService(randomGenerator, hasher, userRepository);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('isValidSignInToken', () => {
    describe('when user is found with a non-expired sign in token salt and hash', () => {
      beforeEach(() => {
        mockSuccessfulFindById(TEST_USER);
      });

      describe('when the hash matches the saved hash', () => {
        beforeEach(() => {
          mockSuccessfulVerifyHashReturnTrue();
        });

        itCallsFindByIdWithExpectedArguments();

        itCallsVerifyHashWithExpectedArguments();

        it('returns true', async () => {
          const result = await service.isValidSignInToken({ userId: user._id, signInToken: token });
          expect(result).toBe(true);
        });
      });

      describe('when the hash does not match the saved hash', () => {
        beforeEach(() => {
          mockSuccessfulVerifyHashReturnFalse();
        });

        itCallsFindByIdWithExpectedArguments();

        itCallsVerifyHashWithExpectedArguments();

        it('returns false', async () => {
          const result = await service.isValidSignInToken({ userId: user._id, signInToken: token });
          expect(result).toBe(false);
        });
      });

      describe('when the hash comparison throws an error', () => {
        beforeEach(() => {
          mockUnsuccessfulVerifyHash();
        });

        itThrowsAnError();
      });
    });

    describe('when user is found with an expired sign in token salt and hash', () => {
      const testUserWithExpiredSignInToken = { ...TEST_USER };
      testUserWithExpiredSignInToken.signInToken = { hash: TEST_USER.signInToken.hash, salt: TEST_USER.signInToken.salt, expiry: new Date().getTime() - 1 };

      beforeEach(() => {
        mockSuccessfulFindById(testUserWithExpiredSignInToken);
      });

      itCallsFindByIdWithExpectedArguments();

      it('returns false', async () => {
        const result = await service.isValidSignInToken({ userId: user._id, signInToken: token });
        expect(result).toBe(false);
      });
    });

    describe('when the user does not have a sign in token hash', () => {
      const testUserWithoutHash = { ...TEST_USER };
      testUserWithoutHash.signInToken = { salt: TEST_USER.signInToken.salt };

      beforeEach(() => {
        mockSuccessfulFindById(testUserWithoutHash);
      });

      itThrowsAnError(InvalidSignInTokenError);
    });

    describe('when the user does not have a sign in token salt', () => {
      const testUserWithoutSalt = { ...TEST_USER };
      testUserWithoutSalt.signInToken = { hash: TEST_USER.signInToken.hash };

      beforeEach(() => {
        mockSuccessfulFindById(testUserWithoutSalt);
      });

      itThrowsAnError(InvalidSignInTokenError);
    });

    describe('when user cannot be found', () => {
      beforeEach(() => {
        mockUnsuccessfulFindById();
      });

      itThrowsAnError(UserNotFoundError);
    });

    function itThrowsAnError(errorType = Error) {
      it('throws an error', async () => {
        expect(service.isValidSignInToken({ userId: user._id, signInToken: token })).rejects.toThrowError(errorType);
      });
    }

    function itCallsFindByIdWithExpectedArguments() {
      it('calls findById with the expected arguments', async () => {
        await service.isValidSignInToken({ userId: user._id, signInToken: token });

        expect(userRepository.findById).toHaveBeenCalledWith(user._id);
      });
    }

    function itCallsVerifyHashWithExpectedArguments() {
      it('calls verifyHash with the expected arguments', async () => {
        await service.isValidSignInToken({ userId: user._id, signInToken: token });

        expect(hasher.verifyHash).toHaveBeenCalledWith({
          target: token,
          hash: TEST_USER.signInToken.hash,
          salt: TEST_USER.signInToken.salt,
        });
      });
    }

    function mockUnsuccessfulFindById() {
      userRepository.findById.mockRejectedValue(new UserNotFoundError(TEST_USER._id));
    }

    function mockSuccessfulFindById(userToReturn) {
      userRepository.findById.mockResolvedValue(userToReturn);
    }

    function mockSuccessfulVerifyHashReturnTrue() {
      hasher.verifyHash.mockReturnValue(true);
    }

    function mockSuccessfulVerifyHashReturnFalse() {
      hasher.verifyHash.mockReturnValue(false);
    }

    function mockUnsuccessfulVerifyHash() {
      hasher.verifyHash.mockImplementation(() => {
        throw new Error();
      });
    }
  });
});
