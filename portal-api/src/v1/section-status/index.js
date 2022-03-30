const { addAccurateStatusesToBonds } = require('./bonds');
const { addAccurateStatusesToLoans } = require('./loans');
const { aboutSupplyContractStatus } = require('./about');

exports.dealSectionStatuses = (deal) => ({
  ...deal,
  bonds: addAccurateStatusesToBonds(deal.status, deal.submissionType, deal.facilities),
  loans: addAccurateStatusesToLoans(deal.status, deal.submissionType, deal.facilities),
  submissionDetails: {
    ...deal.submissionDetails,
    status: aboutSupplyContractStatus(deal.submissionDetails),
  },
});
