const getFacilityValue = (facility) => {
  if (facility.facilitySnapshot.conversionRate) {
    return Number(facility.facilitySnapshot.value) / Number(facility.facilitySnapshot.conversionRate);
  }

  if (facility.tfm.facilityValueInGBP) {
    return facility.tfm.facilityValueInGBP;
  }

  return Number(facility.facilitySnapshot.value);
};

module.exports = getFacilityValue;
