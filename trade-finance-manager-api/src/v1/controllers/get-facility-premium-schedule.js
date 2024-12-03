const api = require('../api');
const mapPremiumScheduleFacility = require('../mappings/premium-schedule');

const getFacilityPremiumSchedule = async (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  if (facility.hasBeenIssued && facilityExposurePeriod) {
    const scheduleObj = mapPremiumScheduleFacility(facility, facilityExposurePeriod.exposurePeriodInMonths, facilityGuaranteeDates);

    if (scheduleObj) {
      const premiumSchedule = await api.getPremiumSchedule(scheduleObj);

      if (premiumSchedule) {
        return premiumSchedule;
      }
    }
  }

  return null;
};

module.exports = getFacilityPremiumSchedule;
