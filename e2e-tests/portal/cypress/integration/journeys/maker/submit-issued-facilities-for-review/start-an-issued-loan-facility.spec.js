const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const MOCK_USERS = require('../../../../fixtures/users');

const { BANK1_MAKER1 } = MOCK_USERS;

context('A maker is informed of a loan\'s status before submitting an issued loan facility with a deal in `Acknowledged by UKEF` status', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    loans: [],
  };

  before(() => {
    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, BANK1_MAKER1)
      .then((insertedDeal) => {
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
    pages.contract.proceedToReview().should('be.disabled');

    const loanId = dealFacilities.loans[0]._id;
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Not started');
    });

    loanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issue facility');
    });
    loanRow.issueFacilityLink().click();

    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

    // don't fill anything in. Submit and go back to deal page
    pages.loanIssueFacility.submit().click();
    cy.url().should('eq', relative(`/contract/${dealId}/loan/${loanId}/issue-facility`));

    pages.loanIssueFacility.cancelButton().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    // assert loan status has changed
    loanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Incomplete');
    });

    // assert `Issue facility link` text has not changed
    loanRow.issueFacilityLink().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Issue facility');
    });
  });
});
