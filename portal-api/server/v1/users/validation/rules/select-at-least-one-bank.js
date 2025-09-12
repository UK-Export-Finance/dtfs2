const {
  ROLES: { ADMIN, READ_ONLY },
  BANKS,
} = require('@ukef/dtfs2-common');

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

  const eligibleRoles = [ADMIN, READ_ONLY];

  const isBankAll = change.bank?.name === BANKS.ALL;
  const isEligible = (role) => eligibleRoles.includes(role);
  const isRoleEligible = change.roles?.some(isEligible);

  const cannotHaveAllBank = isBankAll && !isRoleEligible;

  if (cannotHaveAllBank) {
    return [
      {
        bank: {
          order: '4',
          text: 'Only the admin and read-only user can be allocated to "All" bank',
        },
      },
    ];
  }

  return [];
};

module.exports = selectAtLeastOneBank;
