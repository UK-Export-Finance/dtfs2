const pages = require('../../pages');
const partials = require('../../partials');
const fillBondForm = require('../maker-bond/fill-bond-forms');
const fillLoanForm = require('../maker-loan/fill-loan-forms');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const dealWithNoFacilities = require('./submit-issued-facilities-for-review/dealWithNoFacilities');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Ensure proceed to review button is only visible once facilities are in eligible for submission', () => {
  let deal;

  before(() => {
    cy.insertOneDeal(dealWithNoFacilities, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  after(() => {
    cy.deleteDeals(ADMIN);
  });

  it('Add an un-issued bond', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Ensure proceed to review button does not exist
    pages.contract.proceedToReview().should('not.exist');

    // Add bond
    cy.clickAddBondButton();

    // Bond details
    fillBondForm.details.facilityStageUnissued();
    cy.clickSubmitButton();

    // Financial details
    fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
    cy.clickSubmitButton();

    // Fee details
    fillBondForm.feeDetails();
    cy.clickSubmitButton();
  });

  it('Add an un-issued (conditional) loan', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Add loan
    cy.clickAddLoanButton();

    // Loan details
    fillLoanForm.guaranteeDetails.facilityStageConditional();
    cy.clickSubmitButton();

    // Financial details
    fillLoanForm.financialDetails.currencySameAsSupplyContractCurrency();
    cy.clickSubmitButton();

    // Fee details
    fillLoanForm.datesRepayments.inAdvanceAnnually();
    cy.clickSubmitButton();
  });

  it('Ensure proceed to review button is visible', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Proceed to review button
    pages.contract.proceedToReview().should('exist');
  });

  it('Add an issued bond', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Add bond
    cy.clickAddBondButton();

    // Bond details
    fillBondForm.details.facilityStageIssued();
    cy.clickSubmitButton();

    // Financial details
    fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
    cy.clickSubmitButton();

    // Fee details
    fillBondForm.feeDetails();
    cy.clickSubmitButton();
  });

  it('Add an issued (unconditional) loan', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Add loan
    cy.clickAddLoanButton();

    // Loan details
    fillLoanForm.guaranteeDetails.facilityStageUnconditional();
    cy.clickSubmitButton();

    // Financial details
    fillLoanForm.financialDetails.currencyNotTheSameAsSupplyContractCurrency();
    cy.clickSubmitButton();

    // Fee details
    fillLoanForm.datesRepayments.inAdvanceAnnually();
    cy.clickSubmitButton();
  });

  it('Ensure proceed to review button is visible', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Proceed to review button
    pages.contract.proceedToReview().should('exist');
  });

  it('Add a partial issued (unconditional) loan', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Add loan
    cy.clickAddLoanButton();

    // Loan details
    fillLoanForm.guaranteeDetails.facilityStageUnconditional();
    cy.clickSubmitButton();

    // Financial details - Do not fill in
    cy.clickSubmitButton();

    // Fee details
    cy.assertText(partials.taskListHeader.itemStatus('loan-financial-details'), 'Incomplete');

    fillLoanForm.datesRepayments.inAdvanceAnnually();
    cy.clickSubmitButton();

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Ensure facility stage is `Incomplete`
    pages.contract.loansTransactionsTableRows().each((row, index) => {
      const loanId = row.attr('data-cy').split('-')[1];
      const loan = pages.contract.loansTransactionsTable.row(loanId);
      const status = index === 2 ? 'Incomplete' : 'Complete';
      loan.loanStatus().contains(status);
    });
  });

  it('Ensure proceed to review button is not visible', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Proceed to review button
    pages.contract.proceedToReview().should('not.exist');
  });
});
