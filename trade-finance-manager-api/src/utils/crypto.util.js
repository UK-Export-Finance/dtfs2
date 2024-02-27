const crypto = require('crypto');
const dotenv = require('dotenv');
const jsonwebtoken = require('jsonwebtoken');

dotenv.config();

const PRIV_KEY = Buffer.from(process.env.JWT_SIGNING_KEY, 'base64').toString('ascii');

/**
 * issueJWT
 * Issue a JWT.
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @returns {Object} Token, expiry date, session identifier
 */
function issueJWT(user) {
  const { _id } = user;
  const sessionIdentifier = crypto.randomBytes(32).toString('hex');

  const expiresIn = '1d';

  const payload = {
    sub: _id,
    username: user.username,
    teams: user.teams,
    firstName: user.firstName,
    lastName: user.lastName,
    sessionIdentifier,
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn, algorithm: 'RS256' });

  return {
    token: `Bearer ${signedToken}`,
    expires: expiresIn,
    sessionIdentifier,
  };
}

module.exports.issueJWT = issueJWT;
