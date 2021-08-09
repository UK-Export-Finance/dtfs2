const api = require('../api');
const convertFacilityCurrency = require('./convert-facility-currency');
const getFacilityExposurePeriod = require('./get-facility-exposure-period');
const DEFAULTS = require('../defaults');
const getFacilityPremiumSchedule = require('./get-facility-premium-schedule');
const getGuaranteeDates = require('../helpers/get-guarantee-dates');

const updateFacilities = async (deal) => {
  // Create deep clone
  const modifiedDeal = JSON.parse(JSON.stringify(deal));

  const {
    submissionDate: dealSubmissionDate,
  } = modifiedDeal;

  modifiedDeal.facilities = await Promise.all(modifiedDeal.facilities.map(async (f) => {
    const facility = f;

    const { _id: facilityId } = facility;

    const facilityGuaranteeDates = getGuaranteeDates(facility, dealSubmissionDate);

    const facilityCurrencyConversion = await convertFacilityCurrency(facility, dealSubmissionDate);
    const facilityExposurePeriod = await getFacilityExposurePeriod(facility);
    const facilityPremiumSchedule = await getFacilityPremiumSchedule(
      facility,
      facilityExposurePeriod,
      facilityGuaranteeDates,
    );

    // TODO
    // exposure period is not in unit test
    const facilityUpdate = {
      ...facilityCurrencyConversion,
      ...facilityExposurePeriod,
      facilityGuaranteeDates,
      riskProfile: DEFAULTS.FACILITY_RISK_PROFILE,
      premiumSchedule: facilityPremiumSchedule,
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
