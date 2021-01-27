const mapBankFacilityReference = (facility) => {
  let mapped;

  // currently, we don't always have facilityType.
  // this is a hacky fallback/workaround for initial TFM development.
  // TODO: remove this once DTFS2-3054 is completed.
  if (facility.bondType) {
    // only bonds have `bondType`
    mapped = facility.bankReferenceNumber;
  }
  if (facility.interestMarginFee) {
    // only loans have `interestMarginFee`
    mapped = facility.uniqueIdentificationNumber;
  }

  return mapped;
};

module.exports = mapBankFacilityReference;
