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
  context('PDC_RECONCILE users can remove a corrected fee from a payment', () => {
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
      .withCorrectedValues({ feesPaidToUkefForThePeriod: 200, feesPaidToUkefForThePeriodCurrency: null, facilityId: null, facilityUtilisation: null })
      .withPreviousValues({ feesPaidToUkefForThePeriod: 100, feesPaidToUkefForThePeriodCurrency: null, facilityId: null, facilityUtilisation: null })
      .build();

    const feeRecordWithoutCorrection = FeeRecordEntityMockBuilder.forReport(report)
      .withId(33)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .withFacilityId('33333333')
      .withExporter('Exporter 3')
      .withPaymentCurrency(CURRENCY.GBP)
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPaymentExchangeRate(1)
      .withPayments([])
      .build();

    const { premiumPaymentsContent } = pages.utilisationReportPage.tabs;
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

    it(`should be able to remove the corrected fee from the payment and status should go back to ${FEE_RECORD_STATUS.TO_DO_AMENDED}`, () => {
      cy.addPaymentToFeeRecords({
        feeRecords: [correctedFeeRecord, feeRecordWithoutCorrection],
        reportId: REPORT_ID,
        paymentCurrency: feeRecordWithoutCorrection.paymentCurrency,
        amountReceived: feeRecordWithoutCorrection.feesPaidToUkefForThePeriod,
      });

      cy.visit(`utilisation-reports/${REPORT_ID}`);

      pages.utilisationReportPage.tabs.paymentDetails().click();

      pages.utilisationReportPage.tabs.paymentDetailsContent.paymentLinks().first().click();

      pages.utilisationReportEditPaymentPage.feeRecordCheckbox(correctedFeeRecord.id).check();

      pages.utilisationReportEditPaymentPage.removeSelectedFeesButton().click();

      cy.clickBackLink();

      pages.utilisationReportPage.tabs.premiumPayments().click();

      cy.assertText(premiumPaymentsTable.status(correctedFeeRecord.id), 'To do (amended)');
      cy.assertText(premiumPaymentsTable.status(feeRecordWithoutCorrection.id), 'Match');
    });
  });
});
