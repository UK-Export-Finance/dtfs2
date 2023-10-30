const { ObjectId } = require('mongodb');
const crypto = require('node:crypto');
const sendEmail = require('../email');
const { EMAIL_TEMPLATE_IDS, SIGN_IN_LINK_EXPIRY_MINUTES } = require('../../constants');
const db = require('../../drivers/db-client');

module.exports.createAndSendAuthenticationToken = async (req, res) => {
  const { user: {
    _id: userId,
    email: userEmail,
    firstname: userFirstName,
    surname: userLastName,
  } } = req;
  let newToken;

  // TODO DTFS2-6750: need to unit test error handling for db call (could not do in api test)
  // TODO DTFS2-6750: refactor
  try {
    newToken = crypto.randomBytes(32).toString('hex');
    const newSalt = crypto.randomBytes(32).toString('hex');
    const newHash = crypto.pbkdf2Sync(newToken, newSalt, 10000, 64, 'sha512').toString('hex');

    const newSignInCode = {
      hash: newHash,
      salt: newSalt,
    };
    // TODO DTFS2-6750: db layer
    const userCollection = await db.getCollection('users');
    await userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: { signInCode: newSignInCode } });
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to create an authentication token.'
    });
  }

  try {
    await sendSignInLinkEmail({
      emailAddress: userEmail,
      firstName: userFirstName,
      lastName: userLastName,
      signInLink: `https://localhost/login/authentication-token?t=${newToken}`
    });
    return res.status(201).send();
  } catch (e) {
    console.error(e);
    return res.status(500).send({
      error: 'Internal Server Error',
      message: 'Failed to send the authentication token via email.'
    });
  }
};

function sendSignInLinkEmail({ emailAddress, firstName, lastName, signInLink }) {
  return sendEmail(
    EMAIL_TEMPLATE_IDS.SIGN_IN_LINK,
    emailAddress,
    {
      firstName,
      lastName,
      signInLink,
      signInLinkExpiryMinutes: SIGN_IN_LINK_EXPIRY_MINUTES,
    },
  );
}
