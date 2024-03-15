const { SSO } = require("../../constants");

const verifyReferrerForExternalSsoPost = (req) => {
  const hostnameWithoutPort = req.get('host').split(':')[0];
  const referrer = req.get('Referrer');

  // Referrer is not available in localhost because of policy "no-referrer-when-downgrade".
  if (hostnameWithoutPort !== 'localhost' && (!referrer || referrer.indexOf(`${SSO.AUTHORITY}/`) !== 0)) {
    console.error('Login request comming from unexpected website: %s', referrer);
    return 'Login request comming from unexpected website.';
  }
  return false;
}

const verifyBodyForExternalSsoPost = (templateParams) => {
  const paramsWithNotAllowedCharacters = Object.entries(templateParams).filter(([, value]) => (/^[0-9a-zA-Z-_.]*$/.test(value) === false));

  if (paramsWithNotAllowedCharacters.length) {
    console.error('Login request data contains unexpected characters in: %O', paramsWithNotAllowedCharacters);
    return 'Login request data contains unexpected characters.';
  }

  return false;
}

const acceptExternalSsoPost = (req, res) => {
  const { code, client_info: clientInfo, state, session_state: sessionState } = req.body;
  const templateParams = { code, clientInfo, state, sessionState };

  const referrerValidationError = verifyReferrerForExternalSsoPost(req);
  if (referrerValidationError) {
    return res.status(500).render('_partials/problem-with-service.njk', { error: { message: referrerValidationError }});
  }

  const bodyValidationError = verifyBodyForExternalSsoPost(templateParams);
  if (bodyValidationError) {
    return res.status(500).render('_partials/problem-with-service.njk', { error: { message: bodyValidationError }});
  }
  return res.render('sso/accept-external-sso-post.njk', templateParams);
};

module.exports = { acceptExternalSsoPost };
