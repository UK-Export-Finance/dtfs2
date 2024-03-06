const { SSO } = require('../../constants');
const api = require('../../api');
const loginService = require('./loginService');

const getLogin = async (req, res) => {
  if (req?.session?.user) {
    // User is already logged in.
    return res.redirect('/home');
  }

  const ssoRedirectNo = req.cookies[SSO.REDIRECT_COUNTER.COOKIE_NAME] ? (parseInt(req.cookies[SSO.REDIRECT_COUNTER.COOKIE_NAME], 10) + 1) : 1;

  // Stop redirect loop
  if (ssoRedirectNo > SSO.REDIRECT_COUNTER.MAX_REDIRECTS) {
    console.error('TFM-UI - stopping redirect loop in sso getLogin');
    const errorMessage = `Detected login issue please wait for ${SSO.REDIRECT_COUNTER.TIME_PERIOD/1000} seconds or contact us using details bellow.`;
    return res.render('_partials/problem-with-service.njk', { error: { message: errorMessage }});
  }

  // Track redirects
  res.cookie(SSO.REDIRECT_COUNTER.COOKIE_NAME, ssoRedirectNo, { maxAge: SSO.REDIRECT_COUNTER.TIME_PERIOD, httpOnly: true, sameSite: 'none', secure: true });

  const apiResponse = await api.getAuthLoginUrl();
  if (apiResponse.loginUrl) {
    req.session.auth = apiResponse;
    return res.redirect(apiResponse.loginUrl);
  }
  // TODO: design error page if SSO is down
  return res.render('_partials/problem-with-service.njk', { error: { message: JSON.stringify(apiResponse)} });
};

const handleSsoRedirect = async (req, res) => {
  const { body, session } = req;

  if (!body.formId) {
    return loginService.acceptExternalSsoPost(req, res);
  }
  if (!session?.auth?.pkceCodes) {
    console.error('SSO login session details are missing. Start login from beginning.');
    return res.redirect('/');
  }

  const {
    auth: {
      pkceCodes,
      authCodeUrlRequest,
      authCodeRequest,
    },
  } = session;
  const { code, state } = body;

  const apiResponse = await api.processSsoRedirect({ pkceCodes, authCodeUrlRequest, authCodeRequest, code, state });

  if (apiResponse.token) {
    req.session.userToken = apiResponse.token;
    req.session.user = apiResponse.tfmUser;

    // Unset data used for SSO validation.
    delete req.session.auth;

    res.clearCookie(SSO.REDIRECT_COUNTER.COOKIE_NAME);

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
