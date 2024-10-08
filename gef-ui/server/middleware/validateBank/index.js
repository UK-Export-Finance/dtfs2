const { ADMIN, READ_ONLY } = require('../../constants/roles');
const { ALL_BANKS_ID } = require('../../constants');
const api = require('../../services/api');

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
  try {
    if (userCanAccessAllBanks(req.session.user)) {
      return next();
    }

    const { dealId } = req.params;
    const { userToken } = req.session;
    const { id: bankId } = req.session.user.bank;

    // check if the user has access to the resource
    const response = await api.validateBank({ dealId, bankId, userToken });
    if (response.isValid) {
      return next();
    }
  } catch (error) {
    console.error('Unable to validate the bank');
    return res.redirect('/not-found');
  }
  return res.redirect('/not-found');
};

module.exports = validateBank;
