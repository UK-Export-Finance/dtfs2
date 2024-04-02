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

    // if we have a login-complete token instead of a partialAuthToken then we should redirect to home page
    // as they have already completed 2FA
    const isValidToken = await api.validateToken(userToken);
    if (isValidToken) {
      console.info('User already has a valid login complete token, redirecting to home page');
      return res.redirect('/');
    }

    await api.validatePartialAuthToken(userToken);
    return next();
  } catch (error) {
    console.error('Partial auth token is not valid, destroying the session %o', error);
    return destroySessionAndRedirectToStart(req, res);
  }
};

module.exports = {
  validatePartialAuthToken,
};
