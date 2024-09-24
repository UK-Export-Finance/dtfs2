const pages = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const fillLoanForm = require('./fill-loan-forms');
const LOAN_FORM_VALUES = require('./loan-form-values');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Loan form - Submit loan with created element on page', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal({});
  });

  it("should not insert created element's data into the loan", () => {
    // navigate to the about-buyer page
    cy.loginGoToDealPage(BANK1_MAKER1);

    cy.clickAddLoanButton();

    // insert text element onto loan form
    cy.insertElement('loan-guarantee-form');

    pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
    cy.keyboardInput(pages.loanGuaranteeDetails.unconditionalNameInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);

    cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateDayInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay);

    cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth);

    cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateYearInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear);

    cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateDayInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay);

    cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateMonthInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth);

    cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateYearInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear);

    cy.clickSubmitButton();

    // insert text element onto loan form
    cy.insertElement('loan-financial-details-form');

    cy.keyboardInput(pages.loanFinancialDetails.facilityValueInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.value);

    pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputYes().click();
    cy.keyboardInput(pages.loanFinancialDetails.interestMarginFeeInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.interestMarginFee);

    cy.keyboardInput(pages.loanFinancialDetails.coveredPercentageInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);

    cy.keyboardInput(pages.loanFinancialDetails.minimumQuarterlyFeeInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.minimumQuarterlyFee);

    cy.keyboardInput(pages.loanFinancialDetails.disbursementAmountInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.disbursementAmount);

    cy.clickSubmitButton();

    fillLoanForm.datesRepayments.inAdvanceAnnually();
    // insert text element onto loan form
    cy.insertElement('loan-repayment-form');
    cy.clickSubmitButton();

    cy.getDealIdFromUrl().then((dealId) => {
      cy.getDeal(dealId, BANK1_MAKER1).then((updatedDeal) => {
        cy.getFacility(dealId, updatedDeal.facilities[0], BANK1_MAKER1).then((loan) => {
          // checks loan does not have inserted field
          expect(loan.intruder).to.be.an('undefined');
        });
      });
    });
  });
});
