const api = require('../../services/api');

const validateBank = async (req, res, next) => {
  const { dealId } = req.params;
  const { id: userId } = req.session.user.bank;

  const response = await api.validateBank(dealId, userId);
  if (response.isValid) {
    return next();
  }
  return res.redirect('/not-found');
};

module.exports = validateBank;
