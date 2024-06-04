const CONSTANTS = require('../../constants');

const overrideDealsIfAmendmentsInProgress = (deals, amendments) => {
  // override the deal stage if there is an amendment in progress
  if (Array.isArray(amendments) && amendments?.length > 0) {
    return deals.map((deal) => {
      const modifiedDeal = deal;
      // eslint-disable-next-line no-restricted-syntax
      for (const amendment of amendments) {
        const amendmentIsInProgress = amendment.status === CONSTANTS.AMENDMENTS.AMENDMENT_STATUS.IN_PROGRESS;
        if (amendmentIsInProgress && amendment.dealId === deal._id) {
          modifiedDeal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;
          break;
        }
      }
      return modifiedDeal;
    });
  }
  return deals;
};

module.exports = { overrideDealsIfAmendmentsInProgress };
