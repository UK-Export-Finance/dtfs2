const { isCriteriaSet } = require('../../../../src/v1/controllers/integration/helpers/eligibility-criteria');

describe('checks status of eligiblity criteria', () => {
  const eligibilityFragment = {
    criteria: [
      {
        id: '11',
        answer: true,
      },
      {
        id: '12',
        answer: false,
      },
    ],
  };

  it('returns false if no eligibility criteria is set', () => {
    const criteriaSet = isCriteriaSet({}, '11');
    expect(criteriaSet).toEqual(false);
  });

  it('returns false if id doesn\'t exist', () => {
    const criteriaSet = isCriteriaSet(eligibilityFragment, '99');
    expect(criteriaSet).toEqual(false);
  });

  it('returns false if eligibility criteria not set', () => {
    const criteriaSet = isCriteriaSet(eligibilityFragment, '12');
    expect(criteriaSet).toEqual(false);
  });

  it('returns true if eligibility criteria is set', () => {
    const criteriaSet = isCriteriaSet(eligibilityFragment, '11');
    expect(criteriaSet).toEqual(true);
  });
});
