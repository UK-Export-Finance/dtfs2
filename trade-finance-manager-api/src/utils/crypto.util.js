const crypto = require('crypto');
const dotenv = require('dotenv');
const jsonwebtoken = require('jsonwebtoken');

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

/**
 *
 * @param {string} password - The password string that the user inputs to the password field in the register form
 *
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 *
 */
function genPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');

  const genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  return { salt, hash: genHash };
}

function genPasswordResetToken(user) {
  const hash = crypto.pbkdf2Sync(user.email, user.salt, 10000, 64, 'sha512').toString('hex');

  return { hash };
}

/**
 * @param {Object} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
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

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.genPasswordResetToken = genPasswordResetToken;
