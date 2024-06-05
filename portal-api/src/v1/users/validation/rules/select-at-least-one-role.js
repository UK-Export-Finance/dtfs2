/**
 * Validates that if the roles are present at least one is not null
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const selectAtLeastOneRole = (user, change) => {
  if (
    !change.roles ||
    (Array.isArray(change.roles) && change.roles.every((item) => item === null)) ||
    (typeof change.roles === 'string' && change.roles.trim() === '')
  ) {
    return [
      {
        roles: {
          order: '3',
          text: 'At least one role is required',
        },
      },
    ];
  }

  return [];
};

module.exports = selectAtLeastOneRole;
