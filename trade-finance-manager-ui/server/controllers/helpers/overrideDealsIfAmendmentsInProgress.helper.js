const { cloneDeep } = require('lodash');
const { filterAmendmentsByInProgress } = require('./amendments.helper');
const { DEAL } = require('../../constants');

const overrideDealsIfAmendmentsInProgress = (deals, amendments) => {
  // override the deal stage if there is an amendment in progress
  if (Array.isArray(amendments) && amendments?.length > 0) {
    return deals.map((deal) => {
      const modifiedDeal = cloneDeep(deal);

      const amendmentsForDeal = amendments.filter(({ dealId }) => dealId === deal._id);
      const amendmentInProgressOnDeal = filterAmendmentsByInProgress({ amendments: amendmentsForDeal, deal });

      if (amendmentInProgressOnDeal.length > 0) {
        modifiedDeal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
      }

      return modifiedDeal;
    });
  }
  return deals;
};

module.exports = { overrideDealsIfAmendmentsInProgress };
