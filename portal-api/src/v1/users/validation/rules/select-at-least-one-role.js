/**
 * Validates that if the roles are present at least one is not null
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const selectAtLeastOneRole = (user, change) => {
  if (
    !change.roles ||
    change.roles.length === 0 ||
    (change.roles.length === 1 && change.roles[0] === null) ||
    (typeof change.roles === 'object' && Object.keys(change.roles).length === 0) ||
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
