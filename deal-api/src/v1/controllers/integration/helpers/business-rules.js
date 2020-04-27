
const CONSTANTS = require('../../../../constants');

const transactions = {
  isPremiumTypeAtMaturity: (premiumType) => (premiumType === CONSTANTS.TRANSACTIONS.FEE_TYPE.MATURITY),
};

module.exports = {
  transactions,
};
