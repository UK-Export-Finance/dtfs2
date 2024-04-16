"use strict";
var _SignInLinkService_instances, _SignInLinkService_randomGenerator, _SignInLinkService_hasher, _SignInLinkService_userRepository, _SignInLinkService_userService, _SignInLinkService_updateLastLoginAndResetSignInData, _SignInLinkService_createSignInToken, _SignInLinkService_saveSignInTokenHashAndSalt, _SignInLinkService_sendSignInLinkEmail, _SignInLinkService_incrementSignInLinkSendCount, _SignInLinkService_resetSignInDataIfStale, _SignInLinkService_blockUser, _SignInLinkService_isSignInTokenIsInDate, _SignInLinkService_isSignInTokenIsLastIssued, _SignInLinkService_doesUserHaveSavedSignInTokens;
const tslib_1 = require("tslib");
const sendEmail = require('../email');
const { EMAIL_TEMPLATE_IDS, SIGN_IN_LINK } = require('../../constants');
const { PORTAL_UI_URL } = require('../../config/sign-in-link.config');
const { STATUS_BLOCKED_REASON } = require('../../constants/user');
const UserBlockedError = require('../errors/user-blocked.error');
const { sendBlockedEmail } = require('./controller');
const utils = require('../../crypto/utils');
class SignInLinkService {
    constructor(randomGenerator, hasher, userRepository, userService) {
        _SignInLinkService_instances.add(this);
        _SignInLinkService_randomGenerator.set(this, void 0);
        _SignInLinkService_hasher.set(this, void 0);
        _SignInLinkService_userRepository.set(this, void 0);
        _SignInLinkService_userService.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _SignInLinkService_randomGenerator, randomGenerator, "f");
        tslib_1.__classPrivateFieldSet(this, _SignInLinkService_hasher, hasher, "f");
        tslib_1.__classPrivateFieldSet(this, _SignInLinkService_userRepository, userRepository, "f");
        tslib_1.__classPrivateFieldSet(this, _SignInLinkService_userService, userService, "f");
    }
    /**
     * Creates and emails a sign-in link to the user.
     * @param {Object} user - The user object with necessary information.
     * @returns {Promise<number>} - The new sign-in link count.
     * @throws {UserBlockedError} - If the user is blocked.
     */
    createAndEmailSignInLink(user) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { _id: userId, email: userEmail, firstname: userFirstName, surname: userLastName, signInLinkSendDate: userSignInLinkSendDate } = user;
            const isUserBlockedOrDisabled = yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userService, "f").isUserBlockedOrDisabled(user);
            const newSignInLinkCount = yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_instances, "m", _SignInLinkService_incrementSignInLinkSendCount).call(this, { userId, isUserBlockedOrDisabled, userSignInLinkSendDate, userEmail });
            if (isUserBlockedOrDisabled) {
                throw new UserBlockedError(userId);
            }
            const signInToken = tslib_1.__classPrivateFieldGet(this, _SignInLinkService_instances, "m", _SignInLinkService_createSignInToken).call(this);
            yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_instances, "m", _SignInLinkService_saveSignInTokenHashAndSalt).call(this, { userId, signInToken });
            yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_instances, "m", _SignInLinkService_sendSignInLinkEmail).call(this, {
                signInLink: `${PORTAL_UI_URL}/login/sign-in-link?t=${signInToken}&u=${userId}`,
                userEmail,
                userFirstName,
                userLastName,
            });
            return newSignInLinkCount;
        });
    }
    /**
     * Gets the status of a sign-in token for a user.
     * @param {Object} params - The parameters containing userId and signInToken.
     * @returns {Promise<string>} - The status of the sign-in token.
     */
    getSignInTokenStatus(_a) {
        return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, signInToken }) {
            const user = yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userRepository, "f").findById(userId);
            if (!tslib_1.__classPrivateFieldGet(this, _SignInLinkService_instances, "m", _SignInLinkService_doesUserHaveSavedSignInTokens).call(this, user)) {
                return SIGN_IN_LINK.STATUS.NOT_FOUND;
            }
            const databaseSignInTokens = [...user.signInTokens];
            const matchingSignInTokenIndex = databaseSignInTokens.findLastIndex((databaseSignInToken) => tslib_1.__classPrivateFieldGet(this, _SignInLinkService_hasher, "f").verifyHash({
                target: signInToken,
                hash: databaseSignInToken.hash,
                salt: databaseSignInToken.salt,
            }));
            if (matchingSignInTokenIndex === -1) {
                return SIGN_IN_LINK.STATUS.NOT_FOUND;
            }
            const matchingSignInToken = databaseSignInTokens[matchingSignInTokenIndex];
            if (tslib_1.__classPrivateFieldGet(this, _SignInLinkService_instances, "m", _SignInLinkService_isSignInTokenIsInDate).call(this, matchingSignInToken) &&
                tslib_1.__classPrivateFieldGet(this, _SignInLinkService_instances, "m", _SignInLinkService_isSignInTokenIsLastIssued).call(this, { signInTokenIndex: matchingSignInTokenIndex, databaseSignInTokens })) {
                return SIGN_IN_LINK.STATUS.VALID;
            }
            return SIGN_IN_LINK.STATUS.EXPIRED;
        });
    }
    /**
     * Logs in a user and returns the user object and authentication token.
     * @param {string} userId - The ID of the user to log in.
     * @returns {Promise<Object>} - The user object and authentication token.
     */
    loginUser(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const user = yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userRepository, "f").findById(userId);
            tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userService, "f").validateUserIsActiveAndNotDisabled(user);
            const _a = utils.issueValid2faJWT(user), { sessionIdentifier } = _a, tokenObject = tslib_1.__rest(_a, ["sessionIdentifier"]);
            yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_instances, "m", _SignInLinkService_updateLastLoginAndResetSignInData).call(this, { userId: user._id, sessionIdentifier });
            return { user, tokenObject };
        });
    }
    /**
     * Deletes sign-in tokens for a user.
     * @param {string} userId - The ID of the user to delete sign-in tokens.
     * @returns {Promise<number>} - The number of deleted sign-in tokens.
     */
    deleteSignInTokens(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userRepository, "f").deleteSignInTokensForUser(userId);
        });
    }
    /**
     * Resets sign-in data for a user.
     * @param {string} userId - The ID of the user to reset sign-in data.
     */
    resetSignInData(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userRepository, "f").resetSignInData({ userId });
        });
    }
}
_SignInLinkService_randomGenerator = new WeakMap(), _SignInLinkService_hasher = new WeakMap(), _SignInLinkService_userRepository = new WeakMap(), _SignInLinkService_userService = new WeakMap(), _SignInLinkService_instances = new WeakSet(), _SignInLinkService_updateLastLoginAndResetSignInData = function _SignInLinkService_updateLastLoginAndResetSignInData(_a) {
    return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, sessionIdentifier }) {
        return tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userRepository, "f").updateLastLoginAndResetSignInData({ userId, sessionIdentifier });
    });
}, _SignInLinkService_createSignInToken = function _SignInLinkService_createSignInToken() {
    try {
        return tslib_1.__classPrivateFieldGet(this, _SignInLinkService_randomGenerator, "f").randomHexString(SIGN_IN_LINK.TOKEN_BYTE_LENGTH);
    }
    catch (error) {
        throw new Error('Failed to create a sign in token', { cause: error });
    }
}, _SignInLinkService_saveSignInTokenHashAndSalt = function _SignInLinkService_saveSignInTokenHashAndSalt(_a) {
    return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, signInToken }) {
        try {
            const { hash, salt } = tslib_1.__classPrivateFieldGet(this, _SignInLinkService_hasher, "f").hash(signInToken);
            const expiry = new Date().getTime() + SIGN_IN_LINK.DURATION_MILLISECONDS;
            yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userRepository, "f").saveSignInTokenForUser({
                userId,
                signInTokenSalt: salt,
                signInTokenHash: hash,
                expiry,
            });
        }
        catch (error) {
            throw new Error('Failed to save the sign in token', { cause: error });
        }
    });
}, _SignInLinkService_sendSignInLinkEmail = function _SignInLinkService_sendSignInLinkEmail(_a) {
    return tslib_1.__awaiter(this, arguments, void 0, function* ({ userEmail, userFirstName, userLastName, signInLink }) {
        if (process.env.NODE_ENV === 'development') {
            console.info('Sending sign-in link %s', signInLink);
        }
        try {
            yield sendEmail(EMAIL_TEMPLATE_IDS.SIGN_IN_LINK, userEmail, {
                firstName: userFirstName,
                lastName: userLastName,
                signInLink,
                signInLinkDuration: `${SIGN_IN_LINK.DURATION_MINUTES} minute${SIGN_IN_LINK.DURATION_MINUTES === 1 ? '' : 's'}`,
            });
        }
        catch (error) {
            throw new Error('Failed to email the sign in token', { cause: error });
        }
    });
}, _SignInLinkService_incrementSignInLinkSendCount = function _SignInLinkService_incrementSignInLinkSendCount(_a) {
    return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, isUserBlockedOrDisabled, userSignInLinkSendDate, userEmail }) {
        const maxSignInLinkSendCount = 3;
        if (!isUserBlockedOrDisabled) {
            yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_instances, "m", _SignInLinkService_resetSignInDataIfStale).call(this, { userId, userSignInLinkSendDate });
        }
        const signInLinkCount = yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userRepository, "f").incrementSignInLinkSendCount({ userId });
        if (signInLinkCount === 1) {
            yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userRepository, "f").setSignInLinkSendDate({ userId });
        }
        const numberOfSendSignInLinkAttemptsRemaining = maxSignInLinkSendCount - signInLinkCount;
        /*
         * This is "-1" as when a user has a signInLinkCount of 0 after incrementSignInLinkSendCount,
         * they are on their last attempt.
         */
        if (numberOfSendSignInLinkAttemptsRemaining === -1) {
            yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_instances, "m", _SignInLinkService_blockUser).call(this, { userId, reason: STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_LINKS, userEmail });
            throw new UserBlockedError(userId);
        }
        return numberOfSendSignInLinkAttemptsRemaining;
    });
}, _SignInLinkService_resetSignInDataIfStale = function _SignInLinkService_resetSignInDataIfStale(_a) {
    return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, userSignInLinkSendDate }) {
        const TIME_TO_RESET_SIGN_IN_LINK_SEND_COUNT_IN_MILLISECONDS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        const currentDate = Date.now();
        const signInLinkCountStaleDate = currentDate - TIME_TO_RESET_SIGN_IN_LINK_SEND_COUNT_IN_MILLISECONDS;
        if (userSignInLinkSendDate && userSignInLinkSendDate < signInLinkCountStaleDate) {
            yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userRepository, "f").resetSignInData({ userId });
        }
    });
}, _SignInLinkService_blockUser = function _SignInLinkService_blockUser(_a) {
    return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, userEmail, reason }) {
        yield tslib_1.__classPrivateFieldGet(this, _SignInLinkService_userRepository, "f").blockUser({ userId, reason });
        yield sendBlockedEmail(userEmail);
    });
}, _SignInLinkService_isSignInTokenIsInDate = function _SignInLinkService_isSignInTokenIsInDate(signInToken) {
    return Date.now() <= signInToken.expiry;
}, _SignInLinkService_isSignInTokenIsLastIssued = function _SignInLinkService_isSignInTokenIsLastIssued({ signInTokenIndex, databaseSignInTokens }) {
    return signInTokenIndex === databaseSignInTokens.length - 1;
}, _SignInLinkService_doesUserHaveSavedSignInTokens = function _SignInLinkService_doesUserHaveSavedSignInTokens(user) {
    return user.signInTokens !== undefined && user.signInTokens.length > 0;
};
module.exports = {
    SignInLinkService,
};
