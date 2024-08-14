import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { PDC_TEAMS } from '../../../fixtures/teams';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import relative from '../../relativeURL';

context(`${PDC_TEAMS.PDC_RECONCILE} users can add fee records to existing payments`, () => {
  beforeEach(() => {
    const BANK_ID = '961';
    const REPORT_ID = 1;
    const FEE_RECORD_ID_ONE = '11';
    const FEE_RECORD_ID_TWO = '22';
    const PAYMENT_CURRENCY = 'GBP';
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

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
      .withStatus('TO_DO')
      .build();
    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report)
      .withId(FEE_RECORD_ID_TWO)
      .withFacilityId('22222222')
      .withExporter('Exporter 2')
      .withPaymentCurrency(PAYMENT_CURRENCY)
      .withFeesPaidToUkefForThePeriod(200)
      .withFeesPaidToUkefForThePeriodCurrency('EUR')
      .withPaymentExchangeRate(0.5)
      .withPayments([payment])
      .withStatus('DOES_NOT_MATCH')
      .build();
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordOne, feeRecordTwo]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);
    cy.get(`[type="checkbox"][id="feeRecordIds-${FEE_RECORD_ID_ONE}-reportedPaymentsCurrency-${PAYMENT_CURRENCY}-status-${FEE_RECORD_STATUS.TO_DO}"]`).check();
    cy.get('[type="submit"]').contains('Add a payment').click();

    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/add-payment`));

    cy.get('[type="submit"]').contains('Add reported fee to an existing payment').click();
  });

  it('should render the add to an existing payment page', () => {
    cy.get('h1').invoke('text').should('contain', 'Add to an existing payment');
  });

  it('should render the selected fee record details', () => {
    pages.utilisationReportAddToAnExistingPaymentPage.selectedReportedFeesDetailsTable().should('contain', '11111111');
    pages.utilisationReportAddToAnExistingPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'Exporter 1');
    pages.utilisationReportAddToAnExistingPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'JPY 100');
    pages.utilisationReportAddToAnExistingPaymentPage.selectedReportedFeesDetailsTable().should('contain', 'GBP 50');

    pages.utilisationReportAddToAnExistingPaymentPage.selectedReportedFeesDetailsTable().contains('Total reported payments GBP 50').should('exist');
  });

  it('should render the available payments', () => {
    pages.utilisationReportAddToAnExistingPaymentPage.availablePaymentGroups().should('exist');
    pages.utilisationReportAddToAnExistingPaymentPage
      .availablePaymentGroups()
      .should('contain', 'There is one existing payment that the reported fees will be added to');
    pages.utilisationReportAddToAnExistingPaymentPage.availablePaymentGroups().should('contain', 'GBP 60.00');
    pages.utilisationReportAddToAnExistingPaymentPage.availablePaymentGroups().should('contain', 'Payment reference: REF01234');
  });
});
