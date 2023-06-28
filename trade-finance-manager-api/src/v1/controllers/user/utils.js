const crypto = require('crypto');
const dotenv = require('dotenv');
const jsonwebtoken = require('jsonwebtoken');

dotenv.config();

const PRIV_KEY = Buffer.from(process.env.JWT_SIGNING_KEY, 'base64').toString('ascii');

/**
 * @param {Object} user We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @returns {Object} Token, expires in and session ID
 */
function issueJWT(user) {
  const { _id } = user;
  const sessionIdentifier = crypto.randomBytes(32).toString('hex');

  const expiresIn = '12h';

  const payload = {
    sub: _id,
    iat: Date.now(),
    username: user.username,
    roles: user.roles,
    bank: user.bank,
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
