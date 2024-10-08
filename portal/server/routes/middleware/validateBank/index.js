const {
  ROLES: { ADMIN, READ_ONLY },
} = require('@ukef/dtfs2-common');
const api = require('../../../api');
const { ALL_BANKS_ID } = require('../../../constants');

const validRolesForAccessingAllBanks = [ADMIN, READ_ONLY];

/**
 * Returns `true` if the user has permission to access data from all banks, and `false` otherwise.
 * @param {{ bank: {id: string}, roles: string[] }} user
 * @returns {boolean}
 */
const userCanAccessAllBanks = (user) => {
  const userBankId = user?.bank?.id;
  if (userBankId !== ALL_BANKS_ID) {
    return false;
  }

  const userRoles = user?.roles || [];
  return validRolesForAccessingAllBanks.some((validRole) => userRoles.includes(validRole));
};

const validateBank = async (req, res, next) => {
  if (userCanAccessAllBanks(req.session.user)) {
    return next();
  }

  const { _id: dealId } = req.params;
  const token = req.session.userToken;
  const { id: bankId } = req.session.user.bank;

  // check if the user has access to the resource
  const response = await api.validateBank(dealId, bankId, token);
  if (response.isValid) {
    return next();
  }
  return res.redirect('/not-found');
};

module.exports = validateBank;
