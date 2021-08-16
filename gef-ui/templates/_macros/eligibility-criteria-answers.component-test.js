const componentRenderer = require('../../component-tests/componentRenderer');

const component = '../templates/_macros/eligibility-criteria-answers.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    eligibilityCriteria: [
      {
        id: 11,
        description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
        descriptionList: [
          '11 test',
          '11 testing'
        ],
        answer: true,
      },
      {
        id: 12,
        description: 'The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.',
        answer: true,
        descriptionList: [
          '12 test',
          '12 testing'
        ],
      },
      {
        id: 13,
        description: 'The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).',
        answer: true,
        descriptionList: [],
      },
      {
        id: 14,
        description: 'For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.',
        answer: true,
        descriptionList: [
          '14 test',
          '14 testing'
        ],
      },
      {
        id: 15,
        description: 'The Requested Cover Start Date is no more than three months from the date of submission.',
        answer: true,
        descriptionList: [],
      },
      {
        id: 16,
        description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: true,
        descriptionList: [
          '16 test',
          '16 testing'
        ],
      },
      {
        id: 17,
        description: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.',
        answer: true,
        descriptionList: [],
      },
      {
        id: 18,
        description: 'The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.',
        answer: true,
        descriptionList: [
          '18 test',
          '18 testing'
        ],
      },
    ],
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render a heading, answer tag, description for each criterion', () => {
    params.eligibilityCriteria.forEach((criterion) => {
      const criterionIdSelector = `criterion-${criterion.id}`;
      wrapper.expectText(`[data-cy="${criterionIdSelector}-heading"]`).toRead(`EC${criterion.id}`);

      wrapper.expectElement('[data-cy="eligibility-criteria-answer-tag"]').toExist();

      wrapper.expectText(`[data-cy="${criterionIdSelector}-description"]`).toRead(criterion.description);
    });
  });

  it('should render descriptionList items for each criterion', () => {
    params.eligibilityCriteria.forEach((criterion) => {
      const criterionIdSelector = `criterion-${criterion.id}`;

      if (criterion.descriptionList.length > 0) {
        criterion.descriptionList.forEach((descriptionList, index) => {
          const selector = `[data-cy="${criterionIdSelector}-descriptionList-${index + 1}"]`;
          wrapper.expectText(selector).toRead(criterion.descriptionList[index]);
        });
      }
    });
  });

  it('should render `last` class for the table cells in last table row', () => {
    const lastCriterion = params.eligibilityCriteria[params.eligibilityCriteria.length - 1];
    const lastCriterionIndex = params.eligibilityCriteria.indexOf(lastCriterion);

    const tableCellClassSelector = '.govuk-table__cell--last';
    wrapper.expectElement(tableCellClassSelector).lengthToEqual(3);
  });
});
