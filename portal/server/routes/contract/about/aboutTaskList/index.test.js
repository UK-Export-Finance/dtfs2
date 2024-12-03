import aboutTaskList from '.';

describe('aboutTaskList', () => {
  const mockCompletedForms = {
    supplierAndGuarantor: false,
    buyer: true,
    financialInformation: false,
  };

  it('should return an array of objects for each bond page/form', () => {
    const result = aboutTaskList(mockCompletedForms);

    expect(result).toEqual([
      {
        title: 'Supplier and counter-indemnifier/guarantor',
        completed: mockCompletedForms.supplierAndGuarantor,
        href: '/supplier',
      },
      {
        title: 'Buyer',
        completed: mockCompletedForms.buyer,
        href: '/buyer',
      },
      {
        title: 'Financial information',
        completed: mockCompletedForms.financialInformation,
        href: '/financial',
      },
    ]);
  });
});
