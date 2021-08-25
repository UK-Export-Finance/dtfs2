import validateFacilityValue from './facility-value';

const interestErrorExpected = {
  errMsg: 'You can only enter a number between 0 and 100',
  errRef: 'interestPercentage',
};
const coverErrorExpected = {
  errMsg: 'You can only enter a number between 1 and 80',
  errRef: 'coverPercentage',
};

describe('facility-value when using save and return', () => {
  it('does not validate the interest or cover percentage when they are blank', () => {
    const errors = validateFacilityValue({
      interestPercentage: '',
      coverPercentage: '',
    }, true);
    expect(errors).toEqual([]);
  });

  it('validates the interest percentage is between 0 and 100 when it is present', () => {
    const errors = validateFacilityValue({
      interestPercentage: 101,
    }, true);
    expect(errors).toContainEqual(interestErrorExpected);
  });

  it('generates an error then the interest percentage is invalid', () => {
    const errors = validateFacilityValue({
      interestPercentage: 'error',
    }, true);
    expect(errors).toContainEqual(interestErrorExpected);
  });

  it('validates the interest percentage when it is present', () => {
    const errors = validateFacilityValue({
      interestPercentage: 100,
    }, true);
    expect(errors).toEqual([]);
  });

  it('validates the cover percentage is between 1 and 80 when it is present', () => {
    const errors = validateFacilityValue({
      coverPercentage: 101,
    }, true);
    expect(errors).toContainEqual(coverErrorExpected);
  });

  it('generates an error then the cover percentage is invalid', () => {
    const errors = validateFacilityValue({
      coverPercentage: 'error',
    }, true);
    expect(errors).toContainEqual(coverErrorExpected);
  });

  it('validates the cover percentage when it is present', () => {
    const errors = validateFacilityValue({
      coverPercentage: '80',
    }, true);
    expect(errors).toEqual([]);
  });
});

describe('facility-value when using continue', () => {
  it('validates the interest or cover percentage when they are blank', () => {
    const errors = validateFacilityValue({
      interestPercentage: '', // interest percentage can be blank - counts as zero?
      coverPercentage: '',
    });
    expect(errors).toContainEqual(coverErrorExpected);
    expect(errors).toContainEqual(interestErrorExpected);
  });

  it('validates the interest percentage is between 0 and 100 when it is present', () => {
    const errors = validateFacilityValue({
      interestPercentage: 101,
      coverPercentage: 50,
    });
    expect(errors).toContainEqual(interestErrorExpected);
  });

  it('generates an error then the interest percentage is invalid', () => {
    const errors = validateFacilityValue({
      interestPercentage: 'error',
      coverPercentage: 50,
    });
    expect(errors).toContainEqual(interestErrorExpected);
  });

  it('validates the cover and interest percentage', () => {
    const errors = validateFacilityValue({
      interestPercentage: 100,
      coverPercentage: 80,
    });
    expect(errors).toEqual([]);
  });

  it('validates the values are within the range', () => {
    const errors = validateFacilityValue({
      coverPercentage: 81,
      interestPercentage: 101,
    });
    expect(errors).toContainEqual(coverErrorExpected);
    expect(errors).toContainEqual(interestErrorExpected);
  });

  it('generates an error then the cover percentage is invalid', () => {
    const errors = validateFacilityValue({
      coverPercentage: 'error',
      interestPercentage: 99,
    });
    expect(errors).toContainEqual(coverErrorExpected);
  });
});
