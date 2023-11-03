const { updateLastLogin } = require('./controller');
const utils = require('../../crypto/utils');

// eslint-disable-next-line no-unused-vars
const validateSignInLinkToken = async (user, signInToken) => {
  // TODO DTFS2-6680: Check that the user here has the signInToken
  // TODO DTFS2-6680: Remove this lint disable
  const { sessionIdentifier, ...tokenObject } = utils.issueValid2faJWT(user);
  return new Promise((resolve) => {
    updateLastLogin(user, sessionIdentifier, () => resolve({ tokenObject, user }));
  });
};

module.exports.validateSignInLinkToken = validateSignInLinkToken;
