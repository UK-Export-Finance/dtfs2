const mapFeeFrequency = (facilitySnapshot) => {
  let feeFrequency;

  if (facilitySnapshot.frequency) {
    feeFrequency = facilitySnapshot.frequency;
  }

  if (facilitySnapshot.feeFrequency) {
    feeFrequency = facilitySnapshot.feeFrequency;
  }

  if (facilitySnapshot.premiumFrequency) {
    feeFrequency = facilitySnapshot.premiumFrequency;
  }

  return feeFrequency;
};

module.exports = mapFeeFrequency;
