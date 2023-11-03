const sendEmail = require('../email');
const { EMAIL_TEMPLATE_IDS, SIGN_IN_LINK_EXPIRY_MINUTES } = require('../../constants');
const { PORTAL_UI_URL } = require('../../config/sign-in-link.config');
const { findByUsername } = require('./controller');

class SignInLinkService {
  #randomGenerator;
  #hasher;
  #userRepository;
  #signInTokenByteLength = 32;

  constructor(randomGenerator, hasher, userRepository) {
    this.#randomGenerator = randomGenerator;
    this.#hasher = hasher;
    this.#userRepository = userRepository;
  }

  async createAndEmailSignInLink(user) {
    const { _id: userId, email: userEmail, firstname: userFirstName, surname: userLastName } = user;

    const signInToken = this.#createSignInToken();
    await this.#saveSignInTokenHashAndSalt({ userId, signInToken });

    return this.#sendSignInLinkEmail({
      signInLink: `${PORTAL_UI_URL}/login/sign-in-link?t=${signInToken}`,
      userEmail,
      userFirstName,
      userLastName,
    });
  }

  async isValidSignInToken({ username, signInToken }) {
    return new Promise((resolve, reject) => {
      findByUsername(username, (error, user) => {
        if (error || !user) {
          const errortwo = new Error(`Failed to find user: ${username}`);
          errortwo.cause = error || 'User object not defined';
          reject(errortwo);
        }
        const { hash, salt } = user.signInToken;
        resolve(this.#hasher.verifyHash({ target: signInToken, salt, hash }));
      });
    });
  }

  #createSignInToken() {
    try {
      return this.#randomGenerator.randomHexString(this.#signInTokenByteLength);
    } catch (e) {
      const error = new Error('Failed to create a sign in token.');
      error.cause = e;
      throw error;
    }
  }

  async #saveSignInTokenHashAndSalt({ userId, signInToken }) {
    try {
      const { hash, salt } = this.#hasher.hash(signInToken);
      await this.#userRepository.saveSignInTokenForUser({
        userId,
        signInTokenSalt: salt,
        signInTokenHash: hash,
      });
    } catch (e) {
      const error = new Error('Failed to save the sign in token.');
      error.cause = e;
      throw error;
    }
  }

  async #sendSignInLinkEmail({ userEmail, userFirstName, userLastName, signInLink }) {
    try {
      await sendEmail(EMAIL_TEMPLATE_IDS.SIGN_IN_LINK, userEmail, {
        firstName: userFirstName,
        lastName: userLastName,
        signInLink,
        signInLinkExpiryMinutes: SIGN_IN_LINK_EXPIRY_MINUTES,
      });
    } catch (e) {
      const error = new Error('Failed to email the sign in token.');
      error.cause = e;
      throw error;
    }
  }
}

module.exports = {
  SignInLinkService,
};
