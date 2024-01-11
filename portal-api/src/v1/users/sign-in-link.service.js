const sendEmail = require('../email');
const { EMAIL_TEMPLATE_IDS, SIGN_IN_LINK } = require('../../constants');
const { PORTAL_UI_URL } = require('../../config/sign-in-link.config');
const { STATUS, STATUS_BLOCKED_REASON } = require('../../constants/user');
const UserBlockedError = require('../errors/user-blocked.error');
const { sendBlockedEmail } = require('./controller');
const utils = require('../../crypto/utils');
const { InvalidSignInTokenError } = require('../errors');

class SignInLinkService {
  #randomGenerator;
  #hasher;
  #userRepository;

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

  async getSignInTokenStatus({ userId, signInToken }) {
    this.#validateSignInToken(signInToken);

    const user = await this.#userRepository.findById(userId);

    if (user.signInTokens === undefined || !user.signInTokens || user.signInTokens.length === 0) {
      return SIGN_IN_LINK.STATUS.NOT_FOUND;
    }
    const databaseSignInTokens = [...user.signInTokens];

    const matchingSignInTokenIndex = databaseSignInTokens.findLastIndex((databaseSignInToken) =>
      this.#hasher.verifyHash({
        target: signInToken,
        hash: databaseSignInToken.hash,
        salt: databaseSignInToken.salt,
      }),);

    if (matchingSignInTokenIndex === -1) {
      return SIGN_IN_LINK.STATUS.NOT_FOUND;
    }

    const matchingSignInToken = databaseSignInTokens[matchingSignInTokenIndex];

    if (Date.now() > matchingSignInToken.expiry || matchingSignInTokenIndex < databaseSignInTokens.length - 1) {
      return SIGN_IN_LINK.STATUS.EXPIRED;
    }

    return SIGN_IN_LINK.STATUS.VALID;
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

  async deleteSignInTokens(userId) {
    return this.#userRepository.deleteSignInTokensForUser(userId);
  }

  async resetSignInData(userId) {
    await this.#userRepository.resetSignInData({ userId });
  }

  async #updateLastLogin({ userId, sessionIdentifier }) {
    return this.#userRepository.updateLastLogin({ userId, sessionIdentifier });
  }

  #createSignInToken() {
    try {
      return this.#randomGenerator.randomHexString(SIGN_IN_LINK.TOKEN_BYTE_LENGTH);
    } catch (e) {
      const error = new Error('Failed to create a sign in token.');
      error.cause = e;
      throw error;
    }
  }

  #validateSignInToken(signInToken) {
    if (!this.#randomGenerator.validateHexString({ numberOfBytes: SIGN_IN_LINK.TOKEN_BYTE_LENGTH, inputString: signInToken })) {
      throw new InvalidSignInTokenError(signInToken);
    }
  }

  async #saveSignInTokenHashAndSalt({ userId, signInToken }) {
    try {
      const { hash, salt } = this.#hasher.hash(signInToken);
      const expiry = new Date().getTime() + SIGN_IN_LINK.DURATION_MILLISECONDS;
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
    try {
      await sendEmail(EMAIL_TEMPLATE_IDS.SIGN_IN_LINK, userEmail, {
        firstName: userFirstName,
        lastName: userLastName,
        signInLink,
        signInLinkDuration: `${SIGN_IN_LINK.DURATION_MINUTES} minute${SIGN_IN_LINK.DURATION_MINUTES === 1 ? '' : 's'}`,
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
      await this.#resetSignInDataIfStale({ userId, userSignInLinkSendDate });
    }

    const signInLinkCount = await this.#userRepository.incrementSignInLinkSendCount({ userId });

    if (signInLinkCount === 1) {
      await this.#userRepository.setSignInLinkSendDate({ userId });
    }

    const numberOfSendSignInLinkAttemptsRemaining = maxSignInLinkSendCount - signInLinkCount;

    if (numberOfSendSignInLinkAttemptsRemaining < 0) {
      await this.#blockUser({ userId, reason: STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_LINKS, userEmail });
      throw new UserBlockedError(userId);
    }

    return numberOfSendSignInLinkAttemptsRemaining;
  }

  async #resetSignInDataIfStale({ userId, userSignInLinkSendDate }) {
    const TIME_TO_RESET_SIGN_IN_LINK_SEND_COUNT_IN_MILLISECONDS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    const currentDate = Date.now();

    const signInLinkCountStaleDate = currentDate - TIME_TO_RESET_SIGN_IN_LINK_SEND_COUNT_IN_MILLISECONDS;

    if (userSignInLinkSendDate && userSignInLinkSendDate < signInLinkCountStaleDate) {
      await this.#userRepository.resetSignInData({ userId });
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
