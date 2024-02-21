const acceptExternalSsoPost = (req, res) => {
  const { code, client_info: clientInfo, state, session_state: sessionState } = req.body;

  // TODO: validate referrer, it should be login.microsoft.com
  // TODO: !!! referrer is not available in localhost because of header "Referrer-Policy": "no-referrer-when-downgrade".
  // TODO: validate incoming variables, they should be alphanumeric/safe
  return res.render('sso/accept-external-sso-post.njk', {
    code,
    clientInfo,
    state,
    sessionState
  });
};



module.exports = { acceptExternalSsoPost };
