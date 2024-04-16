"use strict";
var _UserRepository_instances, _UserRepository_validateUsername, _UserRepository_validateUserId;
const tslib_1 = require("tslib");
const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');
const { transformDatabaseUser } = require('./transform-database-user');
const { InvalidUserIdError, InvalidUsernameError, UserNotFoundError, InvalidSessionIdentifierError } = require('../errors');
const { USER, SIGN_IN_LINK } = require('../../constants');
class UserRepository {
    constructor() {
        _UserRepository_instances.add(this);
    }
    saveSignInTokenForUser(_a) {
        return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, signInTokenSalt, signInTokenHash, expiry }) {
            tslib_1.__classPrivateFieldGet(this, _UserRepository_instances, "m", _UserRepository_validateUserId).call(this, userId);
            const saltHex = signInTokenSalt.toString('hex');
            const hashHex = signInTokenHash.toString('hex');
            const userCollection = yield db.getCollection('users');
            return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $push: { signInTokens: { $each: [{ hashHex, saltHex, expiry }], $slice: -SIGN_IN_LINK.MAX_SEND_COUNT } } });
        });
    }
    deleteSignInTokensForUser(userId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            tslib_1.__classPrivateFieldGet(this, _UserRepository_instances, "m", _UserRepository_validateUserId).call(this, userId);
            const userCollection = yield db.getCollection('users');
            return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $unset: { signInTokens: '' } });
        });
    }
    incrementSignInLinkSendCount(_a) {
        return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId }) {
            tslib_1.__classPrivateFieldGet(this, _UserRepository_instances, "m", _UserRepository_validateUserId).call(this, userId);
            const userCollection = yield db.getCollection('users');
            const filter = { _id: { $eq: ObjectId(userId) } };
            const update = { $inc: { signInLinkSendCount: 1 } };
            const options = { returnDocument: 'after' };
            const userUpdate = yield userCollection.findOneAndUpdate(filter, update, options);
            return userUpdate.value.signInLinkSendCount;
        });
    }
    setSignInLinkSendDate(_a) {
        return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId }) {
            tslib_1.__classPrivateFieldGet(this, _UserRepository_instances, "m", _UserRepository_validateUserId).call(this, userId);
            const userCollection = yield db.getCollection('users');
            return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: { signInLinkSendDate: Date.now() } });
        });
    }
    resetSignInData(_a) {
        return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId }) {
            tslib_1.__classPrivateFieldGet(this, _UserRepository_instances, "m", _UserRepository_validateUserId).call(this, userId);
            const userCollection = yield db.getCollection('users');
            const unsetUpdate = {
                signInLinkSendCount: '',
                signInLinkSendDate: '',
                signInTokens: '',
            };
            return userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $unset: unsetUpdate });
        });
    }
    updateLastLoginAndResetSignInData(_a) {
        return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, sessionIdentifier }) {
            tslib_1.__classPrivateFieldGet(this, _UserRepository_instances, "m", _UserRepository_validateUserId).call(this, userId);
            if (!sessionIdentifier) {
                throw new InvalidSessionIdentifierError(sessionIdentifier);
            }
            const userCollection = yield db.getCollection('users');
            const setUpdate = {
                lastLogin: Date.now(),
                loginFailureCount: 0,
                sessionIdentifier,
            };
            const unsetUpdate = {
                signInLinkSendCount: '',
                signInLinkSendDate: '',
                signInTokens: '',
            };
            yield userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: setUpdate, $unset: unsetUpdate });
        });
    }
    blockUser(_a) {
        return tslib_1.__awaiter(this, arguments, void 0, function* ({ userId, reason }) {
            tslib_1.__classPrivateFieldGet(this, _UserRepository_instances, "m", _UserRepository_validateUserId).call(this, userId);
            const userCollection = yield db.getCollection('users');
            const update = {
                'user-status': USER.STATUS.BLOCKED,
                blockedStatusReason: reason,
            };
            yield userCollection.updateOne({ _id: { $eq: ObjectId(userId) } }, { $set: update });
        });
    }
    findById(_id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            tslib_1.__classPrivateFieldGet(this, _UserRepository_instances, "m", _UserRepository_validateUserId).call(this, _id);
            const collection = yield db.getCollection('users');
            const user = yield collection.findOne({ _id: { $eq: ObjectId(_id) } });
            if (!user) {
                throw new UserNotFoundError(_id);
            }
            return transformDatabaseUser(user);
        });
    }
    findByUsername(username) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            tslib_1.__classPrivateFieldGet(this, _UserRepository_instances, "m", _UserRepository_validateUsername).call(this, username);
            const collection = yield db.getCollection('users');
            const user = collection.findOne({ username: { $eq: username } }, { collation: { locale: 'en', strength: 2 } });
            if (!user) {
                throw new UserNotFoundError(username);
            }
            return transformDatabaseUser(user);
        });
    }
}
_UserRepository_instances = new WeakSet(), _UserRepository_validateUsername = function _UserRepository_validateUsername(username) {
    if (typeof username !== 'string') {
        throw new InvalidUsernameError(username);
    }
}, _UserRepository_validateUserId = function _UserRepository_validateUserId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new InvalidUserIdError(userId);
    }
};
module.exports = {
    UserRepository,
};
