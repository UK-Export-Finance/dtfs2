"use strict";
const tslib_1 = require("tslib");
const passwordAtLeast8Characters = require('./rules/passwordAtLeast8Characters');
const passwordAtLeastOneNumber = require('./rules/passwordAtLeastOneNumber');
const passwordAtLeastOneUppercase = require('./rules/passwordAtLeastOneUppercase');
const passwordAtLeastOneLowercase = require('./rules/passwordAtLeastOneLowercase');
const passwordAtLeastOneSpecialCharacter = require('./rules/passwordAtLeastOneSpecialCharacter');
const passwordsCannotBeReUsed = require('./rules/passwordsCannotBeReUsed');
const passwordsMustMatch = require('./rules/passwordsMustMatch');
const currentPasswordMustMatch = require('./rules/currentPasswordMustMatch');
const readOnlyRoleCannotBeAssignedWithOtherRoles = require('./rules/read-only-role-cannot-be-assigned-with-other-roles');
const usernameAndEmailMustMatch = require('./rules/username-and-email-must-match');
const emailMustBeValidEmailAddress = require('./rules/email-must-be-valid-email-address');
const emailMustBeUnique = require('./rules/email-must-be-unique');
const createRules = [
    passwordAtLeast8Characters,
    passwordAtLeastOneNumber,
    passwordAtLeastOneUppercase,
    passwordAtLeastOneLowercase,
    passwordAtLeastOneSpecialCharacter,
    readOnlyRoleCannotBeAssignedWithOtherRoles,
    usernameAndEmailMustMatch,
    emailMustBeValidEmailAddress,
    emailMustBeUnique,
];
const updateWithoutCurrentPasswordRules = [
    passwordAtLeast8Characters,
    passwordAtLeastOneNumber,
    passwordAtLeastOneUppercase,
    passwordAtLeastOneLowercase,
    passwordAtLeastOneSpecialCharacter,
    passwordsMustMatch,
    passwordsCannotBeReUsed,
    readOnlyRoleCannotBeAssignedWithOtherRoles,
    usernameAndEmailMustMatch,
    emailMustBeValidEmailAddress,
    emailMustBeUnique,
];
const updateWithCurrentPasswordRules = [...updateWithoutCurrentPasswordRules, currentPasswordMustMatch];
const applyRules = (ruleset, existingUser, candidateChange) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let errors = [];
    for (const rule of ruleset) {
        const result = yield rule(existingUser, candidateChange);
        if (result.length) {
            errors = errors.concat(result);
        } // We concat here as rules return an array
    }
    return errors;
});
const applyCreateRules = (candidateChange) => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield applyRules(createRules, null, candidateChange); });
const applyUpdateRules = (existingUser, candidateChange) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const rules = !candidateChange.currentPassword ? updateWithoutCurrentPasswordRules : updateWithCurrentPasswordRules;
    return yield applyRules(rules, existingUser, candidateChange);
});
module.exports = {
    applyCreateRules,
    applyUpdateRules,
};
