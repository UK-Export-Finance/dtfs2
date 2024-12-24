import { GUARANTEE_DETAILS } from './loan-form-values';

const pages = require('../../pages');
const partials = require('../../partials');
const LOAN_FORM_VALUES = require('./loan-form-values');
const fillLoanForm = require('./fill-loan-forms');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Add a Loan to a Deal', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal();
  });

  it('should allow a user to create a Deal, pass Red Line and add a Loan to the deal', () => {
    cy.addLoanToDeal();

    cy.url().should('include', '/check-your-answers');

    pages.loanPreview.submissionDetails().should('be.visible');

    cy.clickSaveGoBackButton();
  });

  it('should show relevant details on application details page', () => {
    cy.addLoanToDeal();

    partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
      const loanId = loanIdHiddenInput[0].value;
      cy.clickSaveGoBackButton();

      // checks that edit name link and delete link contain name as has been set
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);
      loanRow.nameLink().contains(GUARANTEE_DETAILS.name);
      loanRow.deleteLink().contains(`Delete ${GUARANTEE_DETAILS.name}`);
    });
  });

  it('should populate Deal page with the submitted loan, with `Completed` status and link to `Loan Guarantee Details` page', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);
    cy.clickAddLoanButton();
    fillLoanForm.unconditionalWithCurrencySameAsSupplyContractCurrency();
    fillLoanForm.datesRepayments.inAdvanceAnnually();
    cy.clickSubmitButton();

    // get loanId, go back to Deal page
    // assert that some inputted Loan data is displayed in the table
    partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
      const loanId = loanIdHiddenInput[0].value;

      cy.clickSaveGoBackButton();
      cy.url().should('include', '/contract');

      const row = pages.contract.loansTransactionsTable.row(loanId);

      cy.assertText(row.nameLink(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);

      cy.assertText(row.loanStatus(), 'Completed');

      cy.assertText(row.facilityValue(), `${LOAN_FORM_VALUES.FINANCIAL_DETAILS.value}`);

      cy.assertText(row.facilityStage(), 'Unconditional');

      cy.assertText(
        row.requestedCoverStartDate(),
        `${LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear}`,
      );

      cy.assertText(
        row.coverEndDate(),
        `${LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth}/${LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear}`,
      );
    });
  });

  describe('when a user submits Loan forms without completing required fields', () => {
    it('loan should display all validation errors in `Loan Preview` page and `Incomplete` status in Deal page', () => {
      cy.loginGoToDealPage(BANK1_MAKER1);
      cy.clickAddLoanButton();

      cy.clickSubmitButton();
      cy.clickSubmitButton();
      cy.clickSubmitButton();
      cy.url().should('include', '/check-your-answers');

      partials.errorSummaryLinks().should('have.length', 7);

      // get loanId, go back to Deal page
      // assert Loan status
      partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        cy.clickSaveGoBackButton();
        cy.url().should('include', '/contract');
        cy.url().should('not.include', '/loan');

        const row = pages.contract.loansTransactionsTable.row(loanId);

        cy.assertText(row.loanStatus(), 'Incomplete');

        // check has has generic message on name and delete as name not set
        row.nameLink().contains('Loan’s reference number not entered');
        row.deleteLink().contains('Delete loan');
      });
    });
  });
});
