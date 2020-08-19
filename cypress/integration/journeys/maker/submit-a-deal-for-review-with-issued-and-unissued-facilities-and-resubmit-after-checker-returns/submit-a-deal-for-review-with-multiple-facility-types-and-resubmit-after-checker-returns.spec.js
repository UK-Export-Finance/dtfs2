const pages = require('../../../pages');
const mockUsers = require('../../../../fixtures/mockUsers');
const dealReadyToSubmitToChecker = require('./dealReadyToSubmitToChecker');

const CHECKER_LOGIN = mockUsers.find(user => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find(user => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('A maker and checker can submit and re-submit a deal to each other multiple times', () => {
  let deal;

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealReadyToSubmitToChecker, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
      });
  });

  const assertFacilityStatuseAreTheSame = () => {
    deal.bondTransactions.items.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.bondStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.bondStage);
      });
    });

    deal.loanTransactions.items.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });
    });
  };

  it('should retain loan and bond facility statuses as they were in Draft (`Completed`) during all stages of submits/re-submits, regardless of Issued/Unissued/Conditional/Unconditional', () => {
    //---------------------------------------------------------------
    // maker submits deal to checker
    //---------------------------------------------------------------

    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    assertFacilityStatuseAreTheSame();

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Ready for review');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker returns deal to maker
    //---------------------------------------------------------------

    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.returnToMaker().click();
    pages.contractReturnToMaker.comments().type('Nope');
    pages.contractReturnToMaker.returnToMaker().click();

    //---------------------------------------------------------------
    // maker views deal
    //---------------------------------------------------------------

    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    assertFacilityStatuseAreTheSame();

    //---------------------------------------------------------------
    // maker re-submits deal with no changes
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Ready for review');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    pages.contract.visit(deal);

    assertFacilityStatuseAreTheSame();
  });
});
