const { SSO } = require('../../constants');
const api = require('../../api');
const loginService = require('./loginService');

/**
 * getLogin
 * Check if user is logged in and if not redirect to SSO Authority login page.
 * 1) Is user logged in, if yes, go to /home
 * 2) Did we reached redirect loop maximum, if yes show error
 * 3) Get login URL from TFM-API
 * 4) Redirect user to login URL (SSO Authority login page)
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @returns {Promise<object>} Express response with redirect or error.
 */
const getLogin = async (req, res) => {
  if (req?.session?.user) {
    // User is already logged in.
    return res.redirect('/home');
  }

  const ssoRedirectNo = req.cookies[SSO.REDIRECT_COUNTER.COOKIE_NAME] ? parseInt(req.cookies[SSO.REDIRECT_COUNTER.COOKIE_NAME], 10) + 1 : 1;

  // Stop redirect loop
  if (ssoRedirectNo > SSO.REDIRECT_COUNTER.MAX_REDIRECTS) {
    console.error('TFM-UI - stopping redirect loop in sso getLogin');
    const errorMessage = `Detected login redirect issue - please wait for ${
      SSO.REDIRECT_COUNTER.TIME_PERIOD / 1000
    } seconds or contact us using details below.`;
    return res.status(500).render('_partials/problem-with-service.njk', { error: { message: errorMessage } });
  }

  // Track redirects
  res.cookie(SSO.REDIRECT_COUNTER.COOKIE_NAME, ssoRedirectNo, { maxAge: SSO.REDIRECT_COUNTER.TIME_PERIOD, httpOnly: true, sameSite: 'none', secure: true });

  const apiResponse = await api.getAuthLoginUrl();
  if (apiResponse.loginUrl) {
    req.session.auth = apiResponse;
    return res.redirect(apiResponse.loginUrl);
  }

  console.error('TFM-UI - Login url generation failed. TFM-API response: %O', apiResponse);
  const errorMessage = `Login url generation failed - please try later or contact us using details below`;
  return res.status(500).render('_partials/problem-with-service.njk', { error: { message: errorMessage } });
};

/**
 * handleSsoRedirect
 * Because of security restrictions we need to handle 2 POST calls in same URL.
 * 1) Step 1 - POST is from SSO Authority we don't have session cookie and will prepare local form that will autosubmit.
 * 2) Step 2 - POST is from our form and now we have session cookie and can verify SSO authority data.
 * 3) Send SSO authority data to TFM-API for verification and login.
 * 4) Redirect user to original location, most likely /.
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @returns {Promise<object>} Express response with redirect or error.
 */
const handleSsoRedirect = async (req, res) => {
  try {
    const { body, session } = req;

    if (!body.formId) {
      return loginService.acceptExternalSsoPost(req, res);
    }

    if (!session?.auth?.pkceCodes) {
      console.error('SSO login session details are missing. Start login from beginning.');
      return res.redirect('/');
    }

    const {
      auth: { pkceCodes, authCodeUrlRequest, authCodeRequest },
    } = session;
    const { code, state } = body;

    const apiResponse = await api.processSsoRedirect({ pkceCodes, authCodeUrlRequest, authCodeRequest, code, state });

    if (apiResponse.token) {
      req.session.userToken = apiResponse.token;
      req.session.user = apiResponse.tfmUser;

      // Unset data used for SSO validation
      delete req.session.auth;

      // Unset cookie used for SSO redirect counting
      res.clearCookie(SSO.REDIRECT_COUNTER.COOKIE_NAME);

      return res.redirect(apiResponse.redirectUrl);
    }
    console.error('TFM-UI - login failed in TFM-API, redirect to /');
    return res.redirect('/');
  } catch (error) {
    const errorMessage = error.message || `Login process failed - try again or contact us using details below.`;
    console.error('TFM-UI - login failed, error %O', error);
    return res.status(500).render('_partials/problem-with-service.njk', { error: { message: errorMessage } });
  }
};

/**
 * logout
 * Delete local session and redirect to SSO authority logout page.
 * 1) Get logout url from TFM-API.
 * 2) Destroy TFM-UI user login session and redirect to SSO authority logout form.
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @returns {Promise<object>} Express response with redirect or error.
 */
const logout = async (req, res) => {
  const apiResponse = await api.getAuthLogoutUrl(req.session.userToken);

  if (apiResponse.logoutUrl) {
    return req.session.destroy(() => res.redirect(apiResponse.logoutUrl));
  }

  console.error('TFM-UI - logout failed in TFM-API, redirect to /');
  return res.redirect('/');
};

module.exports = { getLogin, logout, handleSsoRedirect };
