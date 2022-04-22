const api = require('../../services/api');

exports.validateBank = async (req, res, next) => {
  const { dealId } = req.params;
  const { id: bankId } = req.session.user.bank;

  // check if the current user is an admin
  if (bankId === '*' && req.session.user.roles.includes('admin')) {
    return next();
  }

  // check if the user has access to the resource
  const response = await api.validateBank(dealId, bankId);
  if (response.isValid) {
    return next();
  }
  return res.redirect('/not-found');
};
