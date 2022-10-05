const { findOneTfmDeal } = require('../controllers/deal.controller');
const CONSTANTS = require('../../constants');

/**
 * Verify whether the deal and all its facilities have a UKEF ID.
 * @param {String} dealId UKEF tfmDeal ID
 * @returns {Boolean}  Boolean value
 */
const dealHasAllUkefIds = async (dealId) => {
  const tfmDeal = await findOneTfmDeal(dealId);

  if (tfmDeal && tfmDeal.dealSnapshot && tfmDeal.dealSnapshot.facilities) {
    const dealHasId = tfmDeal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF
      ? !!tfmDeal.dealSnapshot.ukefDealId
      : !!tfmDeal.dealSnapshot.details.ukefDealId;

    const facilitiesHaveIds = tfmDeal.dealSnapshot.facilities.filter((f) => !f.facilitySnapshot.ukefFacilityId).length === 0;

    return { status: dealHasId && facilitiesHaveIds };
  }

  return { status: false, message: 'TFM Deal not found' };
};

module.exports = dealHasAllUkefIds;
