/**
 * Sends a 401 response if the user's bank id and queried
 * bank id do not match. Otherwise, calls the next method.
 * @param {(req, res)}
 * @param {void}
 */
const validateUserAndBankIdMatch = (req, res, next) => {
  const { user } = req;
  const { bankId } = req.params;

  if (user.bank.id !== bankId) {
    return res.status(401).json({ success: false, msg: 'Bank id of user and queried bank id do not match' });
  }

  return next();
};

module.exports = {
  validateUserAndBankIdMatch,
};
