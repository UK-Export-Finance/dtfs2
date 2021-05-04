const api = require('../api');
const mapPremiumScheduleFacility = require('../mappings/mapPremiumScheduleFacility');

const facilityIsIssued = (facilityStage) => (facilityStage === 'Issued' || facilityStage === 'Unconditional');

const getFacilityPremiumSchedule = async (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  const isIssued = facilityIsIssued(facility.facilityStage);
  if (isIssued && facilityExposurePeriod) {
    const parameters = mapPremiumScheduleFacility(facility, facilityExposurePeriod, facilityGuaranteeDates);
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
