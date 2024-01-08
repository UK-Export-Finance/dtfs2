const { when } = require('jest-when');
const sendEmail = require('../email');

const { SignInLinkService } = require('./sign-in-link.service');
const { SIGN_IN_LINK, EMAIL_TEMPLATE_IDS, USER } = require('../../constants');
const { PORTAL_UI_URL } = require('../../config/sign-in-link.config');
const UserBlockedError = require('../errors/user-blocked.error');
const controller = require('./controller');
const { STATUS } = require('../../constants/user');

jest.mock('../email');
jest.mock('./controller');

const originalSignInLinkDurationMinutes = SIGN_IN_LINK.DURATION_MINUTES;

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
      expiry: new Date().getTime() + SIGN_IN_LINK.DURATION_MILLISECONDS,
    },
  };

  const userWithExpiredSignInToken = JSON.parse(JSON.stringify(user));
  userWithExpiredSignInToken.signInToken.expiry = new Date().getTime() - 1;

  let service;

  let randomGenerator;
  let hasher;
  let userRepository;
  const signInLink = `${PORTAL_UI_URL}/login/sign-in-link?t=${token}&u=${user._id}`;

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
      deleteSignInTokenForUser: jest.fn(),
    };
    service = new SignInLinkService(randomGenerator, hasher, userRepository);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('createAndEmailSignInLink', () => {
    let dateNow;
    beforeAll(() => {
      jest.useFakeTimers();
      dateNow = Date.now();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    describe('when the user has no remaining sendSignInLinkAttemptsRemaining', () => {
      beforeEach(() => {
        userRepository.incrementSignInLinkSendCount.mockResolvedValueOnce(4); // MAX_SIGN_IN_LINK_SEND_COUNT + 1
      });

      it('deletes the users sign in token, blocks the user and throws an error', async () => {
        await expect(service.createAndEmailSignInLink(user)).rejects.toThrowError(UserBlockedError);
        expect(userRepository.blockUser).toHaveBeenCalledWith({ userId: user._id, reason: USER.STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_LINKS });
        expect(userRepository.deleteSignInTokenForUser).toHaveBeenCalledWith(user._id);
        expect(controller.sendBlockedEmail).toHaveBeenCalledWith(user.email);
      });
    });

    describe('when the user has sendSignInLinkAttemptsRemaining', () => {
      const signInLinkCount = 1;
      const numberOfSendSignInLinkAttemptsRemaining = 3 - signInLinkCount;

      beforeEach(() => {
        userRepository.incrementSignInLinkSendCount.mockResolvedValueOnce(1);
      });

      describe('when the user is blocked', () => {
        const blockedUser = { ...user, 'user-status': STATUS.BLOCKED };

        it('throws a UserBlockedError', async () => {
          await expect(service.createAndEmailSignInLink(blockedUser)).rejects.toThrowError(UserBlockedError);
        });
      });

      describe('when the user is not blocked', () => {
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
            randomGenerator.randomHexString.mockReturnValueOnce(token);
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
              let expiry;

              beforeEach(() => {
                expiry = new Date().getTime() + SIGN_IN_LINK.DURATION_MILLISECONDS;
                when(userRepository.saveSignInTokenForUser)
                  .calledWith({
                    userId: user._id,
                    signInTokenHash: hashBytes,
                    signInTokenSalt: saltBytes,
                  })
                  .mockResolvedValueOnce(undefined);
              });

              afterEach(() => {
                SIGN_IN_LINK.DURATION_MINUTES = originalSignInLinkDurationMinutes;
              });

              it('saves the sign in link token hash and salt to the db', async () => {
                await service.createAndEmailSignInLink(user);

                expect(userRepository.saveSignInTokenForUser).toHaveBeenCalledWith({
                  userId: user._id,
                  signInTokenHash: hashBytes,
                  signInTokenSalt: saltBytes,
                  expiry,
                });
              });

              it('sends the sign in link email to the user', async () => {
                await service.createAndEmailSignInLink(user);

                expect(sendEmail).toHaveBeenCalledWith(EMAIL_TEMPLATE_IDS.SIGN_IN_LINK, user.email, {
                  firstName: user.firstname,
                  lastName: user.surname,
                  signInLink,
                  signInLinkDuration: '30 minutes',
                });
              });

              it('sends the sign in link email to the user with the correct text if the sign in link duration is 1 minute', async () => {
                SIGN_IN_LINK.DURATION_MINUTES = 1;

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

                it('resolves and returns numberOfSendSignInLinkAttemptsRemaining', async () => {
                  const createAndEmailSignInLinkPromise = service.createAndEmailSignInLink(user);

                  await expect(createAndEmailSignInLinkPromise).resolves.toBe(numberOfSendSignInLinkAttemptsRemaining);
                });

                it('increments signInLinkSendCount', async () => {
                  await service.createAndEmailSignInLink(user);

                  expect(userRepository.incrementSignInLinkSendCount).toHaveBeenCalledWith({
                    userId: user._id,
                  });
                });

                describe('resetting signInLinkSendCount and signInLinkSendDate', () => {
                  const twelveHoursInMilliseconds = 12 * 60 * 60 * 1000;
                  describe('when the signInLinkSendDate is stale', () => {
                    it('resets signInLinkSendCount and signInLinkSendDate', async () => {
                      const staleDate = dateNow - (twelveHoursInMilliseconds + 1);
                      const userWithStaleSignInLinkSendDate = { ...user, signInLinkSendDate: staleDate };

                      await service.createAndEmailSignInLink(userWithStaleSignInLinkSendDate);

                      expect(userRepository.resetSignInLinkSendCountAndDate).toHaveBeenCalledWith({
                        userId: user._id,
                      });
                    });
                  });

                  describe('when the signInLinkSendDate is not stale', () => {
                    it('does not reset signInLinkSendCount and signInLinkSendDate', async () => {
                      const notStaleDate = dateNow - twelveHoursInMilliseconds; // 12 hr in milliseconds
                      const userWithStaleSignInLinkSendDate = { ...user, signInLinkSendDate: notStaleDate };

                      await service.createAndEmailSignInLink(userWithStaleSignInLinkSendDate);

                      expect(userRepository.resetSignInLinkSendCountAndDate).not.toHaveBeenCalled();
                    });
                  });

                  describe('when there is no signInLinkSendDate present', () => {
                    it('does not reset signInLinkSendCount and signInLinkSendDate', async () => {
                      const userWithNoSignInLinkSendDate = { ...user };
                      delete userWithNoSignInLinkSendDate.signInLinkSendDate;

                      await service.createAndEmailSignInLink(userWithNoSignInLinkSendDate);

                      expect(userRepository.resetSignInLinkSendCountAndDate).not.toHaveBeenCalled();
                    });
                  });
                });

                describe('updating signInLinkSendDate', () => {
                  describe('when the user is in the process of their first signInLinkCount', () => {
                    const userWithNoSignInLinkCount = { ...user };
                    delete userWithNoSignInLinkCount.signInLinkSendCount;
                    delete userWithNoSignInLinkCount.signInLinkSendDate;

                    beforeEach(() => {
                      userRepository.incrementSignInLinkSendCount.mockResolvedValueOnce(1);
                    });

                    it('updates signInLinkSendDate', async () => {
                      await service.createAndEmailSignInLink(userWithNoSignInLinkCount);

                      expect(userRepository.setSignInLinkSendDate).toHaveBeenCalledWith({
                        userId: user._id,
                      });
                    });
                  });

                  describe('when the user is in the process of their second signInLinkCount', () => {
                    const userOnFirstSignInLinkCount = { ...user, signInLinkSendCount: 1 };

                    beforeEach(() => {
                      userRepository.incrementSignInLinkSendCount.mockReset();
                      userRepository.incrementSignInLinkSendCount.mockResolvedValueOnce(2);
                    });

                    it('does not update signInLinkSendDate', async () => {
                      await service.createAndEmailSignInLink(userOnFirstSignInLinkCount);

                      expect(userRepository.setSignInLinkSendDate).not.toHaveBeenCalled();
                    });
                  });
                });

                describe('blockingUser', () => {
                  describe('when the user attempts to send a sign in link when not passed their signInLinkCount', () => {
                    const userOnSecondSignInLinkCount = { ...user, signInLinkSendCount: 2 };

                    beforeEach(() => {
                      userRepository.incrementSignInLinkSendCount.mockReset();
                      userRepository.incrementSignInLinkSendCount.mockResolvedValueOnce(3);
                    });

                    it('does not block the user', async () => {
                      await service.createAndEmailSignInLink(userOnSecondSignInLinkCount);

                      expect(controller.sendBlockedEmail).not.toHaveBeenCalled();
                      expect(userRepository.blockUser).not.toHaveBeenCalled();
                    });
                  });

                  describe('when the user is in the process of their fourth signInLinkCount', () => {
                    const userOnThirdSignInLinkCount = { ...user, signInLinkSendCount: 3 };

                    beforeEach(() => {
                      userRepository.incrementSignInLinkSendCount.mockReset();
                      userRepository.incrementSignInLinkSendCount.mockResolvedValueOnce(4);
                    });

                    it('blocks the user', async () => {
                      await expect(service.createAndEmailSignInLink(userOnThirdSignInLinkCount)).rejects.toThrowError(UserBlockedError);

                      expect(controller.sendBlockedEmail).toHaveBeenCalledWith(user.email);
                      expect(userRepository.blockUser).toHaveBeenCalledWith({
                        userId: user._id,
                        reason: USER.STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_LINKS,
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  async function testCreatingAndEmailingTheSignInLinkRejects({ expectedMessage, expectedCause }) {
    it('rejects', async () => {
      const createAndEmailSignInLinkPromise = service.createAndEmailSignInLink(user);

      await expect(createAndEmailSignInLinkPromise).rejects.toThrowError(expectedMessage);
      await expect(createAndEmailSignInLinkPromise).rejects.toHaveProperty('cause', expectedCause);
    });
  }
});
