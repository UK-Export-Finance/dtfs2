const api = require('../api');
const mapPremiumScheduleFacility = require('../mappings/mapPremiumScheduleFacility');
const isIssued = require('../helpers/is-issued');

const getFacilityPremiumSchedule = async (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  if (isIssued(facility) && facilityExposurePeriod) {
    const parameters = mapPremiumScheduleFacility(
      facility,
      facilityExposurePeriod,
      facilityGuaranteeDates,
    );

    const premiumSchedule = await api.getPremiumSchedule(
      parameters,
    );
    if (premiumSchedule) {
      return premiumSchedule;
    }
  }

  return null;
};

module.exports = getFacilityPremiumSchedule;
