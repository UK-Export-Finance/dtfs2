const pages = require('../../../../pages');
const dealWithMultipletypesReadyToSubmitToUkef = require('./deal-multiple-facility-types-ready-to-submit-to-ukef');
const MOCK_USERS = require('../../../../../fixtures/users');

const {
  ADMIN,
  BANK1_MAKER1,
  BANK1_CHECKER1,
} = MOCK_USERS;

context('Checker submits a deal with all facility types to UKEF', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(dealWithMultipletypesReadyToSubmitToUkef, BANK1_MAKER1)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;

        const facilitiesToCreate = [
          ...deal.bondTransactions.items,
          ...deal.loanTransactions.items,
        ];

        cy.createFacilities(dealId, facilitiesToCreate, BANK1_MAKER1).then((createdFacilities) => {
          dealFacilities.bonds = createdFacilities.filter((f) => f.type === 'Bond');
          dealFacilities.loans = createdFacilities.filter((f) => f.type === 'Loan');
        });
      });
  });

  it('Maker should not be able to navigate to Delete and Issue Facility pages', () => {
    //---------------------------------------------------------------
    // checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login(BANK1_CHECKER1);
    pages.contract.visit(deal);

    pages.contract.proceedToSubmit().click();
    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    //---------------------------------------------------------------
    // maker should not be able to edit any facilities
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);

    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id;
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.uniqueNumberLink().should('not.exist');
      bondRow.uniqueNumber().should('be.visible');

      bondRow.deleteLink().should('not.exist');
      bondRow.issueFacilityLink().should('not.exist');
    });

    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id;
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.nameLink().should('not.exist');
      loanRow.name().should('be.visible');

      loanRow.deleteLink().should('not.exist');
      loanRow.issueFacilityLink().should('not.exist');
    });
  });
});
