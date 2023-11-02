const sendEmail = require('../email');
const { EMAIL_TEMPLATE_IDS, SIGN_IN_LINK_EXPIRY_MINUTES } = require('../../constants');
const { PORTAL_UI_URL } = require('../../config/sign-in-link.config');

class SignInLinkService {
  #randomGenerator;
  #hasher;
  #userRepository;
  #signInCodeByteLength = 32;

  constructor(randomGenerator, hasher, userRepository) {
    this.#randomGenerator = randomGenerator;
    this.#hasher = hasher;
    this.#userRepository = userRepository;
  }

  async createAndEmailSignInLink(user) {
    const { _id: userId, email: userEmail, firstname: userFirstName, surname: userLastName } = user;

    const signInCode = this.#createSignInCode();
    await this.#saveSignInCodeHashAndSalt({ userId, signInCode });

    return this.#sendSignInLinkEmail({
      signInLink: `${PORTAL_UI_URL}/login/sign-in-link?t=${signInCode}`,
      userEmail,
      userFirstName,
      userLastName,
    });
  }

  #createSignInCode() {
    try {
      return this.#randomGenerator.randomHexString(this.#signInCodeByteLength);
    } catch (e) {
      const error = new Error('Failed to create a sign in code.');
      error.cause = e;
      throw error;
    }
  }

  async #saveSignInCodeHashAndSalt({ userId, signInCode }) {
    try {
      const { hash, salt } = this.#hasher.hash(signInCode);
      await this.#userRepository.saveSignInCodeForUser({
        userId,
        signInCodeSalt: salt,
        signInCodeHash: hash,
      });
    } catch (e) {
      const error = new Error('Failed to save the sign in code.');
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
      const error = new Error('Failed to email the sign in code.');
      error.cause = e;
      throw error;
    }
  }
}

module.exports = {
  SignInLinkService,
};
