/**
 * Maps free frequency across any product.
 * @param {Object} facilitySnapshot Facility snapshot
 * @returns {String} Fee frequency else `null`
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
