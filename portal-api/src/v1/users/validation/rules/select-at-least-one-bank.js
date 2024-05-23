/**
 * Validates that if the password is present it is at least 8 characters long
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const selectAtLeastOneBank = (user, change) => {
  if (!change.bank) {
    return [
      {
        bank: {
          order: '4',
          text: 'Bank is required',
        },
      },
    ];
  }

  if (change.bank === 'all' && (!change.roles || !change.roles.includes('admin'))) {
    return [
      {
        bank: {
          order: '4',
          text: 'Only admins can have "All" as the bank',
        },
      },
    ];
  }

  return [];
};

module.exports = selectAtLeastOneBank;
