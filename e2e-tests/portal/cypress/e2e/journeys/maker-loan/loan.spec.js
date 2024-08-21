import { GUARANTEE_DETAILS } from './loan-form-values';

const pages = require('../../pages');
const partials = require('../../partials');
const LOAN_FORM_VALUES = require('./loan-form-values');
const relative = require('../../relativeURL');
const fillLoanForm = require('./fill-loan-forms');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const MOCK_DEAL = {
  bankInternalRefName: 'someDealId',
  additionalRefName: 'someDealName',
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
};

context('Add a Loan to a Deal', () => {
  let deal;

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(MOCK_DEAL, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it('should allow a user to create a Deal, pass Red Line and add a Loan to the deal', () => {
    cy.createADeal({
      username: BANK1_MAKER1.username,
      password: BANK1_MAKER1.password,
      bankDealId: MOCK_DEAL.bankInternalRefName,
      bankDealName: MOCK_DEAL.additionalRefName,
    });
    cy.addLoanToDeal();

    cy.url().should('include', '/check-your-answers');

    pages.loanPreview.submissionDetails().should('be.visible');

    pages.loanPreview.saveGoBackButton().click();
  });

  it('should show relevant details on application details page', () => {
    cy.createADeal({
      username: BANK1_MAKER1.username,
      password: BANK1_MAKER1.password,
      bankDealId: MOCK_DEAL.bankInternalRefName,
      bankDealName: MOCK_DEAL.additionalRefName,
    });
    cy.addLoanToDeal();

    partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
      const loanId = loanIdHiddenInput[0].value;
      pages.loanPreview.saveGoBackButton().click();

      // checks that edit name link and delete link contain name as has been set
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);
      loanRow.nameLink().contains(GUARANTEE_DETAILS.name);
      loanRow.deleteLink().contains(`Delete ${GUARANTEE_DETAILS.name}`);
    });
  });

  it('should populate Deal page with the submitted loan, with `Completed` status and link to `Loan Guarantee Details` page', () => {
    cy.loginGoToDealPage(BANK1_MAKER1, deal);
    pages.contract.addLoanButton().click();
    fillLoanForm.unconditionalWithCurrencySameAsSupplyContractCurrency();
    fillLoanForm.datesRepayments.inAdvanceAnnually();
    pages.loanDatesRepayments.submit().click();

    // get loanId, go back to Deal page
    // assert that some inputted Loan data is displayed in the table
    partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
      const loanId = loanIdHiddenInput[0].value;

      pages.loanPreview.saveGoBackButton().click();
      cy.url().should('eq', relative(`/contract/${deal._id}`));

      const row = pages.contract.loansTransactionsTable.row(loanId);

      cy.assertText(row.nameLink(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);

      cy.assertText(row.loanStatus(), 'Completed');

      cy.assertText(row.facilityValue(), `${deal.submissionDetails.supplyContractCurrency.id} ${LOAN_FORM_VALUES.FINANCIAL_DETAILS.value}`);

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
      cy.loginGoToDealPage(BANK1_MAKER1, deal);
      pages.contract.addLoanButton().click();

      pages.loanGuaranteeDetails.submit().click();
      pages.loanFinancialDetails.submit().click();
      pages.loanDatesRepayments.submit().click();
      cy.url().should('include', '/check-your-answers');

      partials.errorSummary.errorSummaryLinks().should('have.length', 7);

      // get loanId, go back to Deal page
      // assert Loan status
      partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        pages.loanPreview.saveGoBackButton().click();
        cy.url().should('include', '/contract');
        cy.url().should('not.include', '/loan');

        const row = pages.contract.loansTransactionsTable.row(loanId);

        cy.assertText(row.loanStatus, 'Incomplete');

        // check has has generic message on name and delete as name not set
        row.nameLink().contains('Loan’s reference number not entered');
        row.deleteLink().contains('Delete loan');
      });
    });
  });
});
