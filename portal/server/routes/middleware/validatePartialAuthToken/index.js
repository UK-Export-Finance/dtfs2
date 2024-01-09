const destroySessionAndRedirectToStart = require('../../../utils/destroy-session-and-redirect-to-start');
const api = require('../../../api');
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

module.exports = {
  validatePartialAuthToken,
};
