const authProvider = require('../../middleware/auth-provider');
const loginService = require('./loginService');

const getLogin = (req, res, next) => {

  if (req?.session?.user) {
    // User is already logged in.
    return res.redirect('/home');
  }

  // Track redirects
  const ssoRedirectNo = req?.cookies?.ssoRedirectNo ? parseInt(req?.cookies?.ssoRedirectNo, 10) + 1 : 1;
  // TODO: try adding cookie parameter `sameSite: 'none'`
  res.cookie('ssoRedirectNo', ssoRedirectNo, { maxAge: 60000, httpOnly: true });
  // Stop redirects
  if (ssoRedirectNo > 5) {
    console.error('Redirect loop');
    return res.status(500).send({ error: 'Detected redirect loop, to reset counter remove cookie "ssoRedirectNo", or wait for 1 minute'});
  }


  return authProvider.login(req, res, next);
};

const handleSsoRedirect = (req, res, next) => {
  if (!req.body.formId) {
    return loginService.acceptExternalSsoPost(req, res);
  }
  return loginService.processInternalSsoPost(req, res, next);
}

const logout = (req, res, next) => {
  const logoutUrl = authProvider.getLogoutUrl(req, res, next);
  if (req.session) {
    req.session.destroy(() => {
      res.redirect(logoutUrl);
    });
  } else {
    res.redirect(logoutUrl);
  }
};

module.exports = { getLogin, logout, handleSsoRedirect };
