const { when } = require('jest-when');
const sendEmail = require('../email');

const { SignInLinkService } = require('./sign-in-link.service');
const { SIGN_IN_LINK_DURATION, EMAIL_TEMPLATE_IDS } = require('../../constants');
const { PORTAL_UI_URL } = require('../../config/sign-in-link.config');
const { UserNotFoundError, InvalidSignInTokenError } = require('../errors');
const { TEST_USER } = require('../../../test-helpers/unit-test-mocks/mock-user');

jest.mock('../email');

const originalSignInLinkDurationMinutes = SIGN_IN_LINK_DURATION.MINUTES;

describe('SignInLinkService', () => {
  const hash = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const hashBytes = Buffer.from(hash, 'hex');

  const salt = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
  const saltBytes = Buffer.from(salt, 'hex');

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
      expiry: new Date().getTime() + SIGN_IN_LINK_DURATION.MILLISECONDS,
    },
  };

  const { hash: _hashRemoved, ...userWithoutPasswordHash } = user;
  const { salt: _saltRemoved, ...userWithoutPasswordSalt } = user;
  const { signInToken: _signInTokenRemoved, ...userWithoutSignInToken } = user;

  const userWithExpiredSignInToken = JSON.parse(JSON.stringify(user));
  userWithExpiredSignInToken.signInToken.expiry = new Date().getTime() - 1;

  const signInToken = 'a sign in token';

  let service;

  let randomGenerator;
  let hasher;
  let userRepository;
  const signInLink = `${PORTAL_UI_URL}/login/sign-in-link?t=${token}`;

  beforeEach(() => {
    jest.resetAllMocks();
    randomGenerator = {
      randomHexString: jest.fn(),
    };
    hasher = {
      hash: jest.fn(),
      verifyHash: jest.fn(),
      verifyHash: jest.fn(),
    };
    userRepository = {
      saveSignInTokenForUser: jest.fn(),
      findById: jest.fn(),
      findById: jest.fn(),
    };
    service = new SignInLinkService(randomGenerator, hasher, userRepository);
  });

  describe('createAndEmailSignInLink', () => {
    describe('when creating the sign in link token fails', () => {
      const createSignInLinkTokenError = new Error();

      beforeEach(() => {
        randomGenerator.randomHexString.mockImplementationOnce(() => {
          throw createSignInLinkTokenError;
        });
      });

      testCreatingAndEmailingTheSignInLinkRejects({
        expectedCause: createSignInLinkTokenError,
        expectedMessage: 'Failed to create a sign in token.',
      });
    });

    describe('when creating the sign in link token succeeds', () => {
      beforeEach(() => {
        when(randomGenerator.randomHexString).calledWith(32).mockReturnValueOnce(token);
      });

      describe('when hashing the sign in link token fails', () => {
        const hashError = new Error();

        beforeEach(() => {
          hasher.hash.mockImplementationOnce(() => {
            throw hashError;
          });
        });

        testCreatingAndEmailingTheSignInLinkRejects({
          expectedCause: hashError,
          expectedMessage: 'Failed to save the sign in token.',
        });
      });

      describe('when hashing the sign in link token succeeds', () => {
        beforeEach(() => {
          when(hasher.hash).calledWith(token).mockReturnValueOnce({ hash: hashBytes, salt: saltBytes });
        });

        describe('when saving the sign in link token to the database fails', () => {
          const savingTokenError = new Error();

          beforeEach(() => {
            userRepository.saveSignInTokenForUser.mockRejectedValueOnce(savingTokenError);
          });

          testCreatingAndEmailingTheSignInLinkRejects({
            expectedCause: savingTokenError,
            expectedMessage: 'Failed to save the sign in token.',
          });
        });

        describe('when saving the sign in link token to the database succeeds', () => {
          beforeEach(() => {
            when(userRepository.saveSignInTokenForUser)
              .calledWith({
                userId: user._id,
                signInTokenHash: hashBytes,
                signInTokenSalt: saltBytes,
              })
              .mockResolvedValueOnce(undefined);
          });

          afterEach(() => {
            SIGN_IN_LINK_DURATION.MINUTES = originalSignInLinkDurationMinutes;
          });

          it('saves the sign in link token hash and salt to the db', async () => {
            await service.createAndEmailSignInLink(user);

            expect(userRepository.saveSignInTokenForUser).toHaveBeenCalledWith({
              userId: user._id,
              signInTokenHash: hashBytes,
              signInTokenSalt: saltBytes,
            });
          });

          it('sends the sign in link email to the user', async () => {
            SIGN_IN_LINK_DURATION.MINUTES = 2;

            await service.createAndEmailSignInLink(user);

            expect(sendEmail).toHaveBeenCalledWith(
              EMAIL_TEMPLATE_IDS.SIGN_IN_LINK,
              user.email,
              {
                firstName: user.firstname,
                lastName: user.surname,
                signInLink,
                signInLinkDuration: '2 minutes',
              },
            );
          });

          it('sends the sign in link email to the user with the correct text if the sign in link duration is 1 minute', async () => {
            SIGN_IN_LINK_DURATION.MINUTES = 1;

            await service.createAndEmailSignInLink(user);

            expect(sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.SIGN_IN_LINK, user.email, {
              firstName: user.firstname,
              lastName: user.surname,
              signInLink,
              signInLinkDuration: '1 minute',
            });
          });

          describe('when sending the sign in link email fails', () => {
            const sendEmailError = new Error();

            beforeEach(() => {
              sendEmail.mockImplementationOnce(() => {
                throw sendEmailError;
              });
            });

            testCreatingAndEmailingTheSignInLinkRejects({
              expectedCause: sendEmailError,
              expectedMessage: 'Failed to email the sign in token.',
            });
          });

          describe('when sending the sign in link email succeeds', () => {
            beforeEach(() => {
              sendEmail.mockResolvedValueOnce(undefined);
            });

            it('resolves', async () => {
              const createAndEmailSignInLinkPromise = service.createAndEmailSignInLink(user);
              await expect(createAndEmailSignInLinkPromise).resolves.toBe(undefined);
            });
          });
        });
      });
    });
  });

  describe('isValidSignInToken', () => {
    describe('when user is found with a saved hash and salt', () => {
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

    describe('when the user does not have a saved hash', () => {
      const testUserWithoutHash = { ...TEST_USER };
      testUserWithoutHash.signInToken = { salt: TEST_USER.signInToken.salt };

      beforeEach(() => {
        mockSuccessfulFindById(testUserWithoutHash);
      });

      itThrowsAnError(InvalidSignInTokenError);
    });

    describe('when the user does not have a saved salt', () => {
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

  async function testCreatingAndEmailingTheSignInLinkRejects({ expectedMessage, expectedCause }) {
    it('rejects', async () => {
      const createAndEmailSignInLinkPromise = service.createAndEmailSignInLink(user);

      await expect(createAndEmailSignInLinkPromise).rejects.toThrowError(expectedMessage);
      await expect(createAndEmailSignInLinkPromise).rejects.toHaveProperty('cause', expectedCause);
    });
  }
});
