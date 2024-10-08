const pages = require('../../pages');
const partials = require('../../partials');
const fillLoanForm = require('./fill-loan-forms');
const assertLoanFormValues = require('./assert-loan-form-values');
const LOAN_FORM_VALUES = require('./loan-form-values');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const goToPage = () => {
  cy.loginGoToDealPage(BANK1_MAKER1);

  cy.clickAddLoanButton();
};

const assertVisibleRequestedCoverStartDateInputs = () => {
  pages.loanGuaranteeDetails.requestedCoverStartDateDayInput().should('be.visible');
  pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput().should('be.visible');
  pages.loanGuaranteeDetails.requestedCoverStartDateYearInput().should('be.visible');
};

const assertVisibleCoverEndDateInputs = () => {
  pages.loanGuaranteeDetails.coverEndDateDayInput().should('be.visible');
  pages.loanGuaranteeDetails.coverEndDateMonthInput().should('be.visible');
  pages.loanGuaranteeDetails.coverEndDateYearInput().should('be.visible');
};

context('Loan Guarantee Details', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal({});
  });

  describe('Loan Guarantee title', () => {
    it('should contain the correct title', () => {
      goToPage();

      pages.loanGuaranteeDetails.title().contains('Loan');
    });
  });

  describe('when submitting an empty form', () => {
    it('should progress to `Loan Financial Details` page and after proceeding to `Loan Preview` page, should render Facility stage validation error in `Loan Guarantee Details` page', () => {
      goToPage();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/loan/');
      cy.url().should('include', '/guarantee-details');

      cy.clickSubmitButton();

      cy.url().should('include', '/loan/');
      cy.url().should('include', '/financial-details');

      cy.clickSubmitButton();

      cy.url().should('include', '/dates-repayments');
      cy.clickSubmitButton();
      cy.url().should('include', '/check-your-answers');

      partials.taskListHeader.itemLink('loan-guarantee-details').click();

      cy.url().should('include', '/guarantee-details');

      partials.errorSummaryLinks().should('have.length', 1);
      pages.loanGuaranteeDetails.facilityStageErrorMessage().should('be.visible');
    });
  });

  describe('when a maker selects different Facility stage options (`Conditional` or `Unconditional`)', () => {
    it('should render additional form fields', () => {
      goToPage();

      // Facility stage = Conditional
      pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
      pages.loanGuaranteeDetails.conditionalNameInput().should('be.visible');
      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().should('be.visible');

      // Facility stage = Unconditional
      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();

      pages.loanGuaranteeDetails.unconditionalNameInput().should('be.visible');
      assertVisibleCoverEndDateInputs();
    });
  });

  describe('when a maker submits Facility stage as `Conditional`', () => {
    it('should render additional form fields and validation errors when returning to the page ', () => {
      goToPage();

      pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
      cy.clickSubmitButton();

      partials.taskListHeader.itemLink('loan-guarantee-details').click();

      partials.errorSummaryLinks().should('have.length', 1);

      pages.loanGuaranteeDetails.facilityStageConditionalInput().should('be.checked');
      pages.loanGuaranteeDetails.conditionalNameInput().should('be.visible');

      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().should('be.visible');
      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsErrorMessage().should('be.visible');
    });
  });

  describe('when a maker submits Facility stage as `Unconditional`', () => {
    it('should render additional form fields and validation errors when returning to the page and render a `Loan’s reference number not entered` link in the Deal page when (optional) Bank Reference Number is not provided', () => {
      goToPage();

      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();

      cy.clickSubmitButton();

      partials.taskListHeader.itemLink('loan-guarantee-details').click();

      partials.errorSummaryLinks().should('have.length', 2);

      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().should('be.checked');

      pages.loanGuaranteeDetails.unconditionalNameInput().should('be.visible');
      pages.loanGuaranteeDetails.unconditionalNameErrorMessage().should('be.visible');

      assertVisibleRequestedCoverStartDateInputs();
      assertVisibleCoverEndDateInputs();

      pages.loanGuaranteeDetails.coverEndDateErrorMessage().should('be.visible');

      partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        cy.clickSaveGoBackButton();

        const row = pages.contract.loansTransactionsTable.row(loanId);

        cy.assertText(row.nameLink(), 'Loan’s reference number not entered');

        // assert that clicking the `bank reference number` link progesses to the guarantee details page
        row.nameLink().click();
        cy.url().should('include', '/contract');
        cy.url().should('include', '/loan/');
        cy.url().should('include', '/guarantee-details');
      });
    });

    it('should show validation errors when incorrect date inputs and show invalid date on contract page', () => {
      goToPage();

      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();

      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateDayInput(), '23-');
      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput(), '03-');
      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateYearInput(), '2022-');

      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateDayInput(), '23-');
      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateMonthInput(), '08-');
      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateYearInput(), '2023-');

      cy.clickSubmitButton();

      partials.taskListHeader.itemLink('loan-guarantee-details').click();

      partials.errorSummaryLinks().should('have.length', 3);
      partials.errorSummaryLinks().contains('The year for the Cover End Date must include 4 numbers');
      partials.errorSummaryLinks().contains('The year for the requested Cover Start Date must include 4 numbers');
      pages.loanGuaranteeDetails.coverEndDateErrorMessage().contains('The year for the Cover End Date must include 4 numbers');
      pages.loanGuaranteeDetails.requestedCoverStartDateErrorMessage().contains('The year for the requested Cover Start Date must include 4 numbers');

      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateDayInput(), ' ');
      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput(), ' ');
      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateYearInput(), ' ');

      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateDayInput(), ' ');
      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateMonthInput(), ' ');
      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateYearInput(), ' ');

      cy.clickSubmitButton();

      partials.taskListHeader.itemLink('loan-guarantee-details').click();

      partials.errorSummaryLinks().should('have.length', 3);
      partials.errorSummaryLinks().contains('The year for the requested Cover Start Date must include 4 numbers');
      partials.errorSummaryLinks().contains('The year for the Cover End Date must include 4 numbers');
      pages.loanGuaranteeDetails.coverEndDateErrorMessage().contains('The year for the Cover End Date must include 4 numbers');
      pages.loanGuaranteeDetails.requestedCoverStartDateErrorMessage().contains('The year for the requested Cover Start Date must include 4 numbers');

      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateDayInput(), '23-');
      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput(), '05');
      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateYearInput(), '2022');

      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateDayInput(), '23-');
      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateMonthInput(), '05');
      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateYearInput(), '2025');

      cy.clickSubmitButton();

      partials.taskListHeader.itemLink('loan-guarantee-details').click();

      partials.errorSummaryLinks().should('have.length', 3);
      partials.errorSummaryLinks().contains('The day for the requested Cover Start Date must include 1 or 2 numbers');
      partials.errorSummaryLinks().contains('The day for the cover end date must only include 1 or 2 numbers');
      pages.loanGuaranteeDetails.coverEndDateErrorMessage().contains('The day for the cover end date must only include 1 or 2 numbers');
      pages.loanGuaranteeDetails.requestedCoverStartDateErrorMessage().contains('The day for the requested Cover Start Date must include 1 or 2 numbers');

      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateDayInput(), '23');
      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput(), '05-');
      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateYearInput(), '2022');

      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateDayInput(), '23');
      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateMonthInput(), '05-');
      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateYearInput(), '2025');

      cy.clickSubmitButton();

      partials.taskListHeader.itemLink('loan-guarantee-details').click();

      partials.errorSummaryLinks().should('have.length', 3);
      partials.errorSummaryLinks().contains('The month for the requested Cover Start Date must include 1 or 2 numbers');
      partials.errorSummaryLinks().contains('The month for the cover end date must only include 1 or 2 numbers');
      pages.loanGuaranteeDetails.coverEndDateErrorMessage().contains('The month for the cover end date must only include 1 or 2 numbers');
      pages.loanGuaranteeDetails.requestedCoverStartDateErrorMessage().contains('The month for the requested Cover Start Date must include 1 or 2 numbers');

      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateDayInput(), '##');
      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput(), '##');
      cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateYearInput(), '####');

      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateDayInput(), '##');
      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateMonthInput(), '##');
      cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateYearInput(), '####');

      partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        cy.clickSaveGoBackButton();

        const row = pages.contract.loansTransactionsTable.row(loanId);

        row.requestedCoverStartDate().contains('Invalid date');
        row.coverEndDate().contains('Invalid date');
      });
    });
  });

  it('should prepopulate form inputs from submitted data and render a checked checkbox in progress nav', () => {
    goToPage();

    // Facility stage = Conditional
    fillLoanForm.guaranteeDetails.facilityStageConditional();
    cy.clickSubmitButton();

    partials.taskListHeader.itemLink('loan-guarantee-details').click();
    assertLoanFormValues.guaranteeDetails.facilityStageConditional();

    // Facility stage = Unconditional
    fillLoanForm.guaranteeDetails.facilityStageUnconditional();

    // assert that name value is retained
    pages.loanGuaranteeDetails.unconditionalNameInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);
    cy.clickSubmitButton();

    partials.taskListHeader.itemLink('loan-guarantee-details').click();
    assertLoanFormValues.guaranteeDetails.facilityStageUnconditional();
  });

  describe('When a maker clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Loan Guarantee Details` page', () => {
      goToPage();

      fillLoanForm.guaranteeDetails.facilityStageUnconditional();

      partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        cy.clickSaveGoBackButton();

        cy.url().should('not.include', '/guarantee-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.loansTransactionsTable.row(loanId);

        row.nameLink().click();
        cy.url().should('include', '/loan/');
        cy.url().should('include', '/guarantee-details');

        assertLoanFormValues.guaranteeDetails.facilityStageUnconditional();
      });
    });
  });
});
