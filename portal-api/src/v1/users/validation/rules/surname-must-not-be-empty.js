/**
 * Validates that if the surname is present it is not empty
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const surnameMustNotBeEmpty = (user, change) => {
  if (!change?.surname?.trim()) {
    return [
      {
        surname: {
          order: '2',
          text: 'Surname is required',
        },
      },
    ];
  }

  return [];
};

module.exports = surnameMustNotBeEmpty;
