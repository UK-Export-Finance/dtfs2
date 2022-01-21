const api = require('../api');
const CONSTANTS = require('../../constants');
const getFacilityExposurePeriod = require('./get-facility-exposure-period');
const getGuaranteeDates = require('../helpers/get-guarantee-dates');
const getFacilityPremiumSchedule = require('./get-facility-premium-schedule');
const { calculateGefFacilityFeeRecord } = require('../helpers/calculate-gef-facility-fee-record');
const { sendIssuedFacilitiesReceivedEmail } = require('./send-issued-facilities-received-email');

const updatedIssuedFacilities = async (deal) => {
  // Create deep clone
  const modifiedDeal = JSON.parse(JSON.stringify(deal));

  const {
    dealType,
    submissionDate: dealSubmissionDate,
    submissionType,
    maker,
  } = deal;

  const updatedFacilities = [];

  modifiedDeal.facilities = await Promise.all(modifiedDeal.facilities.map(async (f) => {
    const facility = f;

    const {
      _id: facilityId,
      hasBeenIssued,
      hasBeenAcknowledged,
    } = facility;

    // `hasBeenAcknowledged` is BSS/EWCS specific only
    const shouldUpdateFacility = dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF
      ? hasBeenIssued
      : (hasBeenIssued && !hasBeenAcknowledged);

    if (shouldUpdateFacility) {
      let facilityPremiumSchedule;
      let feeRecord;
      let facilityUpdate;

      // update portal facility status
      const facilityStatusUpdate = CONSTANTS.FACILITIES.FACILITY_STATUS_PORTAL.ACKNOWLEDGED;

      // Add `hasBeenAcknowledged` flag to BSS/EWCS facility
      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
        await api.updatePortalFacilityStatus(facilityId, facilityStatusUpdate);

        const portalFacilityUpdate = {
          hasBeenAcknowledged: true,
        };

        const updatedPortalFacility = await api.updatePortalFacility(facilityId, portalFacilityUpdate);
        facility.hasBeenAcknowledged = updatedPortalFacility.hasBeenAcknowledged;
        facility.status = facilityStatusUpdate;
        facilityUpdate = {
          ...portalFacilityUpdate,
        };
      }

      // update TFM facility
      const facilityExposurePeriod = await getFacilityExposurePeriod(facility);
      const facilityGuaranteeDates = getGuaranteeDates(facility, dealSubmissionDate);

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
        ...facilityExposurePeriod,
        facilityGuaranteeDates,
      };

      /**
       * Add the updated properties to the returned facility
       * to retain flat, generic facility mapping used in deal submission calls.
       * */
      const updateFacilityResponse = await api.updateFacility(facilityId, facilityUpdate);
      facility.tfm = updateFacilityResponse.tfm;
      updatedFacilities.push(facility);
    }

    return facility;
  }));

  await sendIssuedFacilitiesReceivedEmail(
    modifiedDeal,
    updatedFacilities,
    maker,
  );

  return modifiedDeal;
};

exports.updatedIssuedFacilities = updatedIssuedFacilities;
