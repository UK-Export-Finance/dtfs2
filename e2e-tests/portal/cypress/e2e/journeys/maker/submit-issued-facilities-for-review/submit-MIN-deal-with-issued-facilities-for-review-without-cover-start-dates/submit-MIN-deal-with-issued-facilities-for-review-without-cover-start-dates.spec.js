const pages = require('../../../../pages');
const relative = require('../../../../relativeURL');
const minDealWithNotStartedFacilityStatuses = require('./MINDealWithNotStartedFacilityStatuses');
const MOCK_USERS = require('../../../../../fixtures/users');
const {
  fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate,
  ISSUED_BOND_DATE_VALUE,
} = require('../../fill-and-submit-issue-facility-form/fillAndSubmitIssueBondFacilityForm');
const {
  fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate,
  ISSUED_LOAN_DATE_VALUE,
} = require('../../fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Maker fills in bond & loan issue facility forms without requested cover start date and submits the deal for checker review', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.insertOneDeal(minDealWithNotStartedFacilityStatuses, BANK1_MAKER1)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;
        const { mockFacilities } = minDealWithNotStartedFacilityStatuses;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.type === 'Bond');
          const loans = createdFacilities.filter((f) => f.type === 'Loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('defaults the submitted facilities requested cover start dates to the previously entered issue date', () => {
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('be.disabled');

    const bondId = dealFacilities.bonds[0]._id;
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    const loanId = dealFacilities.loans[0]._id;
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.issueFacilityLink().click();

    fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    // submit deal for review
    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the /dashboard page
    cy.url().should('include', '/dashboard');

    pages.contract.visit(deal);

    // expect bond requested cover start date to default to issued date
    bondRow.requestedCoverStartDate().invoke('text').then((text) => {
      const expected = ISSUED_BOND_DATE_VALUE.toLocaleDateString('en-GB');
      expect(text.trim()).to.equal(expected);
    });

    // expect loan requested cover start date to default to issued date
    loanRow.requestedCoverStartDate().invoke('text').then((text) => {
      const expected = ISSUED_LOAN_DATE_VALUE.toLocaleDateString('en-GB');
      expect(text.trim()).to.equal(expected);
    });
  });
});
