import { FeeRecordEntityMockBuilder, UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { NODE_TASKS } from '../../../../../e2e-fixtures';

context('PDC_RECONCILE users can add a payment to a report', () => {
  beforeEach(() => {
    const BANK_ID = '961';
    const REPORT_ID = 1;
    const FEE_RECORD_ID_ONE = '11';
    const FEE_RECORD_ID_TWO = '22';
    const PAYMENT_CURRENCY = 'GBP';
    const FEE_RECORD_STATUS = 'TO_DO';
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
      .withId(REPORT_ID)
      .withBankId(BANK_ID)
      .build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(undefined)
      .withId(FEE_RECORD_ID_ONE)
      .withFacilityId('111111111')
      .withExporter('Exporter 1')
      .withPaymentCurrency(PAYMENT_CURRENCY)
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency('JPY')
      .withPaymentExchangeRate(2)
      .withStatus('TO_DO')
      .build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(undefined)
      .withId(FEE_RECORD_ID_TWO)
      .withFacilityId('22222222')
      .withExporter('Exporter 2')
      .withFeesPaidToUkefForThePeriod(200)
      .withFeesPaidToUkefForThePeriodCurrency('EUR')
      .withPaymentCurrency(PAYMENT_CURRENCY)
      .withPaymentExchangeRate(0.5)
      .withStatus('TO_DO')
      .build();
    report.feeRecords = [feeRecordOne, feeRecordTwo];

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);
    cy.get(`[type="checkbox"][id="feeRecordId-${FEE_RECORD_ID_ONE}-reportedPaymentsCurrency-${PAYMENT_CURRENCY}-status-${FEE_RECORD_STATUS}"]`).check();
    cy.get(`[type="checkbox"][id="feeRecordId-${FEE_RECORD_ID_TWO}-reportedPaymentsCurrency-${PAYMENT_CURRENCY}-status-${FEE_RECORD_STATUS}"]`).check();
    cy.get('[type="submit"]').contains('Add a payment').click();
  });

  it('should render the add a payment page', () => {
    cy.get('h1').invoke('text').should('contain', 'Add a payment');
  });

  it('should render the selected fee record details', () => {
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().contains('11111111');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().contains('Exporter 1');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().contains('JPY 100');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().contains('GBP 50');

    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().contains('22222222');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().contains('Exporter 2');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().contains('EUR 200');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().contains('GBP 400');

    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().contains('Total reported payments GBP 450');
  });

  it('should display errors when form submitted with invalid values', () => {
    cy.getInputByLabelText('Amount received').type('100');
    cy.getInputByLabelText('Day').type('56');
    cy.getInputByLabelText('Month').type('12');
    cy.getInputByLabelText('Year').type('2023');

    cy.contains('button', 'Continue').click();

    cy.contains('a', 'Select payment currency').should('exist');
    cy.contains('a', 'The date payment received must be a real date').should('exist');
    cy.contains('a', 'Select add another payment choice').should('exist');

    cy.contains('form', 'Select payment currency').should('exist');
    cy.contains('form', 'The date payment received must be a real date').should('exist');
    cy.contains('form', 'Select add another payment choice').should('exist');

    cy.getInputByLabelText('Amount received').should('have.value', '100');
    cy.getInputByLabelText('Day').should('have.value', '56');
    cy.getInputByLabelText('Month').should('have.value', '12');
    cy.getInputByLabelText('Year').should('have.value', '2023');
  });

  it('submits form and redirects to premium payments page when user submits form with valid values and user selects no to adding another payment', () => {
    cy.getInputByLabelText('GBP').click();
    cy.getInputByLabelText('Amount received').type('100');
    cy.getInputByLabelText('Day').type('12');
    cy.getInputByLabelText('Month').type('12');
    cy.getInputByLabelText('Year').type('2023');
    cy.getInputByLabelText('No').click();

    cy.contains('button', 'Continue').click();

    cy.contains('Premium payments');
  });

  it('submits form and reloads the page with no values when user submits form with valid values and user selects yes to adding another payment', () => {
    cy.getInputByLabelText('GBP').click();
    cy.getInputByLabelText('Amount received').type('100');
    cy.getInputByLabelText('Day').type('12');
    cy.getInputByLabelText('Month').type('12');
    cy.getInputByLabelText('Year').type('2023');
    cy.getInputByLabelText('Yes').click();

    cy.contains('button', 'Continue').click();

    cy.get('h1').invoke('text').should('contain', 'Add a payment');
    cy.getInputByLabelText('GBP').should('not.be.checked');
    cy.getInputByLabelText('USD').should('not.be.checked');
    cy.getInputByLabelText('JPY').should('not.be.checked');
    cy.getInputByLabelText('EUR').should('not.be.checked');
    cy.getInputByLabelText('Amount received').should('have.value', '');
    cy.getInputByLabelText('Day').should('have.value', '');
    cy.getInputByLabelText('Month').should('have.value', '');
    cy.getInputByLabelText('Year').should('have.value', '');
    cy.getInputByLabelText('Payment reference').should('have.value', '');
    cy.getInputByLabelText('Yes').should('not.be.checked');
    cy.getInputByLabelText('No').should('not.be.checked');
  });
});
