const { cloneDeep } = require('lodash');
const { getAmendmentsInProgressSubmittedFromPim } = require('./amendments.helper');
const { DEAL } = require('../../constants');

/**
 * Override the deal stage if there is an amendment in progress
 * @param {import('@ukef/dtfs2-common').TfmDeal[]} deals - the deals
 * @param {import('@ukef/dtfs2-common').TfmFacilityAmendment[]} amendments - the amendments
 * @returns {import('@ukef/dtfs2-common').TfmDeal[]} the deals with deal stage overwritten if there is an amendment in progress
 */
const overrideDealsIfAmendmentsInProgress = (deals, amendments) => {
  if (Array.isArray(amendments) && amendments?.length > 0) {
    return deals.map((deal) => {
      const modifiedDeal = cloneDeep(deal);

      const amendmentsForDeal = amendments.filter(({ dealId }) => dealId === deal._id);
      const amendmentInProgressOnDeal = getAmendmentsInProgressSubmittedFromPim({ amendments: amendmentsForDeal, deal });

      if (amendmentInProgressOnDeal.length > 0) {
        modifiedDeal.tfm.stage = DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
      }

      return modifiedDeal;
    });
  }
  return deals;
};

module.exports = { overrideDealsIfAmendmentsInProgress };
