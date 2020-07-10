const pageRenderer = require('../pageRenderer');
const deal = require('../fixtures/deal-fully-completed');

const page = 'contract/contract-submission-details.njk';

const render = pageRenderer(page);

// TODO: alternative for checking for 'at least one value'
// wrap the render in conditional for the data. if the component is then rendered it's ok.

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render({ deal });
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


  it('should render contract overview table with a least one table cell value', () => {
    wrapper.expectElement('[data-cy="contract-overview-table"]').toExist();

    // no need to assert all table cells - these are covered in other component tests
    wrapper.expectText('[data-cy="bankSupplyContractID"]').toRead(deal.details.bankSupplyContractID);
  });

  describe('General deal information / About Supply Contract', () => {
    it('should render a heading with edit link', () => {
      wrapper.expectText('[data-cy="general-deal-info-heading"]').toRead('General deal information');

      const expectedLink = `/contract/${deal._id}/about/supplier`;
      wrapper.expectLink('[data-cy="edit-about-link"]').toLinkTo(expectedLink, 'edit');
    });

    it('should render submission details component with at at least one submitted value', () => {
      wrapper.expectElement('[data-cy="contract-about-submission-details"]').toExist();

      // no need to assert all values - these are covered in other component tests
      wrapper.expectText('[data-cy="supplier-type"]').toRead(deal.submissionDetails['supplier-type']);
    });
  });

  describe('Eligibility', () => {
    it('should render a heading with edit link', () => {
      wrapper.expectText('[data-cy="confirm-eligibility-heading"]').toRead('Confirm eligibility');

      const expectedLink = `/contract/${deal._id}/eligibility/criteria`;
      wrapper.expectLink('[data-cy="edit-eligibility-link"]').toLinkTo(expectedLink, 'edit');
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
    it('should render a heading, edit link and at least one submitted value for each bond', () => {
      for (const bond of deal.bondTransactions.items) { // eslint-disable-line no-restricted-syntax
        const bondSelector = `[data-cy="bond-${bond._id}"]`;

        wrapper.expectText(`${bondSelector} [data-cy="bond-heading"]`).toRead('Bond');

        const editBondLinkSelector = `${bondSelector} [data-cy="edit-bond-link"]`;
        const expectedLink = `/contract/${deal._id}/bond/${bond._id}/details`;
        wrapper.expectLink(editBondLinkSelector).toLinkTo(expectedLink, 'edit');

        // no need to assert all submitted values - these are covered in other component tests
        wrapper.expectText(`${bondSelector} [data-cy="bond-issuer"]`).toRead(bond.bondIssuer);
      }
    });
  });

  describe('Loans', () => {
    it('should render a heading, edit link and at least one submitted value for each loan', () => {
      for (const loan of deal.loanTransactions.items) { // eslint-disable-line no-restricted-syntax
        const loanSelector = `[data-cy="loan-${loan._id}"]`;

        wrapper.expectText(`${loanSelector} [data-cy="loan-heading"]`).toRead('Loan');

        const editLoanLinkSelector = `${loanSelector} [data-cy="edit-loan-link"]`;
        const expectedLink = `/contract/${deal._id}/loan/${loan._id}/guarantee-details`;
        wrapper.expectLink(editLoanLinkSelector).toLinkTo(expectedLink, 'edit');

        // no need to assert all submitted values - these are covered in other component tests
        wrapper.expectText(`${loanSelector} [data-cy="bank-reference-number"]`).toRead(loan.bankReferenceNumber);
      }
    });
  });

  it('should render a go back link', () => {
    wrapper.expectLink('[data-cy="go-back-link"]').toLinkTo(`/contract/${deal._id}`, 'Back to Supply Contract page');
  });

  // TODO: add go back button test to loan/bond submission tests
});
