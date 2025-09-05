const { isUkefEmail } = require('@ukef/dtfs2-common');
const { ADMIN, READ_ONLY } = require('../../../roles/roles');

/**
 * Validates that the admin and read-only roles can only be associated with a UKEF email address.
 *
 * @param {object} user - The existing user data.
 * @param {object} change - The candidate change data containing roles and email.
 * @returns {Array<object>} An array of validation error messages, or an empty array if no errors.
 */
const adminReadOnlyFromUkefOnly = (user, change) => {
  const { roles, email, updateEmail } = change;
  const error = [
    {
      roles: {
        order: '1',
        text: 'Admin and read-only roles can only be associated with a UKEF email address',
      },
    },
  ];

  // If role is not being updated
  if (!roles?.length) {
    return [];
  }

  // Only ADMIN and READ_ONLY roles should be restricted to UKEF domain
  const rolesRestrictedToUkefDomain = [ADMIN, READ_ONLY];
  const isEligible = (role) => rolesRestrictedToUkefDomain.includes(role);
  const isRoleRestrictedToUkefDomain = change.roles?.some(isEligible);

  // Admin and read-only role validation
  if (!isRoleRestrictedToUkefDomain) {
    return [];
  }

  // UKEF email address validation
  const username = updateEmail ?? email;

  if (!isUkefEmail(username)) {
    return error;
  }

  // No error to be thrown
  return [];
};

module.exports = adminReadOnlyFromUkefOnly;
