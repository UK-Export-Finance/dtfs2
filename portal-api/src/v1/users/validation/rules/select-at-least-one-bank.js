const { ADMIN, READ_ONLY } = require('../../../roles/roles');

const CONSTANT = require('../../../../constants');
/**
 * Validates that if the bank is present it is not empty
 * @param {object} user the existing user
 * @param {object} change the changes to make
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

  const cantHaveAllBank = change.bank?.name === CONSTANT.ALL && !(change.roles?.includes(ADMIN) || change.roles?.includes(READ_ONLY));
  if (cantHaveAllBank) {
    return [
      {
        bank: {
          order: '4',
          text: 'Only admin and read-only users can have "All" as the bank',
        },
      },
    ];
  }

  return [];
};

module.exports = selectAtLeastOneBank;
