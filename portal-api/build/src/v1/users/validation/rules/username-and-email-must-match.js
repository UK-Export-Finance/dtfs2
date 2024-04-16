"use strict";
/**
 * Ensures that if the change has either an email or username property, both exist and are the same
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const usernameAndEmailMustMatch = (user, change) => {
    const error = [
        {
            email: {
                order: '1',
                text: 'Username and email must match',
            },
        },
    ];
    if ((change === null || change === void 0 ? void 0 : change.username) !== (change === null || change === void 0 ? void 0 : change.email)) {
        return error;
    }
    return [];
};
module.exports = usernameAndEmailMustMatch;
