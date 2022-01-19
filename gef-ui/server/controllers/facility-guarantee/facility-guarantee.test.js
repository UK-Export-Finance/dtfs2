import validateFacilityGuarantee from './facility-guarantee';

const feeTypeErrorExpected = {
  errRef: 'feeType',
  errMsg: 'Select how your bank will pay the fee to UKEF',
};
const dayCountBasisErrorExpected = {
  errRef: 'dayCountBasis',
  errMsg: 'Select a day count basis',
};
const inAdvanceFrequencyErrorExpected = {
  errRef: 'inAdvanceFrequency',
  errMsg: 'Select how often your bank will pay the fee to UKEF',
};

const inArrearsFrequencyErrorExpected = {
  errRef: 'inArrearsFrequency',
  errMsg: 'Select how often your bank will pay the fee to UKEF',
};

describe('facility-guarantee', () => {
  it('validates all selections must be completed', () => {
    const errors = validateFacilityGuarantee({
      feeType: '', // advance/arrears/maturity
      dayCountBasis: '',
      inAdvanceFrequency: '',
      inArrearsFrequency: '',
    });
    expect(errors).toContainEqual(feeTypeErrorExpected);
    expect(errors).toContainEqual(dayCountBasisErrorExpected);
    expect(errors).not.toContainEqual(inArrearsFrequencyErrorExpected);
    expect(errors).not.toContainEqual(inAdvanceFrequencyErrorExpected);
  });

  it('validates frequency when fee type is In advance', () => {
    const errors = validateFacilityGuarantee({
      feeType: 'In advance', // advance/arrears/maturity
      dayCountBasis: '',
      inAdvanceFrequency: '',
    });
    expect(errors).toContainEqual(dayCountBasisErrorExpected);
    expect(errors).toContainEqual(inAdvanceFrequencyErrorExpected);
  });

  it('validates frequency when fee type is In arrears', () => {
    const errors = validateFacilityGuarantee({
      feeType: 'In arrears', // advance/arrears/maturity
      dayCountBasis: '',
      inArrearsFrequency: '',
    });
    expect(errors).toContainEqual(dayCountBasisErrorExpected);
    expect(errors).toContainEqual(inArrearsFrequencyErrorExpected);
  });

  it('validates frequency when completed', () => {
    const errors = validateFacilityGuarantee({
      feeType: 'In advance', // advance/arrears/maturity
      inAdvanceFrequency: 'Monthly',
      dayCountBasis: '',
    });
    expect(errors).toContainEqual(dayCountBasisErrorExpected);
  });

  it('validates day count basis', () => {
    const errors = validateFacilityGuarantee({
      feeType: 'In advance', // advance/arrears/maturity
      dayCountBasis: '360',
      inAdvanceFrequency: 'Monthly',
    });
    expect(errors).toEqual([]);
  });

  it('does not validate frequency when at maturity', () => {
    const errors = validateFacilityGuarantee({
      feeType: 'At maturity', // advance/arrears/maturity
      dayCountBasis: '360',
    });
    expect(errors).toEqual([]);
  });
});
