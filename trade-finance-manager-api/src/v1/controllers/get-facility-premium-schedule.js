const api = require('../api');
const mapPremiumScheduleFacility = require('../mappings/mapPremiumScheduleFacility');

const getFacilityPremiumSchedule = async (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  if (facility.hasBeenIssued && facilityExposurePeriod) {
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
