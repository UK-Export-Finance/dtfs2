const crypto = require('crypto');
const dotenv = require('dotenv');
const jsonwebtoken = require('jsonwebtoken');
const { LOGIN_STATUSES } = require('../constants');

dotenv.config();

const PRIV_KEY = Buffer.from(process.env.JWT_SIGNING_KEY, 'base64').toString('ascii');

/**
 *
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password, hash, salt) {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  return hash === hashVerify;
}

/**
 *
 * @param {*} password - The password string that the user inputs to the password field in the register form
 *
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 *
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later
 * (similar to what we do here)
 */
function genPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');

  const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  return {
    salt,
    hash: genHash,
  };
}

function genPasswordResetToken(user) {
  const hash = crypto.pbkdf2Sync(user.email, user.salt, 10000, 64, 'sha512').toString('hex');

  return {
    hash,
  };
}

/**
 * @param {Object} user We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @returns {Object} Token, expires in and session ID
 */
function issueJWTWithExpiryAndPayload({ user, sessionIdentifier = crypto.randomBytes(32).toString('hex'), expiresIn, additionalPayload }) {
  const { _id } = user;

  const payload = {
    sub: _id,
    iat: Date.now(),
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
 * @param {Object} user We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @returns {Object} Token, expires in and session ID
 */
function issueValidUsernameAndPasswordJWT(user) {
  return issueJWTWithExpiryAndPayload({
    user,
    expiresIn: '105m',
    additionalPayload: { username: user.username, loginStatus: LOGIN_STATUSES.VALID_USERNAME_AND_PASSWORD },
  });
}

/**
 * @param {Object} user We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @returns {Object} Token, expires in and session ID
 */
function issueValid2faJWT(user) {
  if (!user.sessionIdentifier) {
    throw new Error('User does not have a session identifier');
  }

  return issueJWTWithExpiryAndPayload({
    user,
    sessionIdentifier: user.sessionIdentifier,
    expiresIn: '12h',
    additionalPayload: { username: user.username, roles: user.roles, bank: user.bank, loginStatus: LOGIN_STATUSES.VALID_2FA },
  });
}

/**
 * @param {Object} user We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @returns {Object} Token, expires in and session ID
 */
// TODO DTFS2-6680: Remove this function
function issueJWT(user) {
  return issueJWTWithExpiryAndPayload({
    user,
    expiresIn: '12h',
    additionalPayload: { username: user.username, roles: user.roles, bank: user.bank },
  });
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.issueValidUsernameAndPasswordJWT = issueValidUsernameAndPasswordJWT;
module.exports.issueValid2faJWT = issueValid2faJWT;
module.exports.genPasswordResetToken = genPasswordResetToken;
