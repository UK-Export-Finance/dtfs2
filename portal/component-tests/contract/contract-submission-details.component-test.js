const pageRenderer = require('../pageRenderer');
const deal = require('../fixtures/deal-fully-completed');

const page = 'contract/contract-submission-details.njk';

const render = pageRenderer(page);

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

  // TODO: assert table is rendered

  // TODO
  // About Supply Contract
  // edit link
  // Supplier and counter-indemnifier/guarantor
  // Buyer
  // Financial information


  // Eligibility
  // edit link
  // Mandatory criteria
  // Eligibility criteria
  // Supporting documentation

  describe('Bonds', () => {
    it('should render a heading, edit link and at least one submitted value for each bond', () => {
      for (const bond of deal.bondTransactions.items) { // eslint-disable-line no-restricted-syntax
        const bondSelector = `[data-cy="bond-${bond._id}"]`;

        wrapper.expectText(`${bondSelector} [data-cy="bond-heading"]`).toRead('Bond');

        const editBondLinkSelector = `${bondSelector} [data-cy="edit-bond-link"]`;
        const expectedLink = `/contract/${deal._id}/bond/${bond._id}/details`;
        wrapper.expectLink(editBondLinkSelector).toLinkTo(expectedLink, 'edit');

        // no need to assert all submitted values
        // these are covered in bond submission details component test
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

        // no need to assert all submitted values
        // these are covered in loan submission details component test
        wrapper.expectText(`${loanSelector} [data-cy="bank-reference-number"]`).toRead(loan.bankReferenceNumber);
      }
    });
  });

  // back to supply contract link
  // TODO: add go back button test to loan/bond submission tests
});
