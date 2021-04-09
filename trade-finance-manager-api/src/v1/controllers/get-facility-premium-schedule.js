const api = require('../api');

const facilityIsIssued = (facilityStage) => (facilityStage === 'Issued' || facilityStage === 'Unconditional');

const getFacilityPremiumSchedule = async (facility, facilityExposurePeriod) => {
  if (facilityIsIssued(facility.facilityStage) && facilityExposurePeriod) {
    const premiumSchedule = await api.getPremiumSchedule(
      facility,
      facilityExposurePeriod,
    );
    return premiumSchedule;
  }
  return null;
};


module.exports = getFacilityPremiumSchedule;
