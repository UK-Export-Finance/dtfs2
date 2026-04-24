const crypto = require('crypto');
const dotenv = require('dotenv');
const jsonwebtoken = require('jsonwebtoken');
const { salt: generatedSalt, CRYPTO } = require('@ukef/dtfs2-common');

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
  const hashVerify = crypto.pbkdf2Sync(password, salt, CRYPTO.HASHING.ITERATIONS, CRYPTO.HASHING.KEY_LENGTH, CRYPTO.HASHING.ALGORITHM);

  if (!hashVerify || !hashAsBuffer || hashVerify.length !== hashAsBuffer.length) {
    // This is not timing safe. This is only reached under specific conditions where the buffer length is different (new user with no password).
    return false;
  }

  return crypto.timingSafeEqual(hashAsBuffer, hashVerify);
}

function genPasswordResetToken(user) {
  const hash = crypto.pbkdf2Sync(user.email, user.salt, CRYPTO.HASHING.ITERATIONS, CRYPTO.HASHING.KEY_LENGTH, CRYPTO.HASHING.ALGORITHM).toString('hex');

  return { hash };
}

/**
 * @param {object} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
function issueJWT(user) {
  const { _id } = user;
  const sessionIdentifier = generatedSalt().toString('hex');

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
module.exports.issueJWT = issueJWT;
module.exports.genPasswordResetToken = genPasswordResetToken;
