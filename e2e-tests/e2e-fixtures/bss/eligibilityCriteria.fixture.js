export const ELIGIBILITY_COMPLETED = {
  status: 'Completed',
  version: 5,
  dealType: 'BSS/EWCS',
  criteria: [
    {
      id: 11,
      description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
      answer: true,
    },
    {
      id: 12,
      description: 'The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.',
      answer: true,
    },
    {
      id: 13,
      description: 'The total UKEF exposure, across all short-term schemes (including bond support, export working capital and general export facility transactions), for this Obligor (including this Transaction) does not exceed £5 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).',
      answer: true,
    },
    {
      id: 14,
      description: 'For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.',
      answer: true,
    },
    {
      id: 15,
      description: 'The Requested Cover Start Date is no more than three months from the date of submission.',
      answer: true,
    },
    {
      id: 16,
      description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco, gambling, coal, oil, gas or fossil fuel energy and the Bank is not aware that any of the information contained within it is inaccurate.',
      answer: true,
    },
    {
      id: 17,
      description: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.',
      answer: true,
    },
    {
      id: 18,
      description: 'The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.',
      answer: true,
    },
  ],
};
