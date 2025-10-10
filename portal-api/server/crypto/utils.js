const crypto = require('crypto');
const dotenv = require('dotenv');
const jsonwebtoken = require('jsonwebtoken');
const { PORTAL_LOGIN_STATUS, CSRF } = require('@ukef/dtfs2-common');

dotenv.config();

const PRIV_KEY = Buffer.from(process.env.JWT_SIGNING_KEY, 'base64').toString('ascii');

/**
 *
 * @param {string} password - The plain text password
 * @param {string} hash - The hash stored in the database
 * @param {string} salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password, hash, salt) {
  if (!hash || !salt) {
    return false;
  }
  const hashAsBuffer = Buffer.from(hash, 'hex');
  const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');

  if (!hashVerify || !hashAsBuffer || hashVerify.length !== hashAsBuffer.length) {
    // This is not timing safe. This is only reached under specific conditions where the buffer length is different (new user with no password).
    return false;
  }

  return crypto.timingSafeEqual(hashAsBuffer, hashVerify);
}

function genPasswordResetToken(user) {
  const { email } = user;
  const salt = crypto.randomBytes(CSRF.SECRET.BYTES).toString('hex');
  const hash = crypto.pbkdf2Sync(email, salt, 10000, 64, 'sha512').toString('hex');

  return {
    salt,
    hash,
  };
}

/**
 * @param {object} user We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @returns {object} Token, expires in and session ID
 */
function issueJWTWithExpiryAndPayload({ user, sessionIdentifier = crypto.randomBytes(32).toString('hex'), expiresIn, additionalPayload }) {
  const { _id } = user;

  const payload = {
    sub: _id,
    sessionIdentifier,
    ...additionalPayload,
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn, algorithm: 'RS256' });

  return {
    token: `Bearer ${signedToken}`,
    expires: expiresIn,
    sessionIdentifier,
  };
}

/**
 * @param {object} user We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @returns {object} Token, expires in and session ID
 */
function issueValidUsernameAndPasswordJWT(user) {
  return issueJWTWithExpiryAndPayload({
    user,
    // Expiry time is 105 minutes to allow for 3 login emails to be sent (each with a 30 minute expiry, and 5 minute leeway) without need to re-login
    expiresIn: '105m',
    additionalPayload: { username: user.username, loginStatus: PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD },
  });
}

/**
 * @param {object} user We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @returns {object} Token, expires in and session ID
 */
function issueValid2faJWT(user) {
  if (!user.sessionIdentifier) {
    throw new Error('User does not have a session identifier');
  }

  return issueJWTWithExpiryAndPayload({
    user,
    sessionIdentifier: user.sessionIdentifier,
    expiresIn: '12h',
    additionalPayload: {
      username: user.username,
      roles: user.roles,
      bank: user.bank,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });
}

module.exports.validPassword = validPassword;
module.exports.issueValidUsernameAndPasswordJWT = issueValidUsernameAndPasswordJWT;
module.exports.issueValid2faJWT = issueValid2faJWT;
module.exports.genPasswordResetToken = genPasswordResetToken;
