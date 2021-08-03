import eligibilityTaskList from '.';

describe('eligibilityTaskList', () => {
  const mockCompletedForms = {
    eligibilityCriteria: false,
    supportingDocumentation: true,
  };

  it('should return an array of objects for each eligibility page/form', () => {
    const result = eligibilityTaskList(mockCompletedForms);

    expect(result).toEqual([
      {
        title: 'Eligibility criteria',
        completed: mockCompletedForms.eligibilityCriteria,
        href: '/criteria',
      },
      {
        title: 'Supporting documentation',
        completed: mockCompletedForms.supportingDocumentation,
        href: '/supporting-documentation',
      },
    ]);
  });
});
