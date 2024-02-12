const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const db = require('./database-client');

const LOGIN_STATUSES = { VALID_USERNAME_AND_PASSWORD: 'Valid username and password', VALID_2FA: 'Valid 2FA' };

const PRIV_KEY = Buffer.from(process.env.JWT_SIGNING_KEY, 'base64').toString('ascii');

const issueValid2faJWT = (user, sessionIdentifier) => {
  const { _id } = user;
  const payload = {
    sub: _id,
    sessionIdentifier,
    username: user.username,
    roles: user.roles,
    bank: user.bank,
    loginStatus: LOGIN_STATUSES.VALID_2FA,
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: '12hr', algorithm: 'RS256' });
  return signedToken;
};

const createLoggedInUserSession = async (user) => {
  try {
    console.info('Hello 123123');
    const userCollection = await db.getCollection('users');
    console.info(userCollection);
    console.info('7784778478478478');
    const userFromDatabase = await userCollection.findOne({ username: { $eq: user.username } }, { collation: { locale: 'en', strength: 2 } });

    const sessionIdentifier = crypto.randomBytes(32).toString('hex');
    const token = issueValid2faJWT(userFromDatabase, sessionIdentifier);
    await userCollection.updateOne({ _id: { $eq: userFromDatabase._id } }, { $set: { sessionIdentifier } });
    return `Bearer ${token}`;
  } catch (e) {
    throw new Error(`Failed to create logged in user session for user: ${user.username}: ${e}`);
  }
};

module.exports = { createLoggedInUserSession };
