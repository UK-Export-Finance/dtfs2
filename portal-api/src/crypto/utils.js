const crypto = require('crypto');
const dotenv = require('dotenv');
const jsonwebtoken = require('jsonwebtoken');

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
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
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

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.genPasswordResetToken = genPasswordResetToken;
