const api = require('../../../api');
const destroySessionAndRedirectToStart = require('../../../utils/destroy-session-and-redirect-to-start');
/**
 * Global middleware to validate user session
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Object} next Next object
 */
const validateToken = async (req, res, next) => {
  const { userToken } = req.session;

  if (await api.validateToken(userToken)) {
    next();
  } else {
    destroySessionAndRedirectToStart(req, res);
  }
};

module.exports = validateToken;
