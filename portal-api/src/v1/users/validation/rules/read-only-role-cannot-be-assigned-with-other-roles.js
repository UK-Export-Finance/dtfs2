const { READ_ONLY } = require('../../../roles/roles');

const error = {
  roles: {
    text: "You cannot combine 'Read-only' with any of the other roles",
  },
};

const hasANonReadOnlyRole = (target) => target?.roles?.some((role) => role !== READ_ONLY);
const hasReadOnlyRole = (target) => target?.roles?.includes(READ_ONLY);

/**
 * Validates that if the change has a read-only role, it is not combined with any other roles
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const readOnlyRoleCannotBeAssignedWithOtherRoles = (user, change) => (hasReadOnlyRole(change) && hasANonReadOnlyRole(change) ? [error] : []);

module.exports = readOnlyRoleCannotBeAssignedWithOtherRoles;
