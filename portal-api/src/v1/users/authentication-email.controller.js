const { updateLastLogin } = require('./controller');
const utils = require('../../crypto/utils');

// eslint-disable-next-line no-unused-vars
const validateAuthenticationEmailToken = async (user, loginAuthenticationToken) => {
  // TODO DTFS2-6680: Check that the user here has the loginAuthenticationToken
  // TODO DTFS2-6680: Remove this lint disable
  const { sessionIdentifier, ...tokenObject } = utils.issueValid2faJWT(user);
  return new Promise((resolve) => {
    updateLastLogin(user, sessionIdentifier, () => resolve({ tokenObject, user }));
  });
};

module.exports.validateAuthenticationEmailToken = validateAuthenticationEmailToken;
