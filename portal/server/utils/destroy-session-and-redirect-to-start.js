const { PORTAL_URL, LANDING_PAGES } = require('../constants');

/**
 * Destroys a user's session and redirects them to the start page.
 * @param {Object} req
 * @param {Object} res
 * @returns {void}
 */
function destroySessionAndRedirectToStart(req, res) {
  const startPageRedirect = Boolean(process.env.START_PAGE_REDIRECT);
  const redirectAddress = startPageRedirect ? PORTAL_URL : LANDING_PAGES.LOGIN;

  req.session.destroy(() => {
    res.redirect(redirectAddress);
  });
}

module.exports = destroySessionAndRedirectToStart;
