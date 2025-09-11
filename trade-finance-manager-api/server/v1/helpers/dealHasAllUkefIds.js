const CONSTANTS = require('../../constants');
const { findOneTfmDeal } = require('../controllers/deal.controller');
const { isValidUkefNumericId } = require('../validation/validateIds');

/**
 * Verify whether the deal and all its facilities have a UKEF ID.
 * `PENDING` is an acceptable ID.
 * @param {string} dealId UKEF tfmDeal ID
 * @returns {Promise<boolean>}  Boolean value
 */
const dealHasAllUkefIds = async (dealId) => {
  const tfmDeal = await findOneTfmDeal(dealId);

  if (tfmDeal?.dealSnapshot?.facilities) {
    const dealHasId =
      tfmDeal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF
        ? Boolean(tfmDeal?.dealSnapshot?.ukefDealId)
        : Boolean(tfmDeal?.dealSnapshot?.details.ukefDealId);

    const facilitiesHaveIds = tfmDeal.dealSnapshot.facilities.filter((f) => !f?.facilitySnapshot?.ukefFacilityId).length === 0;

    return { status: dealHasId && facilitiesHaveIds };
  }

  return { status: false, message: 'TFM deal not found' };
};

/**
 * Verify whether the deal and all its facilities have a valid UKEF ID.
 * 10 digit numerical ID.
 * @param {string} dealId UKEF tfmDeal ID
 * @returns {Promise<boolean>}  Boolean value
 */
const dealHasAllValidUkefIds = async (dealId) => {
  const tfmDeal = await findOneTfmDeal(dealId);

  if (tfmDeal?.dealSnapshot?.facilities) {
    const dealHasId =
      tfmDeal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF
        ? Boolean(tfmDeal?.dealSnapshot?.ukefDealId) && isValidUkefNumericId(tfmDeal?.dealSnapshot?.ukefDealId)
        : Boolean(tfmDeal?.dealSnapshot?.details.ukefDealId) && isValidUkefNumericId(tfmDeal?.dealSnapshot?.details.ukefDealId);

    const facilitiesHaveIds =
      tfmDeal.dealSnapshot.facilities.filter((f) => !f?.facilitySnapshot?.ukefFacilityId && !isValidUkefNumericId(f?.facilitySnapshot?.ukefFacilityId))
        .length === 0;

    return { status: dealHasId && facilitiesHaveIds };
  }

  return { status: false, message: 'TFM Deal not found' };
};

module.exports = {
  dealHasAllUkefIds,
  dealHasAllValidUkefIds,
};
