const CONSTANTS = require('../../../../constants');

const transactions = {
  isPremiumTypeAtMaturity: (premiumType) => (premiumType === CONSTANTS.FACILITIES.FEE_TYPE.MATURITY),
};

module.exports = {
  transactions,
};
