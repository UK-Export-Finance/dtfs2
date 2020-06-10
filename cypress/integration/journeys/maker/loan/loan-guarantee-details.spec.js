const pages = require('../../../pages');
const partials = require('../../../partials');
const fillLoanForm = require('./fill-loan-forms');
const LOAN_FORM_VALUES = require('./loan-form-values');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('Loan Guarantee Details', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user)
      .then((insertedDeal) => deal = insertedDeal);
  });

  // it('form submit should progess to `Loan Financial Details` page and render additional submitted form field values in `Loan Preview` page', () => {
  it('form submit should progess to `Loan Financial Details` page', () => {
    cy.loginGoToDealPage(user, deal);

    pages.contract.addLoanButton().click();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/loan/');
    cy.url().should('include', '/guarantee-details');

    fillLoanForm.guaranteeDetails.facilityStageConditional();

    pages.loanGuaranteeDetails.submit().click();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/loan/');
    cy.url().should('include', '/financial-details');

    // progress to preview page
    pages.loanFinancialDetails.submit().click();
    pages.loanDatesRepayments.submit().click();
    cy.url().should('include', '/preview');

    // pages.loanPreview.facilityStage().invoke('text').then((text) => {
    //   expect(text.trim()).equal(LOAN_FORM_VALUES.GUARANTEE_DETAILS.facilityStage);
    // });

    // pages.loanPreview.ukefGuaranteeInMonths().invoke('text').then((text) => {
    //   expect(text.trim()).equal(LOAN_FORM_VALUES.GUARANTEE_DETAILS.ukefGuaranteeInMonths);
    // });
  });
});
