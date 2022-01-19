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
  const inArrearsFrequencyError = {
    errRef: 'inArrearsFrequency',
    errMsg: 'Select how often your bank will pay the fee to UKEF',
  };
  const inAdvanceFrequencyError = {
    errRef: 'inAdvanceFrequency',
    errMsg: 'Select how often your bank will pay the fee to UKEF',
  };

  if (!['In advance', 'In arrears', 'At maturity'].includes(feeType)) {
    facilityGuaranteeErrors.push(feeTypeError);
  }
  const FREQUENCIES = ['Monthly', 'Quarterly', 'Semi-annually', 'Annually'];
  if (['In advance'].includes(feeType)
    && !FREQUENCIES.includes(inAdvanceFrequency)) {
    facilityGuaranteeErrors.push(inAdvanceFrequencyError);
  }
  if (['In arrears'].includes(feeType)
    && !FREQUENCIES.includes(inArrearsFrequency)) {
    facilityGuaranteeErrors.push(inArrearsFrequencyError);
  }
  if (!['360', '365'].includes(dayCountBasis)) {
    facilityGuaranteeErrors.push(dayCountBasisError);
  }
  return facilityGuaranteeErrors;
}

module.exports = validateFacilityGuarantee;
