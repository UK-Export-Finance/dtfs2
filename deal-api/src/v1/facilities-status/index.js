const { multipleBondStatus } = require('./bond');

exports.dealFacilityStatuses = (deal) => ({
  ...deal,
  bondTransactions: multipleBondStatus(deal.bondTransactions),
});
