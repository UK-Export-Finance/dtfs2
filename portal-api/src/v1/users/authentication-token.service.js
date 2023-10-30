const { ObjectId } = require('mongodb');
const crypto = require('node:crypto');
const sendEmail = require('../email');
const { EMAIL_TEMPLATE_IDS, SIGN_IN_LINK_EXPIRY_MINUTES } = require('../../constants');
const db = require('../../drivers/db-client');

module.exports.createAndSendAuthenticationToken = async (user) => {
  const {
    _id: userId,
    email: userEmail,
    firstname: userFirstName,
    surname: userLastName,
  } = user;

  const signInCode = await createSignInCode(userId);
  await saveSignInCodeHashAndSalt({ userId, signInCode });
  return sendSignInLinkEmail({
    userEmail,
    userFirstName,
    userLastName,
    signInLink: `https://localhost/login/authentication-token?t=${signInCode}`,
  });
};

async function createSignInCode() {
  try {
    const signInCode = crypto.randomBytes(32).toString('hex');
    return signInCode;
  } catch (e) {
    const error = new Error('Failed to create a sign in code.');
    error.cause = e;
    throw error;
  }
}

async function saveSignInCodeHashAndSalt({ userId, signInCode }) {
  try {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(signInCode, salt, 10000, 64, 'sha512').toString('hex');

    // TODO DTFS2-6750: need to unit test error handling for db call (could not do in api test)
    // TODO DTFS2-6750: db layer
    const userCollection = await db.getCollection('users');
    await userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: { signInCode: { hash, salt } } });
  } catch (e) {
    const error = new Error('Failed to save the sign in code.');
    error.cause = e;
    throw error;
  }
}

async function sendSignInLinkEmail({ userEmail, userFirstName, userLastName, signInLink }) {
  try {
    await sendEmail(
      EMAIL_TEMPLATE_IDS.SIGN_IN_LINK,
      userEmail,
      {
        firstName: userFirstName,
        lastName: userLastName,
        signInLink,
        signInLinkExpiryMinutes: SIGN_IN_LINK_EXPIRY_MINUTES,
      },
    );
  } catch (e) {
    const error = new Error('Failed to send the sign in code via email.');
    error.cause = e;
    throw error;
  }
}
