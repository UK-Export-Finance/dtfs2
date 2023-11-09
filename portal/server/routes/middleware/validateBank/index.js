const api = require('../../../api');
const { ADMIN, READ_ONLY } = require('../../../constants/roles');

const validRolesForAccessingAllBanks = [
  ADMIN,
  READ_ONLY,
];

const userCanAccessAllBanks = (user) => {
  const userBankId = user?.bank?.id;
  if (userBankId !== '*') {
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
