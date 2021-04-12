const getFacilityValue = (facility) => {
  const { facilitySnapshot } = facility;

  if (facilitySnapshot.conversionRate) {
    return Number(facilitySnapshot.facilityValue) / Number(facilitySnapshot.conversionRate);
  }
  return Number(facilitySnapshot.facilityValue);
};

module.exports = getFacilityValue;
