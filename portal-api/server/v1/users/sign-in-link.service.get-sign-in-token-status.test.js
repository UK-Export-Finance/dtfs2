const { produce } = require('immer');
const { when } = require('jest-when');
const { cloneDeep } = require('lodash');
const { TEST_USER_TRANSFORMED_FROM_DATABASE } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { InvalidUserIdError, UserNotFoundError } = require('../errors');
const { SignInLinkService } = require('./sign-in-link.service');
const { SIGN_IN_LINK } = require('../../constants');

describe('getSignInTokenStatus', () => {
  let service;

  let randomGenerator;
  let hasher;
  let userRepository;

  let testUserFromDatabase = cloneDeep(TEST_USER_TRANSFORMED_FROM_DATABASE);

  const aTokenProvidedByUser = 'A token provided by user';

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();

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
      resetSignInData: jest.fn(),
      findById: jest.fn(),
      blockUser: jest.fn(),
    };

    service = new SignInLinkService(randomGenerator, hasher, userRepository);

    testUserFromDatabase = cloneDeep(TEST_USER_TRANSFORMED_FROM_DATABASE);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('when a userId is invalid', () => {
    beforeEach(() => {
      userRepository.findById.mockRejectedValue(new InvalidUserIdError(testUserFromDatabase._id));
    });

    itThrowsAnError(InvalidUserIdError);
  });

  describe('when a user is not found', () => {
    beforeEach(() => {
      userRepository.findById.mockRejectedValue(new UserNotFoundError(testUserFromDatabase._id));
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

      describe('when a user provides a token that does not matched any saved tokens', () => {
        beforeEach(() => {
          mockVerifyHashToFail();
        });

        itReturnsTokenNotFound();
      });
    });

    describe('when a user has one saved tokens', () => {
      describe('when a user provides a token that does not matched any saved tokens', () => {
        beforeEach(() => {
          mockDatabaseTestUserWithSignInTokens([lastIssuedTokenInDatabaseInFuture]);
          mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
          mockVerifyHashToFail();
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
          });

          itReturnsTokenExpired();
        });

        describe('when the saved token expires now', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([lastIssuedTokenInDatabaseNow]);
            mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
            mockVerifyHashToSucceedWith({
              databaseHash: lastIssuedTokenInDatabaseNow.hash,
              databaseSalt: lastIssuedTokenInDatabaseNow.salt,
            });
          });

          itReturnsTokenValid();
        });

        describe('when the saved token expires in the future', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([lastIssuedTokenInDatabaseInFuture]);
            mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
            mockVerifyHashToSucceedWith({
              databaseHash: lastIssuedTokenInDatabaseInFuture.hash,
              databaseSalt: lastIssuedTokenInDatabaseInFuture.salt,
            });
          });

          itReturnsTokenValid();
        });
      });
    });

    describe('when a user has multiple saved tokens', () => {
      describe('when a user provides a token that does not matched any saved tokens', () => {
        beforeEach(() => {
          mockDatabaseTestUserWithSignInTokens([
            thirdLastIssuedTokenInDatabaseInFuture,
            secondLastIssuedTokenInDatabaseInFuture,
            lastIssuedTokenInDatabaseInFuture,
          ]);
          mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
          mockVerifyHashToFail();
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
          });

          itReturnsTokenExpired();
        });

        describe('when the saved token expires now', () => {
          beforeEach(() => {
            mockDatabaseTestUserWithSignInTokens([thirdLastIssuedTokenInDatabaseInPast, secondLastIssuedTokenInDatabaseInPast, lastIssuedTokenInDatabaseNow]);
            mockUserRepositoryFindByIdToReturn(testUserFromDatabase);
            mockVerifyHashToSucceedWith({
              databaseHash: lastIssuedTokenInDatabaseNow.hash,
              databaseSalt: lastIssuedTokenInDatabaseNow.salt,
            });
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
            mockVerifyHashToSucceedWith({
              databaseHash: lastIssuedTokenInDatabaseInFuture.hash,
              databaseSalt: lastIssuedTokenInDatabaseInFuture.salt,
            });
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
      await expect(service.getSignInTokenStatus({ userId: testUserFromDatabase._id, signInToken: aTokenProvidedByUser })).resolves.toEqual(expectedStatus);
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
