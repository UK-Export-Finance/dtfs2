const isIssued = require('./is-issued');

const hasFacilityBeenIssued = (facility) => {
  // GEF
  if (facility.facilitySnapshot.hasBeenIssued) {
    return facility.facilitySnapshot.hasBeenIssued;
  }
  // BSS/EWCS
  if (facility.facilitySnapshot.facilityStage) {
    return isIssued(facility.facilitySnapshot.facilityStage);
  }

  return false;
};

module.exports = hasFacilityBeenIssued;
