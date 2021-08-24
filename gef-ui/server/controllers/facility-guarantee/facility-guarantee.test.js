import validateFacilityGuarantee from './facility-guarantee';

const feeTypeErrorExpected = {
  errRef: 'feeType',
  errMsg: 'Select how your bank will pay the fee to UKEF',
};
const dayCountBasisErrorExpected = {
  errRef: 'dayCountBasis',
  errMsg: 'Select a day count basis',
};
const frequencyErrorExpected = {
  errRef: 'frequency',
  errMsg: 'Select how often your bank will pay the fee to UKEF',
};

describe('facility-guarantee', () => {
  it('validates all selections must be made', () => {
    const errors = validateFacilityGuarantee({
      feeType: '', // advance/arrears/maturity
      dayCountBasis: '',
      inAdvanceFrequency: '',
      inArrearsFrequency: '',
    });
    expect(errors).toContainEqual(feeTypeErrorExpected);
    expect(errors).toContainEqual(dayCountBasisErrorExpected);
    expect(errors).not.toContainEqual(frequencyErrorExpected);
  });

  it('validates how to pay fee', () => {
    const errors = validateFacilityGuarantee({
      feeType: 'in-advance', // advance/arrears/maturity
      dayCountBasis: '',
      inAdvanceFrequency: '',
    });
    expect(errors).toContainEqual(dayCountBasisErrorExpected);
    expect(errors).toContainEqual(frequencyErrorExpected);
  });

  it('validates how often', () => {
    const errors = validateFacilityGuarantee({
      feeType: '', // advance/arrears/maturity
      dayCountBasis: '',
    });
    expect(errors).toContainEqual(feeTypeErrorExpected);
    expect(errors).toContainEqual(dayCountBasisErrorExpected);
  });

  it('validates day count basis', () => {
    const errors = validateFacilityGuarantee({
      feeType: 'in-advance', // advance/arrears/maturity
      dayCountBasis: '360',
      inAdvanceFrequency: 'monthly',
    });
    expect(errors).toEqual([]);
  });

  it('validates day count basis', () => {
    const errors = validateFacilityGuarantee({
      feeType: 'in-advance', // advance/arrears/maturity
      dayCountBasis: '360',
    });
    expect(errors).toContainEqual(frequencyErrorExpected);
  });
});
