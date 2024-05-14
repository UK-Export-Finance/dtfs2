const sendEmail = require('../email');
const { EMAIL_TEMPLATE_IDS, SIGN_IN_LINK } = require('../../constants');
const { PORTAL_UI_URL } = require('../../config/sign-in-link.config');
const { STATUS_BLOCKED_REASON } = require('../../constants/user');
const UserBlockedError = require('../errors/user-blocked.error');
const { sendBlockedEmail } = require('./controller');
const utils = require('../../crypto/utils');

class SignInLinkService {
  #randomGenerator;
  #hasher;
  #userRepository;
  #userService;

  constructor(randomGenerator, hasher, userRepository, userService) {
    this.#randomGenerator = randomGenerator;
    this.#hasher = hasher;
    this.#userRepository = userRepository;
    this.#userService = userService;
  }

  /**
   * Creates and emails a sign-in link to the user.
   * @param {Object} user - The user object with necessary information.
   * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - user making the request
   * @returns {Promise<number>} - The new sign-in link count.
   * @throws {UserBlockedError} - If the user is blocked.
   */
  async createAndEmailSignInLink(user, auditDetails) {
    const { _id: userId, email: userEmail, firstname: userFirstName, surname: userLastName, signInLinkSendDate: userSignInLinkSendDate } = user;

    const isUserBlockedOrDisabled = await this.#userService.isUserBlockedOrDisabled(user);

    const newSignInLinkCount = await this.#incrementSignInLinkSendCount({ userId, isUserBlockedOrDisabled, userSignInLinkSendDate, userEmail, auditDetails });

    if (isUserBlockedOrDisabled) {
      throw new UserBlockedError(userId);
    }
    const signInToken = this.#createSignInToken();

    await this.#saveSignInTokenHashAndSalt({ userId, signInToken, auditDetails });

    await this.#sendSignInLinkEmail({
      signInLink: `${PORTAL_UI_URL}/login/sign-in-link?t=${signInToken}&u=${userId}`,
      userEmail,
      userFirstName,
      userLastName,
    });

    return newSignInLinkCount;
  }

  /**
   * Gets the status of a sign-in token for a user.
   * @param {Object} params - The parameters containing userId and signInToken.
   * @returns {Promise<string>} - The status of the sign-in token.
   */
  async getSignInTokenStatus({ userId, signInToken }) {
    const user = await this.#userRepository.findById(userId);

    if (!this.#doesUserHaveSavedSignInTokens(user)) {
      return SIGN_IN_LINK.STATUS.NOT_FOUND;
    }
    const databaseSignInTokens = [...user.signInTokens];

    const matchingSignInTokenIndex = databaseSignInTokens.findLastIndex((databaseSignInToken) =>
      this.#hasher.verifyHash({
        target: signInToken,
        hash: databaseSignInToken.hash,
        salt: databaseSignInToken.salt,
      }),
    );

    if (matchingSignInTokenIndex === -1) {
      return SIGN_IN_LINK.STATUS.NOT_FOUND;
    }

    const matchingSignInToken = databaseSignInTokens[matchingSignInTokenIndex];

    if (
      this.#isSignInTokenIsInDate(matchingSignInToken) &&
      this.#isSignInTokenIsLastIssued({ signInTokenIndex: matchingSignInTokenIndex, databaseSignInTokens })
    ) {
      return SIGN_IN_LINK.STATUS.VALID;
    }

    return SIGN_IN_LINK.STATUS.EXPIRED;
  }

  /**
   * Logs in a user and returns the user object and authentication token.
   * @param {string} userId - The ID of the user to log in.
   * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - user making the request
   * @returns {Promise<Object>} - The user object and authentication token.
   */
  async loginUser(userId, auditDetails) {
    const user = await this.#userRepository.findById(userId);

    this.#userService.validateUserIsActiveAndNotDisabled(user);

    const { sessionIdentifier, ...tokenObject } = utils.issueValid2faJWT(user);
    await this.#updateLastLoginAndResetSignInData({ userId: user._id, sessionIdentifier, auditDetails });
    return { user, tokenObject };
  }

  /**
   * Resets sign-in data for a user.
   * @param {string} userId - The ID of the user to reset sign-in data.
   * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - user making the request
   */
  async resetSignInData(userId, auditDetails) {
    await this.#userRepository.resetSignInData({ userId, auditDetails });
  }

  /**
   * Updates the last login timestamp and resets sign-in data for a user.
   * @param {Object} params - The parameters containing userId and sessionIdentifier.
   * @param {import("@ukef/dtfs2-common").AuditDetails} params.auditDetails - user making the request
   * @returns {Promise<void>}
   */
  async #updateLastLoginAndResetSignInData({ userId, sessionIdentifier, auditDetails }) {
    return this.#userRepository.updateLastLoginAndResetSignInData({ userId, sessionIdentifier, auditDetails });
  }

  /**
   * Generates a sign-in token using a random hex string.
   * @returns {string} - The generated sign-in token.
   * @throws {Error} - If there is an issue generating the sign-in token.
   */
  #createSignInToken() {
    try {
      return this.#randomGenerator.randomHexString(SIGN_IN_LINK.TOKEN_BYTE_LENGTH);
    } catch (error) {
      throw new Error('Failed to create a sign in token', { cause: error });
    }
  }

  /**
   * Saves the hash and salt of the sign-in token along with its expiry for a user.
   * @param {Object} params - The parameters containing userId and signInToken.
   * @param {import("@ukef/dtfs2-common").AuditDetails} params.auditDetails - user making the request
   * @throws {Error} - If there is an issue saving the sign-in token.
   */
  async #saveSignInTokenHashAndSalt({ userId, signInToken, auditDetails }) {
    try {
      const { hash, salt } = this.#hasher.hash(signInToken);
      const expiry = new Date().getTime() + SIGN_IN_LINK.DURATION_MILLISECONDS;
      await this.#userRepository.saveSignInTokenForUser({
        userId,
        signInTokenSalt: salt,
        signInTokenHash: hash,
        expiry,
        auditDetails,
      });
    } catch (error) {
      throw new Error('Failed to save the sign in token', { cause: error });
    }
  }

  /**
   * Sends a sign-in link email to the user.
   * @param {Object} params - The parameters containing userEmail, userFirstName, userLastName, and signInLink.
   * @throws {Error} - If there is an issue sending the sign-in link email.
   */
  async #sendSignInLinkEmail({ userEmail, userFirstName, userLastName, signInLink }) {
    if (process.env.NODE_ENV === 'development') {
      console.info('Sending sign-in link %s', signInLink);
    }

    try {
      await sendEmail(EMAIL_TEMPLATE_IDS.SIGN_IN_LINK, userEmail, {
        firstName: userFirstName,
        lastName: userLastName,
        signInLink,
        signInLinkDuration: `${SIGN_IN_LINK.DURATION_MINUTES} minute${SIGN_IN_LINK.DURATION_MINUTES === 1 ? '' : 's'}`,
      });
    } catch (error) {
      throw new Error('Failed to email the sign in token', { cause: error });
    }
  }

  /**
   * Increments the sign-in link send count for a user and handles blocking if necessary.
   * @param {Object} params - The parameters containing userId, isUserBlockedOrDisabled, userSignInLinkSendDate, and userEmail.
   * @param {import("@ukef/dtfs2-common").AuditDetails} params.auditDetails - user making the request
   * @returns {Promise<number>} - The remaining number of sign-in link attempts.
   * @throws {UserBlockedError} - If the user is blocked due to excessive sign-in link attempts.
   */
  async #incrementSignInLinkSendCount({ userId, isUserBlockedOrDisabled, userSignInLinkSendDate, userEmail, auditDetails }) {
    const maxSignInLinkSendCount = 3;

    if (!isUserBlockedOrDisabled) {
      await this.#resetSignInDataIfStale({ userId, userSignInLinkSendDate, auditDetails });
    }

    const signInLinkCount = await this.#userRepository.incrementSignInLinkSendCount({ userId, auditDetails });

    if (signInLinkCount === 1) {
      await this.#userRepository.setSignInLinkSendDate({ userId, auditDetails });
    }

    const numberOfSendSignInLinkAttemptsRemaining = maxSignInLinkSendCount - signInLinkCount;

    /*
     * This is "-1" as when a user has a signInLinkCount of 0 after incrementSignInLinkSendCount,
     * they are on their last attempt.
     */
    if (numberOfSendSignInLinkAttemptsRemaining === -1) {
      await this.#blockUser({ userId, reason: STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_LINKS, userEmail, auditDetails });
      throw new UserBlockedError(userId);
    }

    return numberOfSendSignInLinkAttemptsRemaining;
  }

  /**
   * Resets sign-in data if it is stale based on the time since the last sign-in link send.
   * @param {Object} params - The parameters containing userId and userSignInLinkSendDate.
   * @param {import("@ukef/dtfs2-common").AuditDetails} params.auditDetails - user making the request
   */
  async #resetSignInDataIfStale({ userId, userSignInLinkSendDate, auditDetails }) {
    const TIME_TO_RESET_SIGN_IN_LINK_SEND_COUNT_IN_MILLISECONDS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    const currentDate = Date.now();

    const signInLinkCountStaleDate = currentDate - TIME_TO_RESET_SIGN_IN_LINK_SEND_COUNT_IN_MILLISECONDS;

    if (userSignInLinkSendDate && userSignInLinkSendDate < signInLinkCountStaleDate) {
      await this.#userRepository.resetSignInData({ userId, auditDetails });
    }
  }

  /**
   * Blocks a user with a given reason and sends a blocked email to the user.
   * @param {Object} params - The parameters containing userId, userEmail, and reason.
   * @param {import("@ukef/dtfs2-common").AuditDetails} params.auditDetails - user making the request
   */
  async #blockUser({ userId, userEmail, reason, auditDetails }) {
    await this.#userRepository.blockUser({ userId, reason, auditDetails });
    await sendBlockedEmail(userEmail);
  }

  /**
   * Checks if a sign-in token is within its validity period.
   * @param {Object} signInToken - The sign-in token object.
   * @returns {boolean} - Whether the sign-in token is within its validity period.
   */
  #isSignInTokenIsInDate(signInToken) {
    return Date.now() <= signInToken.expiry;
  }

  /**
   * Checks if a sign-in token is the last issued token for a user.
   * @param {Object} params - The parameters containing signInTokenIndex and databaseSignInTokens.
   * @returns {boolean} - Whether the sign-in token is the last issued for the user.
   */
  #isSignInTokenIsLastIssued({ signInTokenIndex, databaseSignInTokens }) {
    return signInTokenIndex === databaseSignInTokens.length - 1;
  }

  /**
   * Checks if a user has saved sign-in tokens.
   * @param {Object} user - The user object.
   * @returns {boolean} - Whether the user has saved sign-in tokens.
   */
  #doesUserHaveSavedSignInTokens(user) {
    return user.signInTokens !== undefined && user.signInTokens.length > 0;
  }
}

module.exports = {
  SignInLinkService,
};
