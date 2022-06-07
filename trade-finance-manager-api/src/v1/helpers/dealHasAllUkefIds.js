const { findOneTfmDeal, findOnePortalDeal } = require('../controllers/deal.controller');
const CONSTANTS = require('../../constants');

/**
 * Verified whether the tfmDeal and all its facilities have a UKEF ID
 * @param {String} dealId UKEF tfmDeal ID
 * @returns {Boolean}  Boolean value
 */
const dealHasAllUkefIds = async (dealId) => {
  const portalDeal = await findOnePortalDeal(dealId);
  const migrationScript = Boolean(process.env.DATA_MIGRATION_SCRIPT);
  console.log('===', migrationScript);
  /**
   * Checks if the deals is migrated or not,
   * only whe the deal migration is not running i.e. set to `false`
   */

  const migrated = migrationScript
    ? false
    : Object.prototype.hasOwnProperty.call(portalDeal, 'dataMigration');

  if (!migrated) {
    const tfmDeal = await findOneTfmDeal(dealId);

    if (tfmDeal && tfmDeal.dealSnapshot && tfmDeal.dealSnapshot.facilities) {
      const dealHasId = tfmDeal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF
        ? !!tfmDeal.dealSnapshot.ukefDealId
        : !!tfmDeal.dealSnapshot.details.ukefDealId;

      const facilitiesHaveIds = tfmDeal.dealSnapshot.facilities.filter((f) => !f.facilitySnapshot.ukefFacilityId).length === 0;

      return { status: dealHasId && facilitiesHaveIds };
    }

    return { status: false, message: 'TFM Deal not found' };
  }
  // return `true` if the deal has been migrated
  return { status: false, message: 'Migrated deal' };
};

module.exports = dealHasAllUkefIds;
