import bondTaskList from '.';

describe('bondTaskList', () => {
  const mockCompletedForms = {
    bondDetails: false,
    bondFinancialDetails: true,
    bondFeeDetails: false,
  };

  it('should return an array of objects for each bond page/form', () => {
    const result = bondTaskList(mockCompletedForms);

    expect(result).toEqual([
      {
        title: 'Bond details',
        completed: mockCompletedForms.bondDetails,
        href: '/details',
      },
      {
        title: 'Financial details',
        completed: mockCompletedForms.bondFinancialDetails,
        href: '/financial-details',
      },
      {
        title: 'Fee details',
        completed: mockCompletedForms.bondFeeDetails,
        href: '/fee-details',
      },
    ]);
  });
});
