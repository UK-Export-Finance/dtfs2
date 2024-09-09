const { SSO } = require('../../constants');

/**
 * verifyReferrerForExternalSsoPost
 * Verify referrer, allow empty referrer for localhost.
 * 1) If host is localhost then referrer will be missing, no need to check it
 * 2) Return error message if referrer is missing or it is not from SSO authority
 * @param {Express.Request} req Express request
 * @returns {boolean|string} False or error message.
 */
const verifyReferrerForExternalSsoPost = (req) => {
  const hostnameWithoutPort = req.get('host').split(':')[0];
  const referrer = req.get('Referrer');

  // Referrer is not available in localhost because of policy "no-referrer-when-downgrade".
  if (hostnameWithoutPort === 'localhost') {
    return;
  }

  if (referrer && referrer.indexOf(`${SSO.AUTHORITY}/`) === 0) {
    return;
  }

  console.error('Login request comming from unexpected website: %s', referrer);
  throw new Error('Login request comming from unexpected website.');
};

/**
 * verifyBodyForExternalSsoPost
 * Verify SSO input parameters, allow limited/safe number of characters.
 * @param {Express.Request} req Express request
 * @returns {boolean|string} False or error message.
 */
const verifyBodyForExternalSsoPost = (templateParams) => {
  const paramsWithNotAllowedCharacters = Object.entries(templateParams).filter(([, value]) => /^[0-9a-zA-Z-_.]*$/.test(value) === false);

  if (paramsWithNotAllowedCharacters.length) {
    console.error('Login request data contains unexpected characters in: %O', paramsWithNotAllowedCharacters);
    throw new Error('Login request data contains unexpected characters.');
  }
};

/**
 * acceptExternalSsoPost
 * Accept SSO POST from SSO Authority, build form that will auto submit to have session cookie.
 * 1) Verify referrer.
 * 2) Verify Post body to have safe parameters.
 * 3) Return page with form acceptExternalSsoPostForm that will autosubmit.
 * @param {Express.Request} req Express request
 * @param {Express.Response} res Express response
 * @returns {object} response with rendered sso/accept-external-sso-post.njk.
 */
const acceptExternalSsoPost = (req, res) => {
  const { code, client_info: clientInfo, state, session_state: sessionState } = req.body;
  const externalTemplateParams = { code, clientInfo, state, sessionState };
  try {
    verifyReferrerForExternalSsoPost(req);
    verifyBodyForExternalSsoPost(externalTemplateParams);

    return res.render('sso/accept-external-sso-post.njk', { ...externalTemplateParams, azureSsoAuthority: `${SSO.AUTHORITY}/` });
  } catch (error) {
    console.error('TFM-UI - acceptExternalSsoPost failed, error %O', error);
    const errorMessage = error.message || `Login process failed - try again or contact us using details bellow.`;
    return res.status(500).render('_partials/problem-with-service.njk', { error: { message: errorMessage } });
  }
};

module.exports = { acceptExternalSsoPost };
