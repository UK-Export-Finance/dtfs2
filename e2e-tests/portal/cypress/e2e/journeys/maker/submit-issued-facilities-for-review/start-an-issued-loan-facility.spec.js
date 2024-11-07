const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

context("A maker is informed of a loan's status before submitting an issued loan facility with a deal in `Acknowledged` status", () => {
  let deal;
  let dealId;
  const dealFacilities = {
    loans: [],
  };

  before(() => {
    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = dealWithNotStartedFacilityStatuses;

      const loans = mockFacilities.filter((f) => f.type === 'Loan');

      cy.createFacilities(dealId, loans, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.loans = createdFacilities;
      });
    });
  });

  after(() => {
    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('Starting to fill in the Issue Loan Facility form should change the Loan status from `Not started` to `Incomplete` and the Issue Facility link to `Facility issued`', () => {
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('not.exist');

    const loanId = dealFacilities.loans[0]._id;
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    cy.assertText(loanRow.loanStatus(), 'Not started');
    cy.assertText(loanRow.issueFacilityLink(), 'Issue facility');

    loanRow.issueFacilityLink().click();

    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

    // don't fill anything in. Submit and go back to deal page
    cy.clickSubmitButton();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

    cy.clickCancelButton();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    // assert loan status has changed
    cy.assertText(loanRow.loanStatus(), 'Incomplete');

    // assert `Issue facility link` text has not changed
    cy.assertText(loanRow.issueFacilityLink(), 'Issue facility');
  });
});
