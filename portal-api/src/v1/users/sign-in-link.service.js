const { ObjectId } = require('mongodb');
const crypto = require('node:crypto');
const sendEmail = require('../email');
const { EMAIL_TEMPLATE_IDS, SIGN_IN_LINK_EXPIRY_MINUTES } = require('../../constants');
const db = require('../../drivers/db-client');

module.exports.createAndEmailSignInLink = async (user) => {
  const {
    _id: userId,
    email: userEmail,
    firstname: userFirstName,
    surname: userLastName,
  } = user;

  const signInCode = await createSignInCode();
  await saveSignInCodeHashAndSalt({ userId, signInCode });
  return sendSignInLinkEmail({
    userEmail,
    userFirstName,
    userLastName,
    signInLink: `http://localhost/login/sign-in-link?t=${signInCode}`,
  });
};

async function createSignInCode() {
  try {
    return crypto.randomBytes(32).toString('hex');
  } catch (e) {
    const error = new Error('Failed to create a sign in code.');
    error.cause = e;
    throw error;
  }
}

async function saveSignInCodeHashAndSalt({ userId, signInCode }) {
  try {
    const salt = crypto.randomBytes(64);
    const hash = crypto.pbkdf2Sync(signInCode, salt, 210000, 64, 'sha512').toString('hex');

    // TODO DTFS2-6750: should we introduce a repository here?
    const saltHex = salt.toString('hex');
    const userCollection = await db.getCollection('users');
    await userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: { signInCode: { hash, salt: saltHex } } });
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
    const error = new Error('Failed to email the sign in code.');
    error.cause = e;
    throw error;
  }
}
