// const api = require('../api');

const facilityIsIssued = (facilityStage) => (facilityStage === 'Issued' || facilityStage === 'Unconditional');

const getFacilityPremiumSchedule = async (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  console.log(facilityGuaranteeDates);
  const isIssued = facilityIsIssued(facility.facilityStage);
  if (isIssued && facilityExposurePeriod) {
    const premiumSchedule = null;
    // const premiumSchedule = await api.getPremiumSchedule(
    //   facility,
    //   facilityExposurePeriod,
    //   facilityGuaranteeDates,
    // );
    if (premiumSchedule) {
      return premiumSchedule;
    }
  }

  return null;
};

module.exports = getFacilityPremiumSchedule;
