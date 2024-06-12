const { resetAllWhenMocks, when } = require('jest-when');
const { InvalidEmailAddressError, UserNotFoundError } = require('../errors');
const { findByEmail } = require('./controller');
const { TEST_DATABASE_USER, TEST_USER_TRANSFORMED_FROM_DATABASE } = require('../../../test-helpers/unit-test-mocks/mock-user');
const { mongoDbClient: db } = require('../../drivers/db-client');
const { transformDatabaseUser } = require('./transform-database-user');
const { isValidEmail } = require('../../utils/string');

jest.mock('../../drivers/db-client');
jest.mock('../../utils/string');
jest.mock('./transform-database-user');
describe('user controller', () => {
  describe('find user', () => {
    let usersCollection;

    beforeEach(() => {
      jest.resetAllMocks();
      resetAllWhenMocks();

      usersCollection = {
        updateOne: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
      };

      when(db.getCollection).calledWith('users').mockResolvedValueOnce(usersCollection);
    });

    afterAll(() => {
      jest.resetAllMocks();
      resetAllWhenMocks();
    });

    describe('findByEmail', () => {
      const TEST_DATABASE_USER_EMAIL = TEST_DATABASE_USER.email;

      describe('when the email is invalid', () => {
        beforeEach(() => {
          when(isValidEmail).calledWith(TEST_DATABASE_USER_EMAIL).mockReturnValue(false);
        });

        it('throws an InvalidEmailAddressError', async () => {
          when(usersCollection.findOne)
            .calledWith({ email: { $eq: TEST_DATABASE_USER_EMAIL } })
            .mockImplementation(() => TEST_DATABASE_USER);

          await expect(findByEmail(TEST_DATABASE_USER_EMAIL)).rejects.toThrow(InvalidEmailAddressError);
        });
      });

      describe('when the email is valid', () => {
        beforeEach(() => {
          when(isValidEmail).calledWith(TEST_DATABASE_USER_EMAIL).mockReturnValue(true);
        });

        describe('when the user is not found', () => {
          beforeEach(() => {
            when(usersCollection.findOne)
              .calledWith({ email: { $eq: TEST_DATABASE_USER_EMAIL } })
              .mockResolvedValue(null);
          });

          it('throws a UserNotFoundError', async () => {
            await expect(findByEmail(TEST_DATABASE_USER_EMAIL)).rejects.toThrow(UserNotFoundError);
          });
        });

        describe('when collection.findOne throws an error', () => {
          beforeEach(() => {
            when(usersCollection.findOne)
              .calledWith({ email: { $eq: TEST_DATABASE_USER_EMAIL } })
              .mockRejectedValue(new Error());
          });

          it('passes through the error', async () => {
            await expect(findByEmail(TEST_DATABASE_USER_EMAIL)).rejects.toThrow(Error);
          });
        });

        describe('when the user is found', () => {
          beforeEach(() => {
            when(usersCollection.findOne)
              .calledWith({ email: { $eq: TEST_DATABASE_USER_EMAIL } })
              .mockResolvedValue(TEST_DATABASE_USER);

            when(transformDatabaseUser).calledWith(TEST_DATABASE_USER).mockReturnValue(TEST_USER_TRANSFORMED_FROM_DATABASE);
          });

          it('returns the user', async () => {
            const user = await findByEmail(TEST_DATABASE_USER_EMAIL);

            expect(user).toEqual(TEST_USER_TRANSFORMED_FROM_DATABASE);
          });
        });
      });
    });
  });
});
