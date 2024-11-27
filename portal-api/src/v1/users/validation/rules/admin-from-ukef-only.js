const { isUkefEmail } = require('@ukef/dtfs2-common');
const { ADMIN } = require('../../../roles/roles');

/**
 * Validates that the admin role can only be associated with a UKEF email address.
 *
 * @param {Object} user - The existing user data.
 * @param {Object} change - The candidate change data containing roles and email.
 * @returns {Array<Object>} An array of validation error messages, or an empty array if no errors.
 */
const adminFromUkefOnly = (user, change) => {
  const { roles, email } = change;
  const admin = roles.includes(ADMIN);

  // Admin role validation
  if (!admin) {
    return [];
  }

  // UKEF email address validation
  if (!isUkefEmail(email)) {
    return [
      {
        email: {
          order: '1',
          text: 'Admin role can only be associated with an UKEF email address',
        },
      },
    ];
  }

  // No error to be thrown
  return [];
};

module.exports = adminFromUkefOnly;
