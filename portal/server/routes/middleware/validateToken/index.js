const api = require('../../../api');
const { PORTAL_URL } = require('../../../constants');
/**
 * Global middleware to validate user session
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Object} next Next object
 */
const validateToken = async (req, res, next) => {
  const { userToken } = req.session;
  const startPageRedirect = Boolean(process.env.START_PAGE_REDIRECT);

  if (await api.validateToken(userToken)) {
    next();
  } else {
    const redirectAddress = startPageRedirect ? PORTAL_URL : '/login';
    req.session.destroy(() => {
      res.redirect(redirectAddress);
    });
  }
};

module.exports = validateToken;
