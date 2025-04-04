export const mandatoryCriteria = {
  _id: '623f30f08b2712001f99f2c0',
  version: 35,
  criteria: [
    {
      id: 1,
      title: 'Supply contract/Transaction',
      items: [
        {
          id: 1,
          copy: 'The Supplier has provided the Bank with a duly completed Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate.',
        },
        {
          id: 2,
          copy: 'The Bank has complied with its policies and procedures in relation to the Transaction.',
        },
        {
          id: 3,
          copy: 'Where the Supplier is a UK Supplier, the Supplier has provided the Bank with a duly completed UK Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate. (Conditional for UK Supplier)',
        },
      ],
    },
    {
      id: 2,
      title: 'Financial',
      items: [
        {
          id: 4,
          copy: 'Where the supplier is not a “Person Within Scope of Windsor Framework”, it is an <a href="/assets/files/financial_difficulty_model_1.1.0.xlsx" class="govuk-link">eligible person</a> OR',
        },
        {
          id: 5,
          copy: 'Where the supplier is a “Person Within Scope of Windsor Framework”, both it and its parent obligor (if any) is an <a href="/assets/files/financial_difficulty_model_1.1.0.xlsx" class="govuk-link">eligible person</a>.',
        },
      ],
    },
    {
      id: 3,
      title: 'Credit',
      items: [
        {
          id: 6,
          copy: 'The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one-year probability of default of less than 14.1%.',
        },
      ],
    },
    {
      id: 4,
      title: 'Bank Facility Letter',
      items: [
        {
          id: 7,
          copy: 'The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland.',
        },
      ],
    },
    {
      id: 5,
      title: 'Legal',
      items: [
        {
          id: 8,
          copy: 'The Bank is the sole and beneficial owner of, and has legal title to, the Transaction.',
        },
        {
          id: 9,
          copy: 'The Bank has not made a Disposal (other than a Permitted Disposal) or a Risk Transfer (other than a Permitted Risk Transfer) in relation to the Transaction.',
        },
        {
          id: 10,
          copy: 'The Bank’s right, title and interest in relation to the Transaction is clear of any Security and Quasi-Security (other than Permitted Security) and is freely assignable without the need to obtain consent of any Obligor or any other person.',
        },
        {
          id: 11,
          copy: 'The Bank is not restricted or prevented by any agreement with an Obligor from providing information and records relating to the Transaction.',
        },
      ],
    },
  ],
};
