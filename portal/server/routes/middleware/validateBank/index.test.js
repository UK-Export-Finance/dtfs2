const validateBank = require('.');
const { ADMIN, READ_ONLY } = require('../../../constants/roles');

describe('validateBank', () => {
  const dealId = 'deal id';

  let res;
  let next;

  beforeEach(() => {
    res = { redirect: jest.fn() };
    next = jest.fn();
  });

  describe('when the current user has bankId *', () => {
    const bankId = '*';

    it('calls next if the current user has the admin role', async () => {
      const req = buildRequestFromUserWith({ roles: [ADMIN], bankId });

      await validateBank(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('calls next if the current user has the read-only role', async () => {
      const req = buildRequestFromUserWith({ roles: [READ_ONLY], bankId });

      await validateBank(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  function buildRequestFromUserWith({ roles, bankId }) {
    const user = {
      bank: {
        id: bankId,
      },
      roles,
    };
    return {
      params: {
        _id: dealId,
      },
      session: {
        user,
      },
    };
  }
});
