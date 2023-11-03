const { when } = require('jest-when');
const sendEmail = require('../email');

const { SignInLinkService } = require('./sign-in-link.service');
const { SIGN_IN_LINK_EXPIRY_MINUTES, EMAIL_TEMPLATE_IDS } = require('../../constants');
const { PORTAL_UI_URL } = require('../../config/sign-in-link.config');

jest.mock('../email');

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
  };

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
    };
    userRepository = {
      saveSignInTokenForUser: jest.fn(),
    };
    service = new SignInLinkService(
      randomGenerator,
      hasher,
      userRepository,
    );
  });

  describe('createAndEmailSignInLink', () => {
    describe('when creating the sign in link token fails', () => {
      const createSignInLinkTokenError = new Error();

      beforeEach(() => {
        randomGenerator.randomHexString.mockImplementationOnce(() => { throw createSignInLinkTokenError; });
      });

      testCreatingAndEmailingTheSignInLinkRejects({
        expectedCause: createSignInLinkTokenError,
        expectedMessage: 'Failed to create a sign in token.'
      });
    });

    describe('when creating the sign in link token succeeds', () => {
      beforeEach(() => {
        when(randomGenerator.randomHexString)
          .calledWith(32)
          .mockReturnValueOnce(token);
      });

      describe('when hashing the sign in link token fails', () => {
        const hashError = new Error();

        beforeEach(() => {
          hasher.hash.mockImplementationOnce(() => { throw hashError; });
        });

        testCreatingAndEmailingTheSignInLinkRejects({
          expectedCause: hashError,
          expectedMessage: 'Failed to save the sign in token.'
        });
      });

      describe('when hashing the sign in link token succeeds', () => {
        beforeEach(() => {
          when(hasher.hash)
            .calledWith(token)
            .mockReturnValueOnce({ hash: hashBytes, salt: saltBytes });
        });

        describe('when saving the sign in link token to the database fails', () => {
          const savingTokenError = new Error();

          beforeEach(() => {
            userRepository.saveSignInTokenForUser.mockRejectedValueOnce(savingTokenError);
          });

          testCreatingAndEmailingTheSignInLinkRejects({
            expectedCause: savingTokenError,
            expectedMessage: 'Failed to save the sign in token.'
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

          it('saves the sign in link token hash and salt to the db', async () => {
            await service.createAndEmailSignInLink(user);

            expect(userRepository.saveSignInTokenForUser).toHaveBeenCalledWith({
              userId: user._id,
              signInTokenHash: hashBytes,
              signInTokenSalt: saltBytes,
            });
          });

          it('sends the sign in link email to the user', async () => {
            await service.createAndEmailSignInLink(user);

            expect(sendEmail).toHaveBeenCalledWith(
              EMAIL_TEMPLATE_IDS.SIGN_IN_LINK,
              user.email,
              {
                firstName: user.firstname,
                lastName: user.surname,
                signInLink,
                signInLinkExpiryMinutes: SIGN_IN_LINK_EXPIRY_MINUTES,
              },
            );
          });

          describe('when sending the sign in link email fails', () => {
            const sendEmailError = new Error();

            beforeEach(() => {
              sendEmail.mockImplementationOnce(() => { throw sendEmailError; });
            });

            testCreatingAndEmailingTheSignInLinkRejects({
              expectedCause: sendEmailError,
              expectedMessage: 'Failed to email the sign in token.'
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

  async function testCreatingAndEmailingTheSignInLinkRejects({ expectedMessage, expectedCause }) {
    it('rejects', async () => {
      const createAndEmailSignInLinkPromise = service.createAndEmailSignInLink(user);

      await expect(createAndEmailSignInLinkPromise)
        .rejects.toThrowError(expectedMessage);
      await expect(createAndEmailSignInLinkPromise)
        .rejects.toHaveProperty('cause', expectedCause);
    });
  }
});
