const crypto = require('crypto');
const dotenv = require('dotenv');
const jsonwebtoken = require('jsonwebtoken');
const { salt: generatedSalt, hash: generateHash } = require('@ukef/dtfs2-common');

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
  try {
    if (!password || !hash || !salt) {
      return false;
    }

    // Saved hash
    const savedHash = Buffer.from(hash, 'hex');
    const passwordString = password.toString('hex');
    const saltString = salt.toString('hex');

    // Generate hash as Buffer from provided password and salt
    const generatedHash = generateHash(passwordString, saltString);

    if (!savedHash || !generatedHash || savedHash.length !== generatedHash.length) {
      // This is not timing safe. This is only reached under specific conditions where the buffer length is different (new user with no password).
      return false;
    }

    return crypto.timingSafeEqual(savedHash, generatedHash);
  } catch (error) {
    console.error('An error occurred while validating the password %o', error);
    return false;
  }
}

/**
 * Generates a password reset token hash for a given user.
 *
 * @param {Object} user - The user object containing email and salt properties.
 * @param {Buffer|string} user.email - The user's email address as a Buffer or string.
 * @param {Buffer|string} user.salt - The user's salt as a Buffer or string.
 * @returns {{ hash: string }} An object containing the generated hash as a hexadecimal string.
 */
function genPasswordResetToken(user) {
  try {
    const { email, salt } = user;

    const emailString = email.toString('hex');
    const saltString = salt.toString('hex');

    const hash = generateHash(emailString, saltString);

    return {
      hash: hash.toString('hex'),
    };
  } catch (error) {
    console.error('An error occurred while generating reset password token %o', error);
    return {
      hash: '',
    };
  }
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
