const pageRenderer = require('../pageRenderer');
const deal = require('../fixtures/deal-fully-completed');

const page = 'contract/contract-submission-details.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render({
      deal,
      user: {
        timezone: 'Europe/London',
        roles: ['maker'],
      },
      editable: true,
    });
  });

  it('should render page heading with bankSupplyContractName', () => {
    const expected = `Supply Contract name: ${deal.details.bankSupplyContractName}`;
    wrapper.expectText('[data-cy="heading"]').toRead(expected);
  });

  describe('tabs', () => {
    it('should render `View` link', () => {
      wrapper.expectLink('[data-cy="view-tab"]').toLinkTo(`/contract/${deal._id}`, 'View');
    });

    it('should render `Comments` link', () => {
      wrapper.expectLink('[data-cy="comments-tab"]').toLinkTo(`/contract/${deal._id}/comments`, 'Comments');
    });

    it('should render (active) `Preview Deal Details` link', () => {
      wrapper.expectLink('[data-cy="preview-tab"]').toLinkTo('#', 'Preview Deal Details');
    });
  });

  it('should render contract overview table', () => {
    wrapper.expectElement('[data-cy="contract-overview-table"]').toExist();
  });

  describe('General deal information / About Supply Contract', () => {
    it('should render a heading', () => {
      wrapper.expectText('[data-cy="general-deal-info-heading"]').toRead('General deal information');
    });

    it('should render edit link component', () => {
      const selector = `[data-cy="edit-about-link-/contract/${deal._id}/about/supplier"]`;
      wrapper.expectElement(selector).toExist();
    });

    it('should render submission details component', () => {
      wrapper.expectElement('[data-cy="contract-about-submission-details"]').toExist();
    });
  });

  describe('Eligibility', () => {
    it('should render a heading', () => {
      wrapper.expectText('[data-cy="confirm-eligibility-heading"]').toRead('Confirm eligibility');
    });

    it('should render edit link component', () => {
      const selector = `[data-cy="edit-eligibility-link-/contract/${deal._id}/eligibility/criteria"]`;
      wrapper.expectElement(selector).toExist();
    });

    it('should render Mandatory criteria component', () => {
      wrapper.expectElement('[data-cy="mandatory-criteria-box"]').toExist();
    });

    it('should render Eligibility Criteria Answers component', () => {
      wrapper.expectElement('[data-cy="eligibility-criteria-answers"]').toExist();
    });

    it('should render Eligibility Documentation component', () => {
      wrapper.expectElement('[data-cy="eligibility-documentation"]').toExist();
    });
  });

  describe('Bonds', () => {
    it('should render a heading, edit link component and Bond Submission Details component', () => {
      for (const bond of deal.bondTransactions.items) { // eslint-disable-line no-restricted-syntax
        const bondSelector = `[data-cy="bond-${bond._id}"]`;

        wrapper.expectText(`${bondSelector} [data-cy="bond-heading"]`).toRead('Bond');

        const editLinkComponent = `[data-cy="edit-bond-${bond._id}-link-/contract/${deal._id}/bond/${bond._id}/bond/details"]`;
        wrapper.expectElement(editLinkComponent).toExist();

        wrapper.expectElement(`${bondSelector} [data-cy="bond-submission-details"]`).toExist();
      }
    });
  });

  describe('Loans', () => {
    it('should render a heading, edit link and Loan Submission Details component', () => {
      for (const loan of deal.loanTransactions.items) { // eslint-disable-line no-restricted-syntax
        const loanSelector = `[data-cy="loan-${loan._id}"]`;

        wrapper.expectText(`${loanSelector} [data-cy="loan-heading"]`).toRead('Loan');

        const editLinkComponent = `[data-cy="edit-loan-${loan._id}-link-/contract/${deal._id}/loan/${loan._id}/loan/guarantee-details"]`;
        wrapper.expectElement(editLinkComponent).toExist();

        wrapper.expectElement(`${loanSelector} [data-cy="loan-submission-details"]`).toExist();
      }
    });
  });

  it('should render a go back link', () => {
    wrapper.expectLink('[data-cy="go-back-link"]').toLinkTo(`/contract/${deal._id}`, 'Back to Supply Contract page');
  });
});
