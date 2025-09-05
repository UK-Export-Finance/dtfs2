const { isUkefEmail } = require('@ukef/dtfs2-common');
const { READ_ONLY } = require('../../../roles/roles');

/**
 * Validates that the admin role can only be associated with a UKEF email address.
 *
 * @param {object} user - The existing user data.
 * @param {object} change - The candidate change data containing roles and email.
 * @returns {Array<object>} An array of validation error messages, or an empty array if no errors.
 */
const readOnlyFromUkefOnly = (user, change) => {
  const { roles, email, updateEmail } = change;
  const error = [
    {
      roles: {
        order: '1',
        text: 'The read-only role with all Bank can only be associated with a UKEF email address',
      },
    },
  ];

  // If role is not being updated
  if (!roles?.length) {
    return [];
  }

  const readOnly = roles.includes(READ_ONLY);
  const allBanks = change?.bank?.name === 'all';

  // Read-only role validation
  if (!readOnly) {
    return [];
  }

  // UKEF email address validation
  const username = updateEmail ?? email;

  if (allBanks && !isUkefEmail(username)) {
    return error;
  }

  // No error to be thrown
  return [];
};

module.exports = readOnlyFromUkefOnly;
