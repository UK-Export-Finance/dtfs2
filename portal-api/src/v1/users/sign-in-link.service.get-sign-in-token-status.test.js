const { produce } = require('immer');
const { when } = require('jest-when');
const { TEST_USER_TRANSFORMED_FROM_DATABASE } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { InvalidUserIdError, UserNotFoundError, InvalidSignInTokenError } = require('../errors');
const { SignInLinkService } = require('./sign-in-link.service');
const { SIGN_IN_LINK } = require('../../constants');

describe('getSignInTokenStatus', () => {
  let service;

  let randomGenerator;
  let hasher;
  let userRepository;

  let testUserFromDatabase = produce(TEST_USER_TRANSFORMED_FROM_DATABASE, (draft) => {});

  const aTokenProvidedByUser = 'A token provided by user';

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    randomGenerator = {
      randomHexString: jest.fn(),
      validateHexString: jest.fn(),
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

    testUserFromDatabase = produce(TEST_USER_TRANSFORMED_FROM_DATABASE, (draft) => {});
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('when a userId is invalid', () => {
    beforeEach(() => {
      userRepository.findById.mockRejectedValue(new InvalidUserIdError(testUserFromDatabase._id));
      mockValidateHexStringToSucceed();
    });

    itThrowsAnError(InvalidUserIdError);
  });

  describe('when a user is not found', () => {
    beforeEach(() => {
      userRepository.findById.mockRejectedValue(new UserNotFoundError(testUserFromDatabase._id));
      mockValidateHexStringToSucceed();
    });

    itThrowsAnError(UserNotFoundError);
  });

  describe('when a user is found', () => {
    const lastIssuedTokenInDatabaseWithNoDate = { salt: 'lastIssuedToken', hash: 'lastIssuedToken' };
    const secondLastIssuedTokenInDatabaseWithNoDate = { salt: 'secondLastIssuedSalt', hash: 'secondLastIssuedHash' };
    const thirdLastIssuedSignInTokenInDatabaseWithNoDate = { salt: 'thirdLastIssuedSalt', hash: 'thirdLastIssuedHash' };

    let dateNow;
    let dateInPast;
    let dateInFuture;

    let lastIssuedTokenInDatabaseInFuture;
    let lastIssuedTokenInDatabaseNow;
    let lastIssuedTokenInDatabaseInPast;
    let secondLastIssuedTokenInDatabaseInFuture;
    let secondLastIssuedTokenInDatabaseInPast;
    let thirdLastIssuedTokenInDatabaseInFuture;
    let thirdLastIssuedTokenInDatabaseInPast;

    beforeEach(() => {
      dateNow = Date.now();
      dateInPast = Date.now() - 10000;
      dateInFuture = Date.now() + 10000;

      lastIssuedTokenInDatabaseInFuture = produce(lastIssuedTokenInDatabaseWithNoDate, (draft) => {
        draft.expiry = dateInFuture;
      });
      lastIssuedTokenInDatabaseNow = produce(lastIssuedTokenInDatabaseWithNoDate, (draft) => {
        draft.expiry = dateNow;
      });
      lastIssuedTokenInDatabaseInPast = produce(lastIssuedTokenInDatabaseWithNoDate, (draft) => {
        draft.expiry = dateInPast;
      });

      secondLastIssuedTokenInDatabaseInFuture = produce(secondLastIssuedTokenInDatabaseWithNoDate, (draft) => {
        draft.expiry = dateInFuture;
      });

      secondLastIssuedTokenInDatabaseInPast = produce(secondLastIssuedTokenInDatabaseWithNoDate, (draft) => {
        draft.expiry = dateInPast;
      });

      thirdLastIssuedTokenInDatabaseInFuture = produce(thirdLastIssuedSignInTokenInDatabaseWithNoDate, (draft) => {
        draft.expiry = dateInFuture;
      });

      thirdLastIssuedTokenInDatabaseInPast = produce(thirdLastIssuedSignInTokenInDatabaseWithNoDate, (draft) => {
        draft.expiry = dateInPast;
      });
    });
    describe('when a user has no saved sign in tokens', () => {
      beforeEach(() => {
        mockDatabaseTestUserWithoutSignInTokens();
      });

      describe('when a user provides a token that is not valid', () => {
        beforeEach(() => {
          mockValidateHexStringToFail();
        });

        itThrowsAnError(InvalidSignInTokenError);
      });

      describe('when a user provides a token that does not matched any saved tokens', () => {
        beforeEach(() => {
          mockValidateHexStringToSucceed();
          mockVerifyHashToFail();
        });

        itReturnsTokenNotFound();
      });
    });

    describe('when a user has one saved tokens', () => {
      describe('when a user provides a token that is not valid', () => {
        beforeEach(() => {
          mockDatabaseTestUserWithSignInTokens([lastIssuedTokenInDatabaseInFuture]);
          mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
          mockValidateHexStringToFail();
        });

        itThrowsAnError(InvalidSignInTokenError);
      });

      describe('when a user provides a token that does not matched any saved tokens', () => {
        beforeEach(() => {
          mockDatabaseTestUserWithSignInTokens([lastIssuedTokenInDatabaseInFuture]);
          mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
          mockVerifyHashToFail();
          mockValidateHexStringToSucceed();
        });

        itReturnsTokenNotFound();
      });

      describe('when a user provides the last issued token', () => {
        describe('when the saved token has expired', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([lastIssuedTokenInDatabaseInPast]);
            mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
            mockVerifyHashToSucceedWith({
              databaseHash: lastIssuedTokenInDatabaseInPast.hash,
              databaseSalt: lastIssuedTokenInDatabaseInPast.salt,
            });
            mockValidateHexStringToSucceed();
          });

          itReturnsTokenExpired();
        });

        describe('when the saved token expires now', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([lastIssuedTokenInDatabaseNow]);
            mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
            mockVerifyHashToSucceedWith({ databaseHash: lastIssuedTokenInDatabaseNow.hash, databaseSalt: lastIssuedTokenInDatabaseNow.salt });
            mockValidateHexStringToSucceed();
          });

          itReturnsTokenValid();
        });

        describe('when the saved token expires in the future', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([lastIssuedTokenInDatabaseInFuture]);
            mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
            mockVerifyHashToSucceedWith({ databaseHash: lastIssuedTokenInDatabaseInFuture.hash, databaseSalt: lastIssuedTokenInDatabaseInFuture.salt });
            mockValidateHexStringToSucceed();
          });

          itReturnsTokenValid();
        });
      });
    });

    describe('when a user has multiple saved tokens', () => {
      describe('when a user provides a token that is not valid', () => {
        beforeEach(() => {
          mockDatabaseTestUserWithSignInTokens([
            thirdLastIssuedTokenInDatabaseInFuture,
            secondLastIssuedTokenInDatabaseInFuture,
            lastIssuedTokenInDatabaseInFuture,
          ]);
          mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
          mockValidateHexStringToFail();
        });

        itThrowsAnError(InvalidSignInTokenError);
      });

      describe('when a user provides a token that does not matched any saved tokens', () => {
        beforeEach(() => {
          mockDatabaseTestUserWithSignInTokens([
            thirdLastIssuedTokenInDatabaseInFuture,
            secondLastIssuedTokenInDatabaseInFuture,
            lastIssuedTokenInDatabaseInFuture,
          ]);
          mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
          mockVerifyHashToFail();
          mockValidateHexStringToSucceed();
        });

        itReturnsTokenNotFound();
      });

      describe('when a user provides a token that is a previously issued token', () => {
        describe('when the user provides a token that expires in the future', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([
              thirdLastIssuedTokenInDatabaseInFuture,
              secondLastIssuedTokenInDatabaseInFuture,
              lastIssuedTokenInDatabaseInFuture,
            ]);
            mockVerifyHashToSucceedWith({
              databaseHash: thirdLastIssuedTokenInDatabaseInFuture.hash,
              databaseSalt: thirdLastIssuedTokenInDatabaseInFuture.salt,
            });
            mockValidateHexStringToSucceed();
          });
          itReturnsTokenExpired();
        });

        describe('when the provided token has expired', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([
              thirdLastIssuedTokenInDatabaseInPast,
              secondLastIssuedTokenInDatabaseInPast,
              lastIssuedTokenInDatabaseInFuture,
            ]);
            mockVerifyHashToSucceedWith({
              databaseHash: thirdLastIssuedTokenInDatabaseInPast.hash,
              databaseSalt: thirdLastIssuedTokenInDatabaseInPast.salt,
            });
            mockValidateHexStringToSucceed();
          });

          itReturnsTokenExpired();
        });
      });

      describe('when a user provides the last issued token', () => {
        describe('when the saved token has expired', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([
              thirdLastIssuedTokenInDatabaseInPast,
              secondLastIssuedTokenInDatabaseInPast,
              lastIssuedTokenInDatabaseInPast,
            ]);
            mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
            mockVerifyHashToSucceedWith({
              databaseHash: lastIssuedTokenInDatabaseInPast.hash,
              databaseSalt: lastIssuedTokenInDatabaseInPast.salt,
            });
            mockValidateHexStringToSucceed();
          });

          itReturnsTokenExpired();
        });

        describe('when the saved token expires now', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([thirdLastIssuedTokenInDatabaseInPast, secondLastIssuedTokenInDatabaseInPast, lastIssuedTokenInDatabaseNow]);
            mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
            mockVerifyHashToSucceedWith({ databaseHash: lastIssuedTokenInDatabaseNow.hash, databaseSalt: lastIssuedTokenInDatabaseNow.salt });
            mockValidateHexStringToSucceed();
          });

          itReturnsTokenValid();
        });

        describe('when the saved token expires in the future', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([
              thirdLastIssuedTokenInDatabaseInPast,
              secondLastIssuedTokenInDatabaseInPast,
              lastIssuedTokenInDatabaseInFuture,
            ]);
            mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
            mockVerifyHashToSucceedWith({ databaseHash: lastIssuedTokenInDatabaseInFuture.hash, databaseSalt: lastIssuedTokenInDatabaseInFuture.salt });
            mockValidateHexStringToSucceed();
          });

          itReturnsTokenValid();
        });
      });
    });
  });

  function mockDatabaseTestUserWithSignInTokens(signInTokens) {
    testUserFromDatabase = produce(testUserFromDatabase, (draft) => {
      delete draft.signInTokens;
      draft.signInTokens = signInTokens;
    });
    mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
  }

  function mockDatabaseTestUserWithoutSignInTokens() {
    testUserFromDatabase = produce(testUserFromDatabase, (draft) => {
      delete draft.signInTokens;
    });
    mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
  }

  function mockValidateHexStringToSucceed() {
    when(randomGenerator.validateHexString)
      .calledWith({ numberOfBytes: expect.any(Number), inputString: aTokenProvidedByUser })
      .mockReturnValue(true);
  }

  function mockValidateHexStringToFail() {
    when(randomGenerator.validateHexString)
      .calledWith({ numberOfBytes: expect.any(Number), inputString: aTokenProvidedByUser })
      .mockReturnValue(false);
  }

  function mockVerifyHashToSucceedWith({ databaseHash, databaseSalt }) {
    hasher.verifyHash.mockImplementation(({ target, hash, salt }) => target === aTokenProvidedByUser && hash === databaseHash && salt === databaseSalt);
  }

  function mockVerifyHashToFail() {
    hasher.verifyHash.mockReturnValue(false);
  }

  function mockUserRepositoryFindByIdToReturn(user) {
    when(userRepository.findById).calledWith(user._id).mockResolvedValueOnce(user);
  }

  function itReturnsTheStatus(expectedStatus) {
    it(`returns ${expectedStatus}`, async () => {
      await expect(service.getSignInTokenStatus({ userId: testUserFromDatabase._id, signInToken: aTokenProvidedByUser })).resolves.toBe(expectedStatus);
    });
  }

  function itReturnsTokenNotFound() {
    itReturnsTheStatus(SIGN_IN_LINK.STATUS.NOT_FOUND);
  }

  function itReturnsTokenExpired() {
    itReturnsTheStatus(SIGN_IN_LINK.STATUS.EXPIRED);
  }

  function itReturnsTokenValid() {
    itReturnsTheStatus(SIGN_IN_LINK.STATUS.VALID);
  }

  function itThrowsAnError(errorType = Error) {
    it('throws an error', async () => {
      await expect(service.getSignInTokenStatus({ userId: testUserFromDatabase._id, signInToken: aTokenProvidedByUser })).rejects.toThrow(errorType);
    });
  }
});
