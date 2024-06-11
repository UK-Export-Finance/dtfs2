const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const db = require('./database-client');
const FailedToCreateLoggedInUserSessionError = require('../errors/failed-to-create-logged-in-user-session.error');

const LOGIN_STATUSES = { VALID_USERNAME_AND_PASSWORD: 'Valid username and password', VALID_2FA: 'Valid 2FA' };

const PRIV_KEY = Buffer.from(process.env.JWT_SIGNING_KEY, 'base64').toString('ascii');

/**
 * Generates a valid JSON Web Token (JWT) for a user with two-factor authentication (2FA).
 *
 * @param {object} user - The user object containing necessary information for token generation.
 * @param {string} sessionIdentifier - The session identifier associated with the user's session.
 * @returns {string} A signed JWT representing the user's authenticated 2FA session.
 */
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

/**
 * Creates a user session for a successfully logged-in user, updating the session identifier in the database
 * and generating a valid JWT token for two-factor authentication (2FA).
 *
 * @param {object} user - The user object representing the successfully logged-in user.
 * @returns {Promise<string>} A promise that resolves to a string containing the JWT token with "Bearer" prefix,
 *                           representing the user's authenticated 2FA session.
 * @throws {Error} Throws an error if there is a failure in creating the user session.
 */
const createLoggedInUserSession = async (user) => {
  try {
    const userCollection = await db.getCollection('users');
    const userFromDatabase = await userCollection.findOne({ username: { $eq: user.username } }, { collation: { locale: 'en', strength: 2 } });

    const sessionIdentifier = crypto.randomBytes(32).toString('hex');
    const token = issueValid2faJWT(userFromDatabase, sessionIdentifier);
    await userCollection.updateOne({ _id: { $eq: userFromDatabase._id } }, { $set: { sessionIdentifier } });
    return `Bearer ${token}`;
  } catch (error) {
    throw new Error(`Failed to create logged in user session for user ${user.username} ${error}`);
  }
};

const createLoggedInTfmUserSession = async (user) => {
  try {
    const userCollection = await db.getCollection('tfm-users');
    const userFromDatabase = await userCollection.findOne({ username: { $eq: user.username } }, { collation: { locale: 'en', strength: 2 } });
    if (!userFromDatabase) {
      return false;
    }

    const sessionIdentifier = crypto.randomBytes(32).toString('hex');
    const token = issueValid2faJWT(userFromDatabase, sessionIdentifier);
    await userCollection.updateOne({ _id: { $eq: userFromDatabase._id } }, { $set: { sessionIdentifier } });
    return `Bearer ${token}`;
  } catch (e) {
    throw new FailedToCreateLoggedInUserSessionError({ username: user.username, cause: e });
  }
};

module.exports = { createLoggedInUserSession, createLoggedInTfmUserSession };
