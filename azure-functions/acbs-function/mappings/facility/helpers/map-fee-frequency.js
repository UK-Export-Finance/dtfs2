/**
 * Maps free frequency across any product.
 * @param {object} facilitySnapshot Facility snapshot
 * @returns {string} Fee frequency else `null`
 */
const mapFeeFrequency = (facilitySnapshot) => {
  if (facilitySnapshot.frequency) {
    return facilitySnapshot.frequency;
  }

  if (facilitySnapshot.feeFrequency) {
    return facilitySnapshot.feeFrequency;
  }

  if (facilitySnapshot.premiumFrequency) {
    return facilitySnapshot.premiumFrequency;
  }

  return null;
};

module.exports = mapFeeFrequency;
