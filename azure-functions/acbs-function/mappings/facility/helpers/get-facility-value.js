const getFacilityValue = (facility) => {
  const facilitySnapshot = facility;

  if (facilitySnapshot.conversionRate !== undefined) {
    return Number(facilitySnapshot.facilityValue) / Number(facilitySnapshot.conversionRate);
  }
  return facilitySnapshot.facilityValue ? Number(facilitySnapshot.facilityValue) : Number(facilitySnapshot.value);
};

module.exports = getFacilityValue;
