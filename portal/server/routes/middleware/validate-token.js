const api = require('../../api');

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
    req.session.destroy(() => {
      res.redirect(startPageRedirect ? 'https://www.gov.uk/guidance/get-a-guarantee-for-export-finance' : '/login');
    });
  }
};

module.exports = validateToken;
