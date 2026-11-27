/**
 * Validates that if the lastName is present it is not empty
 * @param {object} user the existing user
 * @param {object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const lastNameMustNotBeEmpty = (user, change) => {
  if (!change?.lastName?.trim()) {
    return [
      {
        lastName: {
          order: '2',
          text: 'Last name is required',
        },
      },
    ];
  }

  return [];
};

module.exports = lastNameMustNotBeEmpty;
