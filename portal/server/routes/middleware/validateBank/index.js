const api = require('../../../api');

const ukefAdminRoles = ['ukef_operations', 'admin', 'ukef_admin'];

const validateBank = async (req, res, next) => {
  const { _id: dealId } = req.params;
  const { id: bankId } = req.session.user.bank;
  const token = req.session.userToken;

  // check if the current user is an admin
  if (bankId === '*' && ukefAdminRoles.some((adminRole) => req?.session?.user?.roles.includes(adminRole))) {
    return next();
  }

  // check if the user has access to the resource
  const response = await api.validateBank(dealId, bankId, token);
  if (response.isValid) {
    return next();
  }
  return res.redirect('/not-found');
};

module.exports = validateBank;
