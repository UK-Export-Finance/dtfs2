import {
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  UtilisationReportEntityMockBuilder,
  PENDING_RECONCILIATION,
  CURRENCY,
  FeeRecordCorrectionEntityMockBuilder,
  RECORD_CORRECTION_REASON,
} from '@ukef/dtfs2-common';
import pages from '../../../../../pages';
import USERS from '../../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../../e2e-fixtures';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context('When fee record correction feature flag is enabled', () => {
  context('PDC_RECONCILE users can delete a payment attached to a corrected fee', () => {
    const BANK_ID = '961';
    const REPORT_ID = 1;

    const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(REPORT_ID).withBankId(BANK_ID).build();

    const correctedFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
      .withId(11)
      .withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED)
      .withFacilityId('11111111')
      .withExporter('Exporter 1')
      .withPaymentCurrency(CURRENCY.GBP)
      .withFeesPaidToUkefForThePeriod(200)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPaymentExchangeRate(1)
      .withPayments([])
      .build();

    const correction = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(correctedFeeRecord, true)
      .withId(111)
      .withReasons([RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withCorrectedValues({ feesPaidToUkefForThePeriod: 200 })
      .withPreviousValues({ feesPaidToUkefForThePeriod: 100 })
      .build();

    const feeRecordWithoutCorrection = FeeRecordEntityMockBuilder.forReport(report)
      .withId(22)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .withFacilityId('22222222')
      .withExporter('Exporter 2')
      .withPaymentCurrency(CURRENCY.GBP)
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPaymentExchangeRate(1)
      .withPayments([])
      .build();

    const { utilisationReportAddPaymentPage, utilisationReportPage } = pages;
    const { premiumPaymentsContent } = utilisationReportPage.tabs;
    const { premiumPaymentsTable } = premiumPaymentsContent;

    before(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
      cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

      const feeRecords = [correctedFeeRecord, feeRecordWithoutCorrection];
      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

      const corrections = [correction];
      cy.task(NODE_TASKS.INSERT_FEE_RECORD_CORRECTIONS_INTO_DB, corrections);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
    });

    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${REPORT_ID}`);
    });

    after(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
      cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
    });

    it(`should be able to delete payment and status should go back to ${FEE_RECORD_STATUS.TO_DO_AMENDED}`, () => {
      cy.addPaymentToFeeRecords({
        feeRecords: [feeRecordWithoutCorrection],
        reportId: REPORT_ID,
        paymentCurrency: feeRecordWithoutCorrection.paymentCurrency,
        amountReceived: feeRecordWithoutCorrection.feesPaidToUkefForThePeriod + correctedFeeRecord.feesPaidToUkefForThePeriod,
      });

      cy.visit(`utilisation-reports/${REPORT_ID}`);

      premiumPaymentsTable.checkbox([correctedFeeRecord.id], correctedFeeRecord.paymentCurrency, correctedFeeRecord.status).click();

      premiumPaymentsContent.addAPaymentButton().click();

      utilisationReportAddPaymentPage.addFeesToAnExistingPaymentButton().click();

      cy.clickContinueButton();

      cy.assertText(premiumPaymentsTable.status(feeRecordWithoutCorrection.id), 'Match');

      // We assert this row does not have it's own status as it should now grouped with the non corrected fee
      cy.assertText(premiumPaymentsTable.status(correctedFeeRecord.id), '');
    });
  });
});
