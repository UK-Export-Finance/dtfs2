const api = require('../api');

const getFacilityPremiumSchedule = async (facility, facilityExposurePeriod) => {
  const premiumSchedule = await api.getPremiumSchedule(
    facility,
    facilityExposurePeriod,
  );
  return premiumSchedule;
};


module.exports = getFacilityPremiumSchedule;
