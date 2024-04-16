"use strict";
const { READ_ONLY } = require('../../../roles/roles');
const error = {
    roles: {
        text: "You cannot combine 'Read-only' with any of the other roles",
    },
};
const hasANonReadOnlyRole = (target) => { var _a; return (_a = target === null || target === void 0 ? void 0 : target.roles) === null || _a === void 0 ? void 0 : _a.some((role) => role !== READ_ONLY); };
const hasReadOnlyRole = (target) => { var _a; return (_a = target === null || target === void 0 ? void 0 : target.roles) === null || _a === void 0 ? void 0 : _a.includes(READ_ONLY); };
/**
 * Validates that if the change has a read-only role, it is not combined with any other roles
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const readOnlyRoleCannotBeAssignedWithOtherRoles = (_user, change) => (hasReadOnlyRole(change) && hasANonReadOnlyRole(change) ? [error] : []);
module.exports = readOnlyRoleCannotBeAssignedWithOtherRoles;
