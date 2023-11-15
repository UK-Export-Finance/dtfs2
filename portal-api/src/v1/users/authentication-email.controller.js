const { ObjectId } = require('mongodb');
const { updateLastLogin } = require('./controller');
const utils = require('../../crypto/utils');
const db = require('../../drivers/db-client');
const SignInLinkExpiredError = require('../errors/sign-in-link-expired.error');
const { SIGN_IN_LINK_DURATION } = require('../../constants');

// eslint-disable-next-line no-unused-vars
const validateSignInLinkToken = async (user, signInToken) => {
  const { _id } = user;

  const usersInDb = await db.getCollection('users');
  const userInDb = await usersInDb.findOne({ _id: { $eq: ObjectId(_id) } });

  // TODO DTFS2-6680: Check that the user here has the signInToken

  if (!userInDb.signInCode) {
    throw new SignInLinkExpiredError('Link has already been visited');
  }

  if (new Date().getTime() > userInDb.signInCode?.expiry) {
    throw new SignInLinkExpiredError(`Link is older than ${SIGN_IN_LINK_DURATION.MINUTES} minute${SIGN_IN_LINK_DURATION.MINUTES === 1 ? '' : 's'}`);
  }

  await usersInDb.updateOne(
    { _id: { $eq: ObjectId(_id) } },
    { $unset: { signInCode: '' } }
  );

  // TODO DTFS2-6680: Remove this lint disable
  const { sessionIdentifier, ...tokenObject } = utils.issueValid2faJWT(user);
  return new Promise((resolve) => {
    updateLastLogin(user, sessionIdentifier, () => resolve({ tokenObject, user }));
  });
};

module.exports.validateSignInLinkToken = validateSignInLinkToken;
