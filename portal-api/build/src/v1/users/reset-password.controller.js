"use strict";
const tslib_1 = require("tslib");
const db = require('../../drivers/db-client');
const sendEmail = require('../email');
const { createPasswordToken } = require('./controller');
const { EMAIL_TEMPLATE_IDS } = require('../../constants');
const sendResetEmail = (emailAddress, resetToken) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield sendEmail(EMAIL_TEMPLATE_IDS.PASSWORD_RESET, emailAddress, {
        resetToken,
    });
});
exports.resetPassword = (email, userService) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const resetToken = yield createPasswordToken(email, userService);
    if (resetToken) {
        yield sendResetEmail(email, resetToken);
    }
});
exports.getUserByPasswordToken = (resetPwdToken) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (typeof resetPwdToken !== 'string') {
        throw new Error('Invalid Reset Pwd Token');
    }
    const collection = yield db.getCollection('users');
    const user = yield collection.findOne({ resetPwdToken: { $eq: resetPwdToken } });
    if (!user) {
        return false;
    }
    return user;
});
