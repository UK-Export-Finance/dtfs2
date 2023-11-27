/**
 * Redirects the user to '/not-found' if the provided 'bankId' path param does
 * not match the bank assigned to the user.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
const validateBankIdForUser = (req, res, next) => {
  const { user } = req;
  const { bankId } = req.params;

  if (user.bank.id !== bankId) {
    return res.redirect('/not-found');
  }

  return next();
};

module.exports = validateBankIdForUser;
