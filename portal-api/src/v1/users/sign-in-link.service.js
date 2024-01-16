const sendEmail = require('../email');
const { EMAIL_TEMPLATE_IDS, SIGN_IN_LINK_DURATION } = require('../../constants');
const { PORTAL_UI_URL } = require('../../config/sign-in-link.config');
const { InvalidSignInTokenError } = require('../errors');
const { STATUS, STATUS_BLOCKED_REASON } = require('../../constants/user');
const UserBlockedError = require('../errors/user-blocked.error');
const { sendBlockedEmail } = require('./controller');
const utils = require('../../crypto/utils');

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
    const {
      _id: userId,
      email: userEmail,
      firstname: userFirstName,
      surname: userLastName,
      signInLinkSendDate: userSignInLinkSendDate,
      'user-status': userStatus,
    } = user;

    const newSignInLinkCount = await this.#incrementSignInLinkSendCount({ userId, userSignInLinkSendDate, userEmail });

    if (userStatus === STATUS.BLOCKED) {
      throw new UserBlockedError(userId);
    }

    const signInToken = this.#createSignInToken();

    await this.#saveSignInTokenHashAndSalt({ userId, signInToken });

    await this.#sendSignInLinkEmail({
      signInLink: `${PORTAL_UI_URL}/login/sign-in-link?t=${signInToken}&u=${userId}`,
      userEmail,
      userFirstName,
      userLastName,
    });

    return newSignInLinkCount;
  }

  async isValidSignInToken({ userId, signInToken }) {
    const user = await this.#userRepository.findById(userId);

    if (!user.signInToken?.hash || !user.signInToken?.salt) {
      throw new InvalidSignInTokenError(userId);
    }

    const { hash, salt, expiry } = user.signInToken;

    if (new Date().getTime() > expiry) {
      return false;
    }

    return this.#hasher.verifyHash({ target: signInToken, hash, salt });
  }

  async loginUser(userId) {
    const user = await this.#userRepository.findById(userId);

    if (user['user-status'] === STATUS.BLOCKED) {
      throw new UserBlockedError(userId);
    }

    const { sessionIdentifier, ...tokenObject } = utils.issueValid2faJWT(user);
    await this.#updateLastLogin({ userId: user._id, sessionIdentifier });
    return { user, tokenObject };
  }

  deleteSignInToken(userId) {
    return this.#userRepository.deleteSignInTokenForUser(userId);
  }

  async #updateLastLogin({ userId, sessionIdentifier }) {
    return this.#userRepository.updateLastLogin({ userId, sessionIdentifier });
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
      const expiry = new Date().getTime() + SIGN_IN_LINK_DURATION.MILLISECONDS;
      await this.#userRepository.saveSignInTokenForUser({
        userId,
        signInTokenSalt: salt,
        signInTokenHash: hash,
        expiry,
      });
    } catch (e) {
      const error = new Error('Failed to save the sign in token.');
      error.cause = e;
      throw error;
    }
  }

  async #sendSignInLinkEmail({ userEmail, userFirstName, userLastName, signInLink }) {
    if (process.env.NODE_ENV === 'development') {
      console.info('🔗 signInLink 🔗', signInLink);
    }

    try {
      await sendEmail(EMAIL_TEMPLATE_IDS.SIGN_IN_LINK, userEmail, {
        firstName: userFirstName,
        lastName: userLastName,
        signInLink,
        signInLinkDuration: `${SIGN_IN_LINK_DURATION.MINUTES} minute${SIGN_IN_LINK_DURATION.MINUTES === 1 ? '' : 's'}`,
      });
    } catch (e) {
      const error = new Error('Failed to email the sign in token.');
      error.cause = e;
      throw error;
    }
  }

  async #incrementSignInLinkSendCount({ userId, userStatus, userSignInLinkSendDate, userEmail }) {
    const maxSignInLinkSendCount = 3;

    if (userStatus !== STATUS.BLOCKED) {
      await this.#resetSignInLinkSendCountIfStale({ userId, userSignInLinkSendDate });
    }

    const signInLinkCount = await this.#userRepository.incrementSignInLinkSendCount({ userId });

    if (signInLinkCount === 1) {
      await this.#userRepository.setSignInLinkSendDate({ userId });
    }

    const numberOfSendSignInLinkAttemptsRemaining = maxSignInLinkSendCount - signInLinkCount;

    if (numberOfSendSignInLinkAttemptsRemaining < 0) {
      await this.deleteSignInToken(userId);
      await this.#blockUser({ userId, reason: STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_LINKS, userEmail });
      throw new UserBlockedError(userId);
    }

    return numberOfSendSignInLinkAttemptsRemaining;
  }

  async #resetSignInLinkSendCountIfStale({ userId, userSignInLinkSendDate }) {
    const TIME_TO_RESET_SIGN_IN_LINK_SEND_COUNT_IN_MILLISECONDS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    const currentDate = Date.now();

    const signInLinkCountStaleDate = currentDate - TIME_TO_RESET_SIGN_IN_LINK_SEND_COUNT_IN_MILLISECONDS;

    if (userSignInLinkSendDate && userSignInLinkSendDate < signInLinkCountStaleDate) {
      await this.#userRepository.resetSignInLinkSendCountAndDate({ userId });
    }
  }

  async #blockUser({ userId, userEmail, reason }) {
    await this.#userRepository.blockUser({ userId, reason });
    await sendBlockedEmail(userEmail);
  }
}

module.exports = {
  SignInLinkService,
};
