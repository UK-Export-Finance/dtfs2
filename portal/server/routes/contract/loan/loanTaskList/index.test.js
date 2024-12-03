import loanTaskList from '.';

describe('loanTaskList', () => {
  const mockCompletedForms = {
    loanGuaranteeDetails: false,
    loanFinancialDetails: true,
    loanDatesRepayments: false,
  };

  it('should return an array of objects for each loan page/form', () => {
    const result = loanTaskList(mockCompletedForms);

    expect(result).toEqual([
      {
        title: 'Loan guarantee details',
        completed: mockCompletedForms.loanGuaranteeDetails,
        href: '/guarantee-details',
      },
      {
        title: 'Loan financial details',
        completed: mockCompletedForms.loanFinancialDetails,
        href: '/financial-details',
      },
      {
        title: 'Dates and repayments',
        completed: mockCompletedForms.loanDatesRepayments,
        href: '/dates-repayments',
      },
    ]);
  });
});
