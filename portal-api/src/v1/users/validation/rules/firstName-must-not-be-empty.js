/**
 * Validates that if the first name is present it is not empty
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
