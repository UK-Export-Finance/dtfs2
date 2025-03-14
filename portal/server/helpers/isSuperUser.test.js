const { ALL_BANKS_ID } = require('../constants');
const isSuperUser = require('./isSuperUser');

describe('isSuperUser', () => {
  it('should return true when user.bank.id is `*`', () => {
    const mockUser = {
      bank: { id: ALL_BANKS_ID },
    };

    const result = isSuperUser(mockUser);
    expect(result).toEqual(true);
  });

  it('should return false when user.bank.id is NOT `*`', () => {
    const mockUser = {
      bank: { id: '9' },
    };

    const result = isSuperUser(mockUser);
    expect(result).toEqual(false);
  });
});
