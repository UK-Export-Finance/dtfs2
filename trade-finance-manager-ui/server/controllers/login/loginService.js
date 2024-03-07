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

const acceptExternalSsoPost = (req, res) => {
  const { code, client_info: clientInfo, state, session_state: sessionState } = req.body;

  const referrerValidationError = verifyReferrerForExternalSsoPost(req);
  if (referrerValidationError) {
    return res.status(500).render('_partials/problem-with-service.njk', { error: { message: referrerValidationError }});
  }
  // TODO: validate incoming variables, they should be alphanumeric/safe
  return res.render('sso/accept-external-sso-post.njk', {
    code,
    clientInfo,
    state,
    sessionState
  });
};

module.exports = { acceptExternalSsoPost };
