const api = require('../api');
const CONSTANTS = require('../../constants');
const getFacilityExposurePeriod = require('./get-facility-exposure-period');
const getFacilityPremiumSchedule = require('./get-facility-premium-schedule');
const getGuaranteeDates = require('../helpers/get-guarantee-dates');
const { sendIssuedFacilitiesReceivedEmail } = require('./send-issued-facilities-received-email');

const updatedIssuedFacilities = async (deal) => {
  // Create deep clone
  const modifiedDeal = JSON.parse(JSON.stringify(deal));

  const {
    submissionDate: dealSubmissionDate,
    facilities,
  } = deal;

  const updatedFacilities = [];

  modifiedDeal.facilities = facilities.map(async (facility) => {
    const {
      _id: facilityId,
      facilityStage,
      previousFacilityStage,
      hasBeenAcknowledged,
    } = facility;

    // we only need to update issued facilities if:
    // - a facility has changed from `Unissued` to `Issued` (`Conditional` to `Unconditional` for a loan)
    // - and the facility changing from `Unissued` to `Issued` has NOT been previously acknowledged

    const bondIsIssued = ((previousFacilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED)
      && (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED));

    const loanIsIssued = ((previousFacilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.CONDITIONAL)
      && (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL));

    const shouldUpdateFacility = ((bondIsIssued || loanIsIssued) && !hasBeenAcknowledged);

    if (shouldUpdateFacility) {
      // update portal facility status
      const facilityStatusUpdate = CONSTANTS.FACILITIES.FACILITY_STATUS_PORTAL.ACKNOWLEDGED;
      const updatedFacilityStatus = await api.updatePortalFacilityStatus(facilityId, facilityStatusUpdate);

      // add acknowledged flag, update Portal facility
      const portalFacilityUpdate = {
        hasBeenAcknowledged: true,
      };

      const updatedPortalFacility = await api.updatePortalFacility(facilityId, portalFacilityUpdate);

      // update TFM facility
      const facilityExposurePeriod = await getFacilityExposurePeriod(facility);

      const facilityGuaranteeDates = getGuaranteeDates(facility, dealSubmissionDate);

      const facilityPremiumSchedule = await getFacilityPremiumSchedule(
        facility,
        facilityExposurePeriod,
        facilityGuaranteeDates,
      );

      const facilityUpdate = {
        ...portalFacilityUpdate,
        ...facilityExposurePeriod,
        facilityGuaranteeDates,
        premiumSchedule: facilityPremiumSchedule,
      };

      await api.updateFacility(facilityId, facilityUpdate);

      // update object to return in response
      const updatedFacilityResponseObj = {
        ...updatedFacilityStatus,
        ...updatedPortalFacility,
        tfm: {
          ...facilityUpdate,
        },
      };

      updatedFacilities.push({
        ...facility,
        ...updatedFacilityResponseObj,
      });
    }
    return facility;
  });

  await Promise.all(modifiedDeal.facilities);

  await sendIssuedFacilitiesReceivedEmail(
    modifiedDeal,
    updatedFacilities,
  );

  return modifiedDeal;
};


exports.updatedIssuedFacilities = updatedIssuedFacilities;
