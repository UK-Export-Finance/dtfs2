const { sanitizeUser } = require('./sanitizeUserData');
const { TEST_USER_SANITISED_FOR_FRONTEND } = require('../../../test-helpers/unit-test-mocks/mock-user');

describe('sanitizeUserData', () => {
  describe('sanitizeUser', () => {
    const user = TEST_USER_SANITISED_FOR_FRONTEND;

    const userWithExtraField = {
      ...user,
      extraField: 'extraValue',
    };

    const { _id, ...userWithMissingId } = user;

    it('returns an identical copy of the user if there are no extra fields', async () => {
      const returnedUser = sanitizeUser(user);

      expect(returnedUser).toStrictEqual(user);
    });

    it('returns a copy of the user with extra fields removed', async () => {
      const returnedUser = sanitizeUser(userWithExtraField);

      expect(returnedUser).toStrictEqual(user);
    });

    it('returns an copy of the user with missing fields set to undefined', async () => {
      const returnedUser = sanitizeUser(userWithMissingId);

      expect(returnedUser).toStrictEqual({
        ...userWithMissingId,
        _id: undefined,
      });
    });
  });
});
