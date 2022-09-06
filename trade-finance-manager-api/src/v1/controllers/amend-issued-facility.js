const api = require('../api');
const CONSTANTS = require('../../constants');
const getGuaranteeDates = require('../helpers/get-guarantee-dates');
const getFacilityPremiumSchedule = require('./get-facility-premium-schedule');
const { calculateGefFacilityFeeRecord } = require('../helpers/calculate-gef-facility-fee-record');
const { mapCashContingentFacility } = require('../mappings/map-submitted-deal/map-cash-contingent-facility');
const { mapBssEwcsFacility } = require('../mappings/map-submitted-deal/map-bss-ewcs-facility');

/**
 * Amend TFM properties of issued facility.
 * 1. Guarantee dates (tfm.facilityGuaranteeDates)
 * 2. Premium Schedule (BSS/EWCS) / Fixed Fee (GEF) (tfm.premiumSchedule / tfm.feeRecord)
 * 3. Exposure period (tfm.exposurePeriodInMonths)
 * 4. UKEF Exposure (tfm.ukefExposure / tfm.ukefExposureCalculationTimestamp)
 * @param {Object} amendment Amendment object
 * @param {Object} facility Facility object
 * @param {Object} deal TFM deal object
 * @returns {Boolean} Boolean upon execution
 */
const amendIssuedFacility = async (amendment, facility, deal) => {
  try {
    if (amendment && facility && deal) {
      const {
        changeCoverEndDate,
        changeFacilityValue,
        coverEndDate,
        value,
        tfm: amendmentTfm,
      } = amendment;
      const { dealType, submissionDate } = deal.dealSnapshot;
      const { facilitySnapshot, tfm } = facility;
      let facilityPremiumSchedule;
      let feeRecord;
      let facilityTfmUpdate;
      let amendedFacility = {
        ...facility,
        ...facilitySnapshot,
      };

      // Delete frivolous properties
      delete amendedFacility.facilitySnapshot;
      delete amendedFacility.amendments;

      // Amend `facility` and `facility.tfm`
      if (amendmentTfm) {
        // Set pre-calculated amendment TFM properties (facility.tfm)
        const { amendmentExposurePeriodInMonths, exposure } = amendmentTfm;

        facilityTfmUpdate = {
          ...tfm,
          exposurePeriodInMonths: amendmentExposurePeriodInMonths,
          ukefExposure: exposure.ukefExposureValue,
          ukefExposureCalculationTimestamp: String(exposure.timestamp),
        };

        /**
         * Amend facility object (stored in a temporary variable)
         * `facility` (amendedFacility) parent object is not updated in the DB,
         * however `facility.tfm` (facilityTfmUpdate) child object is updated in the DB.
         */

        // Facility value
        if (changeFacilityValue) {
          amendedFacility = {
            ...amendedFacility,
            ukefExposure: exposure.ukefExposureValue,
            value,
          };
        }

        // Facility cover end date
        if (changeCoverEndDate) {
          amendedFacility = {
            ...amendedFacility,
            // Convert non ms-EPOCH to ms-EPOCH
            coverEndDate: new Date(coverEndDate * 1000),
          };
        }

        // Map facility
        if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
          amendedFacility = mapBssEwcsFacility(amendedFacility);
        } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
          amendedFacility = mapCashContingentFacility(amendedFacility);
        }

        // facility.tfm.facilityGuaranteeDates
        const facilityGuaranteeDates = getGuaranteeDates(amendedFacility, submissionDate);
        facilityTfmUpdate = {
          ...facilityTfmUpdate,
          facilityGuaranteeDates,
        };

        // facility.tfm.feeRecord or facility.tfm.premiumSchedule
        if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
          facilityPremiumSchedule = await getFacilityPremiumSchedule(
            amendedFacility,
            exposure.ukefExposureValue,
            facilityGuaranteeDates,
          );

          facilityTfmUpdate = {
            ...facilityTfmUpdate,
            premiumSchedule: facilityPremiumSchedule,
          };
        } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
          feeRecord = calculateGefFacilityFeeRecord(amendedFacility);
          facilityTfmUpdate = {
            ...facilityTfmUpdate,
            feeRecord,
          };
        }

        // Updated `facility.tfm` property
        await api.updateFacility(facility._id, facilityTfmUpdate);
      }

      return true;
    }

    throw new Error('Amend issued facility - Void argument sets provided');
  } catch (e) {
    console.error('Error amending issued facility TFM properties: ', { e });
    return false;
  }
};

module.exports = {
  amendIssuedFacility,
};
