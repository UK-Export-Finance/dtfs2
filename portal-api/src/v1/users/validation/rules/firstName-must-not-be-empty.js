/**
 * Validates that if the password is present it is at least 8 characters long
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const firstnameMustNotBeEmpty = (user, change) => {
  if (!change.firstname) {
    return [
      {
        firstname: {
          order: '1',
          text: 'First name is required',
        },
      },
    ];
  }

  return [];
};

module.exports = firstnameMustNotBeEmpty;
