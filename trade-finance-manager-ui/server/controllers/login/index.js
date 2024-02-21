const api = require('../../api');
const loginService = require('./loginService');

const getLogin = async (req, res) => {
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

  const apiResponse = await api.getAuthLoginUrl();
  if (apiResponse.loginUrl) {
    req.session.auth = apiResponse;
    return res.redirect(apiResponse.loginUrl);
  }
  // TODO: design error page if SSO is down
  return res.render('_partials/problem-with-service.njk', { error: { message: JSON.stringify(apiResponse)} });
};

const handleSsoRedirect = async (req, res) => {
  if (!req.body.formId) {
    return loginService.acceptExternalSsoPost(req, res);
  }
  if (!req.session?.auth?.pkceCodes) {
    console.error('SSO login session details are missing. Start login from beginning.');
    return res.redirect('/');
  }

  const apiResponse = await api.processSsoRedirect(req.session.auth.pkceCodes, req.session.auth.authCodeUrlRequest, req.session.auth.authCodeRequest, req.body.code, req.body.state);

  if (apiResponse.token) {
    req.session.userToken = apiResponse.token;
    req.session.user = apiResponse.tfmUser;

    // Unset data used for SSO validation.
    delete req.session.auth;

    res.cookie('ssoRedirectNo', 0, { maxAge: 3600000, httpOnly: true });
    return res.redirect(apiResponse.redirectUrl);
  }
  return res.redirect('/');
}

const logout = async (req, res) => {
  const apiResponse = await api.getAuthLogoutUrl(req.session.userToken);

  if (apiResponse.logoutUrl) {
    return req.session.destroy(() => res.redirect(apiResponse.logoutUrl));
  }

  return res.redirect('/');
};

module.exports = { getLogin, logout, handleSsoRedirect };
