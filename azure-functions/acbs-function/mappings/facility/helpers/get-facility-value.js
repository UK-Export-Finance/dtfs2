const getFacilityValue = (facility) => {
  if (facility.facilitySnapshot.conversionRate) {
    return Number(facility.facilitySnapshot.facilityValue) / Number(facility.facilitySnapshot.conversionRate);
  }

  if (facility.tfm.facilityValueInGBP) {
    return facility.tfm.facilityValueInGBP;
  }

  return facility.facilitySnapshot.facilityValue
    ? Number(facility.facilitySnapshot.facilityValue)
    : Number(facility.facilitySnapshot.value);
};

module.exports = getFacilityValue;
