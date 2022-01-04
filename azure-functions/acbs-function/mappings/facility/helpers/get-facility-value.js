const getFacilityValue = (facility, currency) => {
  if (facility.facilitySnapshot.conversionRate && currency !== '') {
    return Number(facility.facilitySnapshot.value) / Number(facility.facilitySnapshot.conversionRate);
  }

  if (facility.tfm.facilityValueInGBP && currency !== '') {
    return facility.tfm.facilityValueInGBP;
  }

  return Number(facility.facilitySnapshot.value);
};

module.exports = getFacilityValue;
