const { multipleBondStatus } = require('./bond');
const { aboutSupplyContractStatus } = require('./about');

exports.dealSectionStatuses = (deal) => ({
  ...deal,
  bondTransactions: multipleBondStatus(deal.bondTransactions),
  submissionDetails: {
    ...deal.submissionDetails,
    status: aboutSupplyContractStatus(deal.submissionDetails),
  },
});
