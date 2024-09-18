const crypto = require('crypto');
const dotenv = require('dotenv');
const jsonwebtoken = require('jsonwebtoken');

dotenv.config();

const PRIV_KEY = Buffer.from(process.env.JWT_SIGNING_KEY, 'base64').toString('ascii');

/**
 * @typedef {object} IssueJWTResponse
 * @property {string} token - JWT token
 * @property {'1d'} expires - Expiry date
 * @property {import('@ukef/dtfs2-common').HexString} sessionIdentifier - Session identifier
 */

/**
 * issueJWT
 * Issue a JWT.
 * @param {import('@ukef/dtfs2-common').TfmUser} user - The user object. We need this to set the JWT `sub` payload property to the MongoDB user ID.
 * @returns {IssueJWTResponse} Token, expiry date, session identifier
 */
function issueJWT(user) {
  const { _id } = user;

  /**
   * @type {import('@ukef/dtfs2-common').HexString}
   */
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
