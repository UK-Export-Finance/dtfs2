const mapBankFacilityReference = (facility) => {
  let mapped;

  // currently, we don't always have facilityType.
  // this is a hacky fallback/workaround for initial TFM development.
  // TODO: remove this once DTFS2-3054 is completed.

  // only loans have interestMarginFee
  const isLoan = facility.interestMarginFee;

  // only bonds have bondType
  const isBond = facility.bondType;


  if (isLoan && facility.bankReferenceNumber) {
    mapped = facility.bankReferenceNumber;
  }

  if (isBond && facility.uniqueIdentificationNumber) {
    mapped = facility.uniqueIdentificationNumber;
  }

  return mapped;
};

module.exports = mapBankFacilityReference;
