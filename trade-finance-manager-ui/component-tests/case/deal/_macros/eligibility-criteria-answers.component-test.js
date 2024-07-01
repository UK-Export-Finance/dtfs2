const { componentRenderer } = require('../../../componentRenderer');

const component = '../templates/case/deal/_macros/eligibility-criteria-answers.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    eligibilityCriteria: [
      {
        id: 11,
        text: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
        textList: ['11 test', '11 testing'],
        answer: true,
      },
      {
        id: 12,
        text: 'The period between the Cover Start Date and the Cover End Date does not exceed: for a Bond, the Bond Maximum Cover Period; and for a Loan, the Loan Maximum Cover Period.',
        answer: true,
        textList: ['12 test', '12 testing'],
      },
      {
        id: 13,
        text: 'The Covered Bank Exposure under the Transaction (converted (as at the date this representation is made) for this purpose into the Base Currency) is not more than the lesser of: the Available Facility; and the Available Obligor Covered Exposure Limit.',
        answer: true,
        textList: [],
      },
      {
        id: 14,
        text: 'For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.',
        answer: true,
        textList: ['14 test', '14 testing'],
      },
      {
        id: 15,
        text: 'The Requested Cover Start Date is no more than three months from the date of submission.',
        answer: true,
        textList: [],
      },
      {
        id: 16,
        text: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco, gambling, coal, oil, gas or fossil fuel energy and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: true,
        textList: ['16 test', '16 testing'],
      },
      {
        id: 17,
        text: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.',
        answer: true,
        textList: [],
      },
      {
        id: 18,
        text: "Any applicable fees, interest rate and/or Risk Margin Fee apply to the whole Cover Period of the Covered Transaction, and have been set in accordance with the Bank's normal pricing policies and include, if any, overall pricing requirements notified by UKEF.",
        answer: true,
        textList: ['18 test', '18 testing'],
      },
    ],
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render a heading, answer tag, text for each criterion', () => {
    params.eligibilityCriteria.forEach((criterion) => {
      const criterionIdSelector = `criterion-${criterion.id}`;
      wrapper.expectText(`[data-cy="${criterionIdSelector}-heading"]`).toRead(`EC${criterion.id}`);

      wrapper.expectElement('[data-cy="eligibility-criteria-answer-tag"]').toExist();

      wrapper.expectText(`[data-cy="${criterionIdSelector}-text"]`).toRead(criterion.text);
    });
  });

  it('should render textList items for each criterion', () => {
    params.eligibilityCriteria.forEach((criterion) => {
      const criterionIdSelector = `criterion-${criterion.id}`;

      if (criterion.textList.length > 0) {
        criterion.textList.forEach((textList, index) => {
          const selector = `[data-cy="${criterionIdSelector}-textList-${index + 1}"]`;
          wrapper.expectText(selector).toRead(criterion.textList[index]);
        });
      }
    });
  });

  it('should render `last` class for the table cells in last table row', () => {
    const tableCellClassSelector = '.govuk-table__cell--last';
    wrapper.expectElement(tableCellClassSelector).lengthToEqual(3);
  });
});
