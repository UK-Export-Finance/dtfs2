const getFacilityValue = (facility, currency) => {
  if (facility.facilitySnapshot.conversionRate && currency) {
    return Number(facility.facilitySnapshot.facilityValue) / Number(facility.facilitySnapshot.conversionRate);
  }

  if (facility.tfm.facilityValueInGBP && currency) {
    return facility.tfm.facilityValueInGBP;
  }

  return facility.facilitySnapshot.facilityValue
    ? Number(facility.facilitySnapshot.facilityValue)
    : Number(facility.facilitySnapshot.value);
};

module.exports = getFacilityValue;
