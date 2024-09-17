const pages = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const fillLoanForm = require('./fill-loan-forms');
const LOAN_FORM_VALUES = require('./loan-form-values');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Loan form - Submit loan with created element on page', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssDeal({});
  });

  it("should not insert created element's data into the loan", () => {
    // navigate to the about-buyer page
    cy.loginGoToDealPage(BANK1_MAKER1);

    pages.contract.addLoanButton().click();

    // insert text element onto loan form
    cy.insertElement('loan-guarantee-form');

    pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
    pages.loanGuaranteeDetails.unconditionalNameInput().clear();
    pages.loanGuaranteeDetails.unconditionalNameInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);

    pages.loanGuaranteeDetails.requestedCoverStartDateDayInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay);
    pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth);
    pages.loanGuaranteeDetails.requestedCoverStartDateYearInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear);

    pages.loanGuaranteeDetails.coverEndDateDayInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay);
    pages.loanGuaranteeDetails.coverEndDateMonthInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth);
    pages.loanGuaranteeDetails.coverEndDateYearInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear);

    pages.loanGuaranteeDetails.submit().click();

    // insert text element onto loan form
    cy.insertElement('loan-financial-details-form');

    pages.loanFinancialDetails.facilityValueInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.value);
    pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputYes().click();
    pages.loanFinancialDetails.interestMarginFeeInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.interestMarginFee);
    pages.loanFinancialDetails.coveredPercentageInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    pages.loanFinancialDetails.minimumQuarterlyFeeInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.minimumQuarterlyFee);

    pages.loanFinancialDetails.disbursementAmountInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.disbursementAmount);
    pages.loanFinancialDetails.submit().click();

    fillLoanForm.datesRepayments.inAdvanceAnnually();
    // insert text element onto loan form
    cy.insertElement('loan-repayment-form');
    pages.loanDatesRepayments.submit().click();

    // TODO: need to
    // 1) create a new command to get the deal ID from the URL
    //   - search for this, can move this into a command: // gets url and gets dealId from url
    // 2) consume the new command here.

    // cy.getDeal(deal._id, BANK1_MAKER1).then((updatedDeal) => {
    //   // gets facilityId from deal
    //   cy.getFacility(deal._id, updatedDeal.facilities[0], BANK1_MAKER1).then((loan) => {
    //     // checks loan does not have inserted field
    //     expect(loan.intruder).to.be.an('undefined');
    //   });
    // });
  });
});
