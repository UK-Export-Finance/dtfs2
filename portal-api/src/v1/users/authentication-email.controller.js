const sendEmail = require('../email');
const { updateLastLogin } = require('./controller');
const utils = require('../../crypto/utils');

const sendSignInLink = async (emailAddress, token) => {
  // TODO DTFS2-6680: update template Id
  // TODO DTFS2-6680: check email address against user email
  const EMAIL_TEMPLATE_ID = '6935e539-1a0c-4eca-a6f3-f239402c0987';

  await sendEmail(EMAIL_TEMPLATE_ID, emailAddress, {
    token,
  });
};

// eslint-disable-next-line no-unused-vars
const validateSignInLinkToken = async (user, signInToken) => {
  // TODO DTFS2-6680: Check that the user here has the signInToken
  // TODO DTFS2-6680: Remove this lint disable
  const { sessionIdentifier, ...tokenObject } = utils.issueValid2faJWT(user);
  return new Promise((resolve) => {
    updateLastLogin(user, sessionIdentifier, () => resolve({ tokenObject, user }));
  });
};

module.exports.sendSignInLink = sendSignInLink;
module.exports.validateSignInLinkToken = validateSignInLinkToken;
