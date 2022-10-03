const api = require('../api');
const mapPremiumScheduleFacility = require('../mappings/premium-schedule');

const getFacilityPremiumSchedule = async (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  const issued = facility.hasBeenIssued ?? facility.facilitySnapshot.hasBeenIssued;
  if (issued && facilityExposurePeriod) {
    const scheduleObj = mapPremiumScheduleFacility(
      facility,
      facilityExposurePeriod ?? facilityExposurePeriod.exposurePeriodInMonths,
      facilityGuaranteeDates,
    );

    if (scheduleObj) {
      const premiumSchedule = await api.getPremiumSchedule(
        scheduleObj,
      );

      if (premiumSchedule) {
        return premiumSchedule;
      }
    }
  }

  return null;
};

module.exports = getFacilityPremiumSchedule;
