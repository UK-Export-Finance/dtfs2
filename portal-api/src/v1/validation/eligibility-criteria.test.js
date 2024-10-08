const { getEligibilityStatus } = require('./eligibility-criteria');

describe('validation - eligibility criteria', () => {
  it('should return "Completed" status if all EC completed and no validation errors', () => {
    expect(
      getEligibilityStatus({
        criteriaComplete: true,
        ecErrorCount: 0,
        dealFilesErrorCount: 0,
      }),
    ).toEqual('Completed');
  });

  it('should return "Incomplete" status if not all EC completed and no validation errors', () => {
    expect(
      getEligibilityStatus({
        criteriaComplete: false,
        ecErrorCount: 0,
        dealFilesErrorCount: 0,
      }),
    ).toEqual('Incomplete');

    expect(
      getEligibilityStatus({
        criteriaComplete: true,
        ecErrorCount: 1,
        dealFilesErrorCount: 0,
      }),
    ).toEqual('Incomplete');

    expect(
      getEligibilityStatus({
        criteriaComplete: true,
        ecErrorCount: 0,
        dealFilesErrorCount: 1,
      }),
    ).toEqual('Incomplete');
  });
});
