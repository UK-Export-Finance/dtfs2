"use strict";
const tslib_1 = require("tslib");
const { ObjectId } = require('mongodb');
const { getNowAsEpochMillisecondString } = require('../helpers/date');
const db = require('../../drivers/db-client');
const sendEmail = require('../email');
const businessRules = require('../../config/businessRules');
const { sanitizeUser } = require('./sanitizeUserData');
const utils = require('../../crypto/utils');
const CONSTANTS = require('../../constants');
const { isValidEmail } = require('../../utils/string');
const { USER, PAYLOAD } = require('../../constants');
const payloadVerification = require('../helpers/payload');
const { InvalidUserIdError, InvalidEmailAddressError, UserNotFoundError } = require('../errors');
const InvalidSessionIdentifierError = require('../errors/invalid-session-identifier.error');
const { transformDatabaseUser } = require('./transform-database-user');
/**
 * Send a password update confirmation email with update timestamp.
 * @param {String} emailAddress User email address
 * @param {String} timestamp Password update timestamp
 */
const sendPasswordUpdateEmail = (emailAddress, timestamp) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const formattedTimestamp = new Date(Number(timestamp)).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        year: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short',
    });
    yield sendEmail(CONSTANTS.EMAIL_TEMPLATE_IDS.PASSWORD_UPDATE, emailAddress, {
        timestamp: formattedTimestamp,
    });
});
exports.sendPasswordUpdateEmail = sendPasswordUpdateEmail;
const createPasswordToken = (email, userService) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (typeof email !== 'string') {
        throw new Error('Invalid Email');
    }
    const collection = yield db.getCollection('users');
    const user = yield collection.findOne({ email: { $eq: email } }, { collation: { locale: 'en', strength: 2 } });
    if (!user || userService.isUserBlockedOrDisabled(user)) {
        console.info('Not creating password token due to invalid or missing user');
        return false;
    }
    const { hash } = utils.genPasswordResetToken(user);
    const userUpdate = {
        resetPwdToken: hash,
        resetPwdTimestamp: `${Date.now()}`,
    };
    if (!ObjectId.isValid(user._id)) {
        throw new InvalidUserIdError(user._id);
    }
    yield collection.updateOne({ _id: { $eq: user._id } }, { $set: userUpdate }, {});
    return hash;
});
exports.createPasswordToken = createPasswordToken;
const sendBlockedEmail = (emailAddress) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield sendEmail(CONSTANTS.EMAIL_TEMPLATE_IDS.BLOCKED, emailAddress, {});
});
exports.sendBlockedEmail = sendBlockedEmail;
const sendUnblockedEmail = (emailAddress) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield sendEmail(CONSTANTS.EMAIL_TEMPLATE_IDS.UNBLOCKED, emailAddress, {});
});
const sendNewAccountEmail = (user, resetToken) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const emailAddress = user.username;
    const variables = {
        username: user.username,
        firstname: user.firstname,
        surname: user.surname,
        bank: user.bank && user.bank.name ? user.bank.name : '',
        roles: user.roles.join(','),
        status: user['user-status'],
        resetToken,
    };
    yield sendEmail(CONSTANTS.EMAIL_TEMPLATE_IDS.NEW_ACCOUNT, emailAddress, variables);
});
exports.list = (callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const collection = yield db.getCollection('users');
    collection.find().toArray(callback);
});
/**
 * @deprecated Use findById inside user repository instead
 */
exports.findOne = (_id, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!ObjectId.isValid(_id)) {
        throw new InvalidUserIdError(_id);
    }
    const collection = yield db.getCollection('users');
    collection.findOne({ _id: { $eq: ObjectId(_id) } }, callback);
});
/**
 * @deprecated Use findByUsername inside user repository instead
 */
