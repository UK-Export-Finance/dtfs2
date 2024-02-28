const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const db = require('./database-client');
const FailedToCreateLoggedInUserSessionError = require('../errors/failed-to-create-logged-in-user-session.error');
const UserNotFoundError = require('../errors/user-not-found.error');

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
    const userCollection = await db.getCollection('users');
    const userFromDatabase = await userCollection.findOne({ username: { $eq: user.username } }, { collation: { locale: 'en', strength: 2 } });
    if (!userFromDatabase) {
      throw new UserNotFoundError({ userIdentifier: user.username });
    }
    const sessionIdentifier = crypto.randomBytes(32).toString('hex');
    const token = issueValid2faJWT(userFromDatabase, sessionIdentifier);
    await userCollection.updateOne({ _id: { $eq: userFromDatabase._id } }, { $set: { sessionIdentifier } });
    return `Bearer ${token}`;
  } catch (e) {
    throw new FailedToCreateLoggedInUserSessionError({ username: user.username, cause: e });
  }
};

module.exports = { createLoggedInUserSession };
