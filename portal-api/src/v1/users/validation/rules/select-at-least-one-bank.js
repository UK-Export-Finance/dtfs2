const { ADMIN } = require('../../../roles/roles');

const CONSTANT = require('../../../../constants');
/**
 * Validates that if the bank is present it is not empty
 * @param {Object} user the existing user
 * @param {Object} change the changes to make
 * @returns {Array} either an empty array or an array containing an error object
 */
const selectAtLeastOneBank = (user, change) => {
  if (!change?.bank) {
    return [
      {
        bank: {
          order: '4',
          text: 'Bank is required',
        },
      },
    ];
  }

  const cantHaveAllBank = change.bank === CONSTANT.ALL && !change.roles?.includes(ADMIN);
  if (cantHaveAllBank) {
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
