/**
 * Validates that if the roles are present at least one is not null
 * @param {object} user the existing user
 * @param {object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const selectAtLeastOneRole = (user, change) => {
  if (!change?.roles?.some((item) => item)) {
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
