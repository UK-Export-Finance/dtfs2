"use strict";
const tslib_1 = require("tslib");
/**
 * Ensures that if the change has an email property, it is a unique email address
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Promise<Array>} either an empty array or an array containing an error object if the email is not a unique email address
 */
const { InvalidEmailAddressError, UserNotFoundError } = require('../../../errors');
const { findByEmail } = require('../../controller');
const emailMustBeUnique = (user, change) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!(change === null || change === void 0 ? void 0 : change.email)) {
        return [];
    }
    try {
        // we use a simple callback to allow for more compartmentalised unit testing
        yield findByEmail(change.email);
        return [
            {
                email: {
                    order: '1',
                    text: 'Email address already in use',
                },
            },
        ];
    }
    catch (error) {
        if (error instanceof InvalidEmailAddressError || error instanceof UserNotFoundError) {
            return [];
        }
        throw error;
    }
});
module.exports = emailMustBeUnique;
