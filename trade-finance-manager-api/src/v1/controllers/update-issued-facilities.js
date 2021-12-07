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
  } = deal;

  const updatedFacilities = [];

  modifiedDeal.facilities = await Promise.all(modifiedDeal.facilities.map(async (f) => {
    const facility = f;

    const {
      _id: facilityId,
      hasBeenIssued,
      hasBeenAcknowledged,
    } = facility;

    const shouldUpdateFacility = (hasBeenIssued && !hasBeenAcknowledged);

    if (shouldUpdateFacility) {
      // update portal facility status
      const facilityStatusUpdate = CONSTANTS.FACILITIES.FACILITY_STATUS_PORTAL.ACKNOWLEDGED;
      await api.updatePortalFacilityStatus(facilityId, facilityStatusUpdate);

      // add acknowledged flag to Portal facility
      const portalFacilityUpdate = {
        hasBeenAcknowledged: true,
      };

      const updatedPortalFacility = await api.updatePortalFacility(facilityId, portalFacilityUpdate);

      // update TFM facility
      const facilityExposurePeriod = await getFacilityExposurePeriod(facility);

      const facilityGuaranteeDates = getGuaranteeDates(facility, dealSubmissionDate);

      let facilityPremiumSchedule;
      if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
        facilityPremiumSchedule = await getFacilityPremiumSchedule(
          facility,
          facilityExposurePeriod,
          facilityGuaranteeDates,
        );
      }

      let feeRecord;

      const shouldCalculateFeeRecord = (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF
        && submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);

      if (shouldCalculateFeeRecord) {
        feeRecord = calculateGefFacilityFeeRecord(facility);
      }

      const facilityUpdate = {
        ...portalFacilityUpdate,
        ...facilityExposurePeriod,
        facilityGuaranteeDates,
        premiumSchedule: facilityPremiumSchedule,
        feeRecord,
      };

      const updateFacilityResponse = await api.updateFacility(facilityId, facilityUpdate);

      // add the updated properties to the returned facility
      // to retain flat, generic facility mapping used in deal submission calls.
      facility.hasBeenAcknowledged = updatedPortalFacility.hasBeenAcknowledged;
      facility.status = facilityStatusUpdate;
      facility.tfm = updateFacilityResponse.tfm;

      updatedFacilities.push(facility);
    }

    return facility;
  }));

  await sendIssuedFacilitiesReceivedEmail(
    modifiedDeal,
    updatedFacilities,
  );

  return modifiedDeal;
};

exports.updatedIssuedFacilities = updatedIssuedFacilities;
