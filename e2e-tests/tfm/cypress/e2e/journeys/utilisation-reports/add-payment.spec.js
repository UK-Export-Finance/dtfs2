import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  PaymentMatchingToleranceEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { NODE_TASKS } from '../../../../../e2e-fixtures';

context('PDC_RECONCILE users can add a payment to a report', () => {
  const GBP_TOLERANCE = 2;
  const BANK_ID = '961';
  const REPORT_ID = 1;
  const FEE_RECORD_ID_ONE = '11';
  const FEE_RECORD_ID_TWO = '22';
  const PAYMENT_CURRENCY = 'GBP';

  const resetTolerances = () => {
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENT_MATCHING_TOLERANCES_FROM_DB);
    cy.task(NODE_TASKS.INSERT_PAYMENT_MATCHING_TOLERANCES_INTO_DB, [
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('GBP').withThreshold(GBP_TOLERANCE).withIsActive(true).withId(1).build(),
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('EUR').withThreshold(0).withIsActive(true).withId(2).build(),
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('JPY').withThreshold(0).withIsActive(true).withId(3).build(),
      PaymentMatchingToleranceEntityMockBuilder.forCurrency('USD').withThreshold(0).withIsActive(true).withId(4).build(),
    ]);
  };

  beforeEach(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    resetTolerances();

    const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
      .withId(REPORT_ID)
      .withBankId(BANK_ID)
      .build();
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

    const payment = PaymentEntityMockBuilder.forCurrency(PAYMENT_CURRENCY)
      .withAmount(60)
      .withDateReceived(new Date('2023-02-02'))
      .withReference('REF01234')
      .build();
    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report)
      .withId(FEE_RECORD_ID_ONE)
      .withFacilityId('11111111')
      .withExporter('Exporter 1')
      .withPaymentCurrency(PAYMENT_CURRENCY)
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency('JPY')
      .withPaymentExchangeRate(2)
      .withStatus('DOES_NOT_MATCH')
      .withPayments([payment])
      .build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report)
      .withId(FEE_RECORD_ID_TWO)
      .withFacilityId('22222222')
      .withExporter('Exporter 2')
      .withFeesPaidToUkefForThePeriod(200)
      .withFeesPaidToUkefForThePeriodCurrency('EUR')
      .withPaymentCurrency(PAYMENT_CURRENCY)
      .withPaymentExchangeRate(0.5)
      .withStatus('DOES_NOT_MATCH')
      .withPayments([payment])
      .build();
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordOne, feeRecordTwo]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);

    pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable
      .checkbox([FEE_RECORD_ID_ONE, FEE_RECORD_ID_TWO], PAYMENT_CURRENCY, FEE_RECORD_STATUS.DOES_NOT_MATCH)
      .click();

    cy.get('[type="submit"]').contains('Add a payment').click();
  });

  it('should render the add a payment page', () => {
    cy.get('h1').invoke('text').should('contain', 'Add a payment');
  });

  it('should render the selected fee record details', () => {
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().should('contain', '11111111');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'Exporter 1');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'JPY 100');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'GBP 50');

    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().should('contain', '22222222');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'Exporter 2');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'EUR 200');
    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'GBP 400');

    pages.utilisationReportAddPaymentPage.selectedReportedFeesDetailsTable().contains('Total reported payments GBP 450').should('exist');
  });

  it('should render the recorded payment details table', () => {
    pages.utilisationReportAddPaymentPage.recordedPaymentsDetailsTable().should('contain', 'GBP 60');
    pages.utilisationReportAddPaymentPage.recordedPaymentsDetailsTable().should('contain', '2 Feb 2023');
    pages.utilisationReportAddPaymentPage.recordedPaymentsDetailsTable().should('contain', 'REF01234');
  });

  it('should display errors when form submitted with invalid values', () => {
    cy.keyboardInput(cy.getInputByLabelText('Amount received'), '100');

    cy.completeDateFormFields({ idPrefix: 'payment-date', day: '56', month: '12', year: '2023' });

    cy.clickContinueButton();

    cy.get('a').should('contain', 'Select payment currency');
    cy.get('a').should('contain', 'The date payment received must be a real date');
    cy.get('a').should('contain', 'Select add another payment choice');

    cy.get('form').should('contain', 'Select payment currency');
    cy.get('form').should('contain', 'The date payment received must be a real date');
    cy.get('form').should('contain', 'Select add another payment choice');

    cy.getInputByLabelText('Amount received').should('have.value', '100');
    cy.getInputByLabelText('Day').should('have.value', '56');
    cy.getInputByLabelText('Month').should('have.value', '12');
    cy.getInputByLabelText('Year').should('have.value', '2023');
  });

  it('submits form and redirects to premium payments page when user submits form with valid values and user selects no to adding another payment', () => {
    cy.getInputByLabelText('GBP').click();

    // 391 = (100 / 2) + (200 / 0.5) - 60 + a little extra under the tolerance
    cy.keyboardInput(cy.getInputByLabelText('Amount received'), '391');

    cy.completeDateFormFields({ idPrefix: 'payment-date', day: '12', month: '12', year: '2023' });

    cy.getInputByLabelText('No').click();

    cy.clickContinueButton();

    cy.contains('Premium payments').should('exist');

    cy.assertText(pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.status(FEE_RECORD_ID_ONE), FEE_RECORD_STATUS.MATCH);
  });

  it('redirects user to premium payments tab with match success notification when taken to match whilst trying to add another payment', () => {
    cy.getInputByLabelText('GBP').click();

    // 391 = (100 / 2) + (200 / 0.5) - 60 + a little extra under the tolerance
    cy.keyboardInput(cy.getInputByLabelText('Amount received'), '391');

    cy.completeDateFormFields({ idPrefix: 'payment-date', day: '12', month: '12', year: '2023' });

    cy.getInputByLabelText('Yes').click();

    cy.clickContinueButton();

    cy.contains('Premium payments').should('exist');

    cy.assertText(pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.status(FEE_RECORD_ID_ONE), FEE_RECORD_STATUS.MATCH);

    cy.assertText(pages.utilisationReportPage.premiumPaymentsTab.matchSuccessNotificationHeading(), 'Match payment recorded');

    cy.assertText(
      pages.utilisationReportPage.premiumPaymentsTab.matchSuccessNotificationMessage(),
      'The fee(s) are now at a Match state. Further payments cannot be added to the fee record.',
    );
  });

  it('submits form and reloads the page with no values when user submits form with valid values and user selects yes to adding another payment', () => {
    cy.getInputByLabelText('GBP').click();
    cy.keyboardInput(cy.getInputByLabelText('Amount received'), '100');
    cy.completeDateFormFields({ idPrefix: 'payment-date', day: '12', month: '12', year: '2023' });
    cy.getInputByLabelText('Yes').click();

    cy.clickContinueButton();

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
