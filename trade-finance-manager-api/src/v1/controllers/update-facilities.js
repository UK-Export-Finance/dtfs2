const api = require('../api');
const convertFacilityCurrency = require('./convert-facility-currency');
const getFacilityExposurePeriod = require('./get-facility-exposure-period');
const DEFAULTS = require('../defaults');
const getGuaranteeDates = require('../helpers/get-guarantee-dates');
const getFacilityPremiumSchedule = require('./get-facility-premium-schedule');
const { calculateGefFacilityFeeRecord } = require('../helpers/calculate-gef-facility-fee-record');
const CONSTANTS = require('../../constants');

const updateFacilities = async (deal) => {
  // Create deep clone
  const modifiedDeal = JSON.parse(JSON.stringify(deal));

  const {
    dealType,
    submissionDate: dealSubmissionDate,
    submissionType,
  } = modifiedDeal;

  modifiedDeal.facilities = await Promise.all(modifiedDeal.facilities.map(async (f) => {
    const facility = f;

    const {
      _id: facilityId,
      hasBeenIssued,
    } = facility;

    let facilityUpdate;
    let facilityPremiumSchedule;
    let feeRecord;

    /**
     * If facility hasBeenIssued
     * Check if gef or bss
     * Adds hasBeenIssuedAndAcknowledged and/or hasBeenAcknowledged parameter
     * Updates the facility collection with flags and tfm facilities collection
    */
    if (hasBeenIssued) {
      let portalFacilityUpdate;

      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
        portalFacilityUpdate = {
          hasBeenIssuedAndAcknowledged: true,
        };

        // updates GEF facility collection
        const updatedPortalFacility = await api.updateGefFacility(facilityId, portalFacilityUpdate);

        facility.hasBeenIssuedAndAcknowledged = updatedPortalFacility.hasBeenIssuedAndAcknowledged;
      } else {
        const facilityStatusUpdate = CONSTANTS.FACILITIES.FACILITY_STATUS_PORTAL.ACKNOWLEDGED;

        await api.updatePortalFacilityStatus(facilityId, facilityStatusUpdate);

        portalFacilityUpdate = {
          hasBeenIssuedAndAcknowledged: true,
          hasBeenAcknowledged: true,
        };

        // updates BSS facility collection
        const updatedPortalFacility = await api.updatePortalFacility(facilityId, portalFacilityUpdate);

        facility.hasBeenAcknowledged = updatedPortalFacility.hasBeenAcknowledged;
        facility.hasBeenIssuedAndAcknowledged = updatedPortalFacility.hasBeenIssuedAndAcknowledged;
        facility.status = facilityStatusUpdate;
      }

      facilityUpdate = {
        ...portalFacilityUpdate,
      };

      await api.updateFacility(facilityId, facilityUpdate);
    }

    const facilityGuaranteeDates = getGuaranteeDates(facility, dealSubmissionDate);
    const facilityCurrencyConversion = await convertFacilityCurrency(facility, dealSubmissionDate);
    const facilityExposurePeriod = await getFacilityExposurePeriod(facility);

    // Premium Schedule is only valid for non-GEF facilities
    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      facilityPremiumSchedule = await getFacilityPremiumSchedule(
        facility,
        facilityExposurePeriod,
        facilityGuaranteeDates,
      );
      facilityUpdate = {
        premiumSchedule: facilityPremiumSchedule,
      };
    } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      // Fee record is only valid for GEF facilities
      if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
        feeRecord = calculateGefFacilityFeeRecord(facility);
        facilityUpdate = {
          feeRecord,
        };
      }
    }

    facilityUpdate = {
      ...facilityUpdate,
      ...facilityCurrencyConversion,
      ...facilityExposurePeriod,
      facilityGuaranteeDates,
      riskProfile: DEFAULTS.FACILITY_RISK_PROFILE,
    };

    const updateFacilityResponse = await api.updateFacility(facilityId, facilityUpdate);

    // add the updated tfm object to returned facility.
    // if we return updateFacilityResponse, we'll get facilitySnapshot
    // - therefore losing the flat, generic facility mapping used in deal submission calls.
    facility.tfm = updateFacilityResponse.tfm;

    return facility;
  }));

  return modifiedDeal;
};

exports.updateFacilities = updateFacilities;
