/**
 * Maps facility type across all the products
 * @param {Object} facilitySnapshot Facility snapshot
 * @returns {String} Facility type else `null`
 */
const mapFeeType = (facilitySnapshot) => {
  if (facilitySnapshot.feeType) {
    return facilitySnapshot.feeType;
  }

  if (facilitySnapshot.premiumType) {
    return facilitySnapshot.premiumType;
}

  return null;
};

module.exports = mapFeeType;