exports.findByUsername = (username, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (typeof username !== 'string') {
        throw new Error('Invalid Username');
    }
    const collection = yield db.getCollection('users');
    collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } }, callback);
});
exports.findByEmail = (email) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!isValidEmail(email)) {
        throw new InvalidEmailAddressError(email);
    }
    const collection = yield db.getCollection('users');
    const user = yield collection.findOne({ email: { $eq: email } });
    if (!user) {
        throw new UserNotFoundError(email);
    }
    return transformDatabaseUser(user);
});
exports.create = (user, userService, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const insert = Object.assign({ 'user-status': USER.STATUS.ACTIVE, timezone: USER.TIMEZONE.DEFAULT }, user);
    insert === null || insert === void 0 ? true : delete insert.autoCreatePassword;
    insert === null || insert === void 0 ? true : delete insert.password;
    insert === null || insert === void 0 ? true : delete insert.passwordConfirm;
    if (payloadVerification(insert, PAYLOAD.PORTAL.USER)) {
        const collection = yield db.getCollection('users');
        const createUserResult = yield collection.insertOne(insert);
        const { insertedId: userId } = createUserResult;
        if (!ObjectId.isValid(userId)) {
            throw new InvalidUserIdError(userId);
        }
        const createdUser = yield collection.findOne({ _id: { $eq: userId } });
        const sanitizedUser = sanitizeUser(createdUser);
        const resetPasswordToken = yield createPasswordToken(sanitizedUser.email, userService);
        yield sendNewAccountEmail(sanitizedUser, resetPasswordToken);
        return callback(null, sanitizedUser);
    }
    return callback('Invalid user payload', user);
});
exports.update = (_id, update, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!ObjectId.isValid(_id)) {
        throw new InvalidUserIdError(_id);
    }
    const userSetUpdate = Object.assign({}, update);
    let userUnsetUpdate;
    const collection = yield db.getCollection('users');
    collection.findOne({ _id: { $eq: ObjectId(_id) } }, (error, existingUser) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (existingUser['user-status'] !== USER.STATUS.BLOCKED && userSetUpdate['user-status'] === USER.STATUS.BLOCKED) {
            // User is being blocked.
            yield sendBlockedEmail(existingUser.email);
        }
        if (existingUser['user-status'] === USER.STATUS.BLOCKED && userSetUpdate['user-status'] === USER.STATUS.ACTIVE) {
            // User is being re-activated.
            userSetUpdate.loginFailureCount = 0;
            userUnsetUpdate = {
                signInLinkSendDate: '',
                signInLinkSendCount: '',
                blockedStatusReason: '',
            };
            yield sendUnblockedEmail(existingUser.email);
        }
        // Password update
        if (userSetUpdate.password) {
            const { password: newPassword } = userSetUpdate;
            const { salt: oldSalt, hash: oldHash, blockedPasswordList: oldBlockedPasswordList = [] } = existingUser;
            // don't save the raw password or password confirmation to mongo...
            delete userSetUpdate.password;
            delete userSetUpdate.passwordConfirm;
            delete userSetUpdate.currentPassword;
            // create new salt/hash for the new password
            const { salt, hash } = utils.genPassword(newPassword);
            // queue update of salt+hash, ie store the encrypted password
            userSetUpdate.salt = salt;
            userSetUpdate.hash = hash;
            // queue the addition of the old salt/hash to our list of blocked passwords that we re-check
            // in 'passwordsCannotBeReUsed' rule
            if (oldSalt && oldHash) {
                userSetUpdate.blockedPasswordList = oldBlockedPasswordList.concat([{ oldSalt, oldHash }]);
            }
            userSetUpdate.loginFailureCount = 0;
            userSetUpdate.passwordUpdatedAt = Date.now();
            // Send password update email notification to the user
            sendPasswordUpdateEmail(existingUser.email, userSetUpdate.passwordUpdatedAt);
        }
        delete userSetUpdate.password;
        delete userSetUpdate.passwordConfirm;
        delete userSetUpdate.currentPassword;
        const userUpdate = { $set: userSetUpdate };
        if (userUnsetUpdate) {
            userUpdate.$unset = userUnsetUpdate;
        }
        const updatedUser = yield collection.findOneAndUpdate({ _id: { $eq: ObjectId(_id) } }, userUpdate, { returnDocument: 'after' });
        callback(null, updatedUser);
    }));
});
exports.updateSessionIdentifier = (user, sessionIdentifier, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!ObjectId.isValid(user._id)) {
        throw new InvalidUserIdError(user._id);
    }
    if (!sessionIdentifier) {
        throw new InvalidSessionIdentifierError(sessionIdentifier);
    }
    const collection = yield db.getCollection('users');
    const update = {
        sessionIdentifier,
    };
    yield collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});
    callback();
});
exports.updateLastLoginAndResetSignInData = (user_1, sessionIdentifier_1, ...args_1) => tslib_1.__awaiter(void 0, [user_1, sessionIdentifier_1, ...args_1], void 0, function* (user, sessionIdentifier, callback = () => { }) {
    if (!ObjectId.isValid(user._id)) {
        throw new InvalidUserIdError(user._id);
    }
    if (!sessionIdentifier) {
        throw new InvalidSessionIdentifierError(sessionIdentifier);
    }
    const collection = yield db.getCollection('users');
    const update = {
        lastLogin: getNowAsEpochMillisecondString(),
        loginFailureCount: 0,
        sessionIdentifier,
    };
    yield collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});
    callback();
});
exports.incrementFailedLoginCount = (user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!ObjectId.isValid(user._id)) {
        throw new InvalidUserIdError(user._id);
    }
    const collection = yield db.getCollection('users');
    const failureCount = user.loginFailureCount ? user.loginFailureCount + 1 : 1;
    const thresholdReached = failureCount >= businessRules.loginFailureCount_Limit;
    const update = thresholdReached
        ? {
            'user-status': USER.STATUS.BLOCKED,
            blockedStatusReason: USER.STATUS_BLOCKED_REASON.INVALID_PASSWORD,
        }
        : {
            loginFailureCount: failureCount,
            lastLoginFailure: getNowAsEpochMillisecondString(),
        };
    yield collection.updateOne({ _id: { $eq: ObjectId(user._id) } }, { $set: update }, {});
    if (thresholdReached) {
        yield sendBlockedEmail(user.username);
    }
});
exports.disable = (_id, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!ObjectId.isValid(_id)) {
        throw new InvalidUserIdError(_id);
    }
    const collection = yield db.getCollection('users');
    const userUpdate = {
        disabled: true,
    };
    const status = yield collection.updateOne({ _id: { $eq: ObjectId(_id) } }, { $set: userUpdate }, {});
    callback(null, status);
});
exports.remove = (_id, callback) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (ObjectId.isValid(_id)) {
        const collection = yield db.getCollection('users');
        const status = yield collection.deleteOne({ _id: { $eq: ObjectId(_id) } });
        return callback(null, status);
    }
    return callback('Invalid portal user id', 400);
});
