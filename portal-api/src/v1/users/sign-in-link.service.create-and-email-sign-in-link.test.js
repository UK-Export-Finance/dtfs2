const { when } = require('jest-when');
const { cloneDeep } = require('lodash');
const sendEmail = require('../email');

const { SignInLinkService } = require('./sign-in-link.service');
const { UserService } = require('./user.service');
const { SIGN_IN_LINK, EMAIL_TEMPLATE_IDS, USER } = require('../../constants');
const UserBlockedError = require('../errors/user-blocked.error');
const controller = require('./controller');
const { STATUS } = require('../../constants/user');
const { TEST_USER_PARTIAL_2FA } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { mockSignInLinkGenerator } = require('../../../test-helpers/unit-test-mocks/mock-sign-in-link-generator');
const { FailedToCreateSignInTokenError, FailedToSaveSignInTokenError, FailedToSendSignInTokenError } = require('../errors');

jest.mock('../email');
jest.mock('./controller');

const originalSignInLinkDurationMinutes = SIGN_IN_LINK.DURATION_MINUTES;

describe('SignInLinkService', () => {
  const hash = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const hashBytes = Buffer.from(hash, 'hex');

  const salt = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';
  const saltBytes = Buffer.from(salt, 'hex');

  const token = '0a1b2c3d4e5f67890a1b2c3d4e5f6789';
  let service;

  let signInLinkGenerator;
  let hasher;
  let userRepository;
  const userService = new UserService();
  let user = cloneDeep(TEST_USER_PARTIAL_2FA);
  const signInLink = `A sign in link with token ${token}`;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    signInLinkGenerator = mockSignInLinkGenerator;
    when(signInLinkGenerator.createSignInArtifactFromSignInToken).calledWith(token).mockReturnValue(signInLink);
    hasher = {
      hash: jest.fn(),
      verifyHash: jest.fn(),
    };
    userRepository = {
      saveSignInTokenForUser: jest.fn(),
      incrementSignInLinkSendCount: jest.fn(),
      setSignInLinkSendDate: jest.fn(),
      resetSignInData: jest.fn(),
      findById: jest.fn(),
      blockUser: jest.fn(),
    };
    service = new SignInLinkService(signInLinkGenerator, hasher, userRepository, userService);
    user = cloneDeep(TEST_USER_PARTIAL_2FA);
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

    describe('when the user has sendSignInLinkAttemptsRemaining', () => {
      const signInLinkCount = 1;
      const numberOfSendSignInLinkAttemptsRemaining = SIGN_IN_LINK.MAX_SEND_COUNT - signInLinkCount;

      beforeEach(() => {
        userRepository.incrementSignInLinkSendCount.mockResolvedValueOnce(1);
      });

      describe('when the user is blocked', () => {
        const blockedUser = { ...user, 'user-status': STATUS.BLOCKED };

        it('throws a UserBlockedError', async () => {
          await expect(service.createAndEmailSignInLink(blockedUser)).rejects.toThrowError(UserBlockedError);
        });
      });

      describe('when the user is disabled', () => {
        const disabledUser = { ...user, disabled: true };

        it('throws a UserBlockedError', async () => {
          await expect(service.createAndEmailSignInLink(disabledUser)).rejects.toThrowError(UserBlockedError);
        });
      });

      describe('when the user is not blocked or disabled', () => {
        describe('when creating the sign in token fails', () => {
          const createSignInTokenError = new FailedToCreateSignInTokenError();

          beforeEach(() => {
            signInLinkGenerator.createSignInToken.mockImplementationOnce(() => {
              throw createSignInTokenError;
            });
          });

          testCreatingAndEmailingTheSignInLinkRejects({
            expectedError: createSignInTokenError,
          });
        });

        describe('when creating the sign in token succeeds', () => {
          beforeEach(() => {
            signInLinkGenerator.createSignInToken.mockReturnValueOnce(token);
          });

          describe('when hashing the sign in link token fails', () => {
            const hashError = new Error();
            const expectedError = new FailedToSaveSignInTokenError({ cause: hashError });
            beforeEach(() => {
              hasher.hash.mockImplementationOnce(() => {
                throw hashError;
              });
            });

            testCreatingAndEmailingTheSignInLinkRejects({
              expectedError,
            });
          });

          describe('when hashing the sign in link token succeeds', () => {
            beforeEach(() => {
              when(hasher.hash).calledWith(token).mockReturnValueOnce({ hash: hashBytes, salt: saltBytes });
            });

            describe('when saving the sign in link token to the database fails', () => {
              const saveToRepositoryError = new Error();
              const expectedError = new FailedToSaveSignInTokenError({ cause: saveToRepositoryError });

              beforeEach(() => {
                userRepository.saveSignInTokenForUser.mockRejectedValueOnce(saveToRepositoryError);
              });

              testCreatingAndEmailingTheSignInLinkRejects({
                expectedError,
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
                const expectedError = new FailedToSendSignInTokenError({ cause: sendEmailError });

                beforeEach(() => {
                  sendEmail.mockImplementationOnce(() => {
                    throw sendEmailError;
                  });
                });

                testCreatingAndEmailingTheSignInLinkRejects({
                  expectedError,
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

                      expect(userRepository.resetSignInData).toHaveBeenCalledWith({
                        userId: user._id,
                      });
                    });
                  });

                  describe('when the signInLinkSendDate is not stale', () => {
                    it('does not reset signInLinkSendCount and signInLinkSendDate', async () => {
                      const notStaleDate = dateNow - twelveHoursInMilliseconds; // 12 hr in milliseconds
                      const userWithStaleSignInLinkSendDate = { ...user, signInLinkSendDate: notStaleDate };

                      await service.createAndEmailSignInLink(userWithStaleSignInLinkSendDate);

                      expect(userRepository.resetSignInData).not.toHaveBeenCalled();
                    });
                  });

                  describe('when there is no signInLinkSendDate present', () => {
                    it('does not reset signInLinkSendCount and signInLinkSendDate', async () => {
                      const userWithNoSignInLinkSendDate = { ...user };
                      delete userWithNoSignInLinkSendDate.signInLinkSendDate;

                      await service.createAndEmailSignInLink(userWithNoSignInLinkSendDate);

                      expect(userRepository.resetSignInData).not.toHaveBeenCalled();
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
                      userRepository.incrementSignInLinkSendCount.mockResolvedValueOnce(SIGN_IN_LINK.MAX_SEND_COUNT);
                    });

                    it('does not block the user', async () => {
                      await service.createAndEmailSignInLink(userOnSecondSignInLinkCount);

                      expect(controller.sendBlockedEmail).not.toHaveBeenCalled();
                      expect(userRepository.blockUser).not.toHaveBeenCalled();
                    });
                  });

                  describe('when the user is in the process of their fourth signInLinkCount', () => {
                    const userOnThirdSignInLinkCount = { ...user, signInLinkSendCount: SIGN_IN_LINK.MAX_SEND_COUNT };

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

  async function testCreatingAndEmailingTheSignInLinkRejects({ expectedError }) {
    it('rejects', async () => {
      const createAndEmailSignInLinkPromise = service.createAndEmailSignInLink(user);

      await expect(() => createAndEmailSignInLinkPromise).rejects.toThrow(expectedError);
    });
  }
});
