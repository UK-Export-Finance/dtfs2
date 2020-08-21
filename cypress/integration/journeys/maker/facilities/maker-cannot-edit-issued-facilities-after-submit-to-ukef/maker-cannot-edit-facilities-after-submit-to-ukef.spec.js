const pages = require('../../../../pages');
const dealWithMultipleFacilityTypesReadyToSubmitToUkef = require('./deal-multiple-facility-types-ready-to-submit-to-ukef');
const mockUsers = require('../../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('Checker submits a deal with all facility types to UKEF', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(dealWithMultipleFacilityTypesReadyToSubmitToUkef, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('Maker should not be able to navigate to Delete and Issue Facility pages', () => {
    //---------------------------------------------------------------
    // checker submits deal to UKEF
    //---------------------------------------------------------------
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.proceedToSubmit().click();
    pages.contractConfirmSubmission.confirmSubmit().check();
    pages.contractConfirmSubmission.acceptAndSubmit().click();

    //---------------------------------------------------------------
    // maker should not be able to edit any facilities
    //---------------------------------------------------------------
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    deal.bondTransactions.items.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);
      bondRow.deleteLink().should('not.be.visible');
      bondRow.issueFacilityLink().should('not.be.visible');
    });

    deal.loanTransactions.items.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.deleteLink().should('not.be.visible');
      loanRow.issueFacilityLink().should('not.be.visible');
    });
  });
});
