const api = require('../../api');
const destroySessionAndRedirectToStart = require('../../helpers/destroy-session-and-redirect-to-start');
/**
 * Global middleware to validate user session
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Object} next Next object
 */
const validateToken = async (req, res, next) => {
  const { userToken } = req.session;

  if (userToken && (await api.validateToken(userToken))) {
    next();
  } else {
    console.error('validateToken - Error - Invalid user JWT, destroying session and redirect to start');
    destroySessionAndRedirectToStart(req, res);
  }
};

module.exports = { validateToken };
