const api = require('../../../api');
const { PORTAL_URL } = require('../../../constants');
/**
 * Validate the session contains a userToken for partial 2FA
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Object} next Next object
 */
const validatePartialAuthToken = async (req, res, next) => {
  try {
    const { userToken } = req.session;

    if (!userToken) {
      console.info('User has not logged in, destroying the session');
      return destroySessionAndRedirectToStart(req, res);
    }

    await api.validatePartialAuthToken(userToken);
    return next();
  } catch (error) {
    console.error('Partial auth token is not valid, destroying the session: %s', error);
    return destroySessionAndRedirectToStart(req, res);
  }
};

// TODO DTFS2-6770: extract
function destroySessionAndRedirectToStart(req, res) {
  const startPageRedirect = Boolean(process.env.START_PAGE_REDIRECT);
  const redirectAddress = startPageRedirect ? PORTAL_URL : '/login';

  req.session.destroy(() => {
    res.redirect(redirectAddress);
  });
}

module.exports = {
  validatePartialAuthToken,
};
