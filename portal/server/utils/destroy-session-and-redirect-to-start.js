const { PORTAL_URL } = require("../constants");

function destroySessionAndRedirectToStart(req, res) {
  const startPageRedirect = Boolean(process.env.START_PAGE_REDIRECT);
  const redirectAddress = startPageRedirect ? PORTAL_URL : '/login';

  req.session.destroy(() => {
    res.redirect(redirectAddress);
  });
}

module.exports = destroySessionAndRedirectToStart;
