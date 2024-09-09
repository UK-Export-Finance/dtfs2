const api = require('../../api');
const destroySessionAndRedirectToStart = require('../../helpers/destroy-session-and-redirect-to-start');
/**
 * Global middleware to validate user session
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @param {NextFunction} next Next object
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
