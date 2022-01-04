const {
  findOneTfmDeal,
} = require('../controllers/deal.controller');
const CONSTANTS = require('../../constants');

/**
 * Verified whether the deal and all its facilities have a UKEF ID
 * @param {String} dealId UKEF deal ID
 * @returns {Boolean}  Boolean value
 */
const dealHasAllUkefIds = async (dealId) => {
  const deal = await findOneTfmDeal(dealId);

  if (deal && deal.dealSnapshot && deal.dealSnapshot.facilities) {
    const dealHasId = deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF
      ? !!deal.dealSnapshot.ukefDealId
      : !!deal.dealSnapshot.details.ukefDealId;

    const facilitiesHaveIds = deal.dealSnapshot.facilities.filter((f) =>
      !f.facilitySnapshot.ukefFacilityId).length === 0;

    return dealHasId && facilitiesHaveIds;
  }

  return false;
};

module.exports = dealHasAllUkefIds;
