const api = require('../api');

const facilityIsIssued = (facilityStage) => (facilityStage === 'Issued' || facilityStage === 'Unconditional');

const getFacilityPremiumSchedule = async (facility, facilityExposurePeriod) => {
  const isIssued = facilityIsIssued(facility.facilityStage);
  if (isIssued && facilityExposurePeriod) {
    const premiumSchedule = await api.getPremiumSchedule(
      facility,
      facilityExposurePeriod,
    );
    return premiumSchedule;
  }
  console.log('get-facility-premium-schedule. No premium schedule returned');
  return null;
};

module.exports = getFacilityPremiumSchedule;
