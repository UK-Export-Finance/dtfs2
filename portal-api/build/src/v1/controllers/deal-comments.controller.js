"use strict";
const tslib_1 = require("tslib");
const api = require('../api');
exports.addComment = (_id, commentToAdd, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const commentToInsert = {
        user,
        text: commentToAdd,
    };
    const value = yield api.addDealComment(_id, 'comments', commentToInsert);
    return value;
});
exports.addUkefComment = (_id, commentToAdd, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!commentToAdd) {
        return false;
    }
    const commentToInsert = {
        user,
        text: commentToAdd,
    };
    const value = yield api.addDealComment(_id, 'ukefComments', commentToInsert);
    return value;
});
exports.addUkefDecision = (_id, commentToAdd, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!commentToAdd) {
        return false;
    }
    const commentToInsert = {
        user,
        text: commentToAdd,
    };
    const value = yield api.addDealComment(_id, 'ukefDecision', commentToInsert);
    return value;
});
