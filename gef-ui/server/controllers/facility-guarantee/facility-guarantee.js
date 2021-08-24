function validateFacilityGuarantee({
  feeType,
  dayCountBasis,
  inAdvanceFrequency,
  inArrearsFrequency,
}) {
  const facilityGuaranteeErrors = [];

  const feeTypeError = {
    errRef: 'feeType',
    errMsg: 'Select how your bank will pay the fee to UKEF',
  };
  const dayCountBasisError = {
    errRef: 'dayCountBasis',
    errMsg: 'Select a day count basis',
  };
  const frequencyError = {
    errRef: 'frequency',
    errMsg: 'Select how often your bank will pay the fee to UKEF',
  };
  if (!['in-advance', 'in-arrears', 'at-maturity'].includes(feeType)) {
    facilityGuaranteeErrors.push(feeTypeError);
  }
  if (!['360', '365'].includes(dayCountBasis)) {
    facilityGuaranteeErrors.push(dayCountBasisError);
  }
  if (['in-advance'].includes(feeType)
    && !['monthly', 'quarterly', 'semi-annually', 'annually'].includes(inAdvanceFrequency)) {
    facilityGuaranteeErrors.push(frequencyError);
  }
  if (['in-arrears'].includes(feeType)
    && !['monthly', 'quarterly', 'semi-annually', 'annually'].includes(inArrearsFrequency)) {
    facilityGuaranteeErrors.push(frequencyError);
  }
  return facilityGuaranteeErrors;
}

module.exports = validateFacilityGuarantee;
