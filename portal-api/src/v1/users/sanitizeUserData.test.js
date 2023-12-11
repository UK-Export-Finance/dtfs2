const { ObjectId } = require('mongodb');
const { MAKER } = require('../../../../utils/mock-data-loader/portal/roles');
const { sanitizeUser } = require('./sanitizeUserData');

describe('sanitizeUserData', () => {
  describe('sanitizeUser', () => {
    const user = {
      _id: new ObjectId(),
      username: 'HSBC-maker-1',
      firstname: 'Mister',
      surname: 'One',
      email: 'one@email.com',
      timezone: 'Europe/London',
      roles: [MAKER],
      bank: {
        id: '961',
        name: 'HSBC',
        emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
      },
      lastLogin: new Date().getTime(),
      'user-status': 'blocked',
      disabled: true,
      signInLinkSendDate: new Date().getTime(),
      signInLinkSendCount: 1,
    };

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
