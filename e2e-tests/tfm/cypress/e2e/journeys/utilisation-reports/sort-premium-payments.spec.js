import {
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import USERS from '../../../fixtures/users';

context(`users can sort premium payments table by total reported payments and total payments received and status`, () => {
  const bankId = '961';
  const reportId = 12;

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId(bankId)
    .withDateUploaded(new Date())
    .build();

  const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(1)
    .withFeesPaidToUkefForThePeriod(30)
    .withFeesPaidToUkefForThePeriodCurrency('EUR')
    .withStatus('DOES_NOT_MATCH')
    .withFacilityId('11111111')
    .build();
  const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(2)
    .withFeesPaidToUkefForThePeriod(20)
    .withFeesPaidToUkefForThePeriodCurrency('GBP')
    .withStatus('DOES_NOT_MATCH')
    .withFacilityId('22222222')
    .build();
  const thirdFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(3)
    .withFeesPaidToUkefForThePeriod(10)
    .withFeesPaidToUkefForThePeriodCurrency('USD')
    .withFacilityId('33333333')
    .build();

  const firstPayment = PaymentEntityMockBuilder.forCurrency('USD').withId(1).withAmount(200).withFeeRecords([firstFeeRecord]).build();
  const secondPayment = PaymentEntityMockBuilder.forCurrency('EUR').withId(2).withAmount(300).withFeeRecords([secondFeeRecord]).build();

  before(() => {
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [utilisationReport]);

    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [firstFeeRecord, secondFeeRecord, thirdFeeRecord]);
    cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [firstPayment, secondPayment]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`/utilisation-reports/${reportId}`);
  });

  describe('when status column heading is clicked', () => {
    it('should sort the rows by status', () => {
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.header.status().click();

      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.rows().eq(0).first('th').contains('33333333');
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.rows().eq(1).first('th').contains('22222222');
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.rows().eq(2).first('th').contains('11111111');
    });
  });

  describe('when total payment received column heading is clicked', () => {
    it('should sort the rows by total payment received', () => {
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.header.totalPaymentsReceived().click();

      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.rows().eq(0).first('th').contains('33333333');
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.rows().eq(1).first('th').contains('22222222');
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.rows().eq(2).first('th').contains('11111111');
    });
  });

  describe('when total reported payments column heading is clicked', () => {
    it('should sort the rows by total reported payments', () => {
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.header.totalReportedPayments().click();

      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.rows().eq(0).first('th').contains('11111111');
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.rows().eq(1).first('th').contains('22222222');
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.rows().eq(2).first('th').contains('33333333');
    });
  });
});
