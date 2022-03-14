const getFacilityValue = (facility) => {
  if (facility.facilitySnapshot.conversionRate) {
    return Number(facility.facilitySnapshot.value) / Number(facility.facilitySnapshot.conversionRate);
  }

  if (facility.tfm.valueInGBP) {
    return facility.tfm.valueInGBP;
  }

  return Number(facility.facilitySnapshot.value);
};

module.exports = getFacilityValue;
