const api = require('../../services/api');

const ukefAdminRoles = ['ukef_operations', 'admin', 'ukef_admin'];

const validateBank = async (req, res, next) => {
  try {
    const { dealId } = req.params;
    const { id: bankId } = req.session.user.bank;
    // check if the current user is an admin
    if (bankId === '*' && ukefAdminRoles.some((adminRole) => req?.session?.user?.roles.includes(adminRole))) {
      return next();
    }

    // check if the user has access to the resource
    const response = await api.validateBank(dealId, bankId);
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
