import { DEAL_SUBMISSION_TYPE, FACILITY_STAGE } from '@ukef/dtfs2-common';

const { contract, dashboardDeals } = require('../../../pages');
const partials = require('../../../partials');
const fillBondForm = require('../../maker-bond/fill-bond-forms');
const fillLoanForm = require('../../maker-loan/fill-loan-forms');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Ensure proceed to review button is only visible once facilities are in eligible for submission', () => {
  beforeEach(() => {
    cy.createBssEwcsDeal();
  });

  afterEach(() => {
    cy.deleteDeals(ADMIN);
  });

  it('Add an un-issued bond', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    // Ensure proceed to review button does not exist
    contract.proceedToReview().should('not.exist');

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
    cy.loginGoToDealPage(BANK1_MAKER1);

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
    cy.createBssEwcsDeal({ fillOutAllFields: true, dealSubmissionType: DEAL_SUBMISSION_TYPE.AIN, facilityStage: FACILITY_STAGE.UNISSUED });
  });

  it('Add an issued bond', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

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
    cy.loginGoToDealPage(BANK1_MAKER1);

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
    cy.createBssEwcsDeal({ fillOutAllFields: true, dealSubmissionType: DEAL_SUBMISSION_TYPE.AIN, facilityStage: FACILITY_STAGE.UNISSUED });
  });

  it('Add a partial issued (unconditional) loan', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

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
    dashboardDeals.visit();
    cy.clickDashboardDealLink();

    // Ensure facility stage is `Incomplete`
    contract.loansTransactionsTableRows().each((row) => {
      const loanId = row.attr('data-cy').split('-')[1];
      const loan = contract.loansTransactionsTable.row(loanId);
      loan.loanStatus().contains('Incomplete');
    });
  });

  it('Ensure proceed to review button is not visible when the deal status is in Draft', () => {
    cy.loginGoToDealPage(BANK1_MAKER1);

    // Proceed to review button
    contract.proceedToReview().should('not.exist');
  });
});
