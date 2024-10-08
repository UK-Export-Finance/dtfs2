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
    pages.contract.addBondButton().click();

    // Bond details
    fillBondForm.details.facilityStageUnissued();
    pages.bondFinancialDetails.submit().click();

    // Financial details
    fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
    pages.bondFinancialDetails.submit().click();

    // Fee details
    fillBondForm.feeDetails();
    pages.bondFeeDetails.submit().click();
  });

  it('Add an un-issued (conditional) loan', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Add loan
    pages.contract.addLoanButton().click();

    // Loan details
    fillLoanForm.guaranteeDetails.facilityStageConditional();
    pages.loanFinancialDetails.submit().click();

    // Financial details
    fillLoanForm.financialDetails.currencySameAsSupplyContractCurrency();
    pages.loanFinancialDetails.submit().click();

    // Fee details
    fillLoanForm.datesRepayments.inAdvanceAnnually();
    pages.loanFinancialDetails.submit().click();
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
    pages.contract.addBondButton().click();

    // Bond details
    fillBondForm.details.facilityStageIssued();
    pages.bondFinancialDetails.submit().click();

    // Financial details
    fillBondForm.financialDetails.currencySameAsSupplyContractCurrency();
    pages.bondFinancialDetails.submit().click();

    // Fee details
    fillBondForm.feeDetails();
    pages.bondFeeDetails.submit().click();
  });

  it('Add an issued (unconditional) loan', () => {
    // Login as a `Maker`
    cy.login(BANK1_MAKER1);

    // Navigate to the deal in question
    pages.contract.visit(deal);

    // Add loan
    pages.contract.addLoanButton().click();

    // Loan details
    fillLoanForm.guaranteeDetails.facilityStageUnconditional();
    pages.loanFinancialDetails.submit().click();

    // Financial details
    fillLoanForm.financialDetails.currencyNotTheSameAsSupplyContractCurrency();
    pages.loanFinancialDetails.submit().click();

    // Fee details
    fillLoanForm.datesRepayments.inAdvanceAnnually();
    pages.loanFinancialDetails.submit().click();
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
    pages.contract.addLoanButton().click();

    // Loan details
    fillLoanForm.guaranteeDetails.facilityStageUnconditional();
    pages.loanFinancialDetails.submit().click();

    // Financial details - Do not fill in
    pages.loanFinancialDetails.submit().click();

    // Fee details
    partials.taskListHeader
      .itemStatus('loan-financial-details')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).equal('Incomplete');
      });
    fillLoanForm.datesRepayments.inAdvanceAnnually();
    pages.loanFinancialDetails.submit().click();

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
