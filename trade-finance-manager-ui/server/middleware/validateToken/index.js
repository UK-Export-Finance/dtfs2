const api = require('../../api');

/**
 * @private
 * @description Destroys a user's session and redirects them to the start page.
 * Warning: This should only be used if token validation has failed. This should not be used elsewhere.
 * @see {@link ../../controllers/login/index.js} for how we should handle user logouts once the token is verified.
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @returns {void}
 */
function destroySessionAndRedirectToStart(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

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

module.exports = { validateToken, destroySessionAndRedirectToStart };
