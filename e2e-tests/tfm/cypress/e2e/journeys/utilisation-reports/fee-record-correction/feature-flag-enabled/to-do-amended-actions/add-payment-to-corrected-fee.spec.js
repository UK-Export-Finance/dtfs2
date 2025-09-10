import { FeeRecordEntityMockBuilder, UtilisationReportEntityMockBuilder, FeeRecordCorrectionEntityMockBuilder } from "@ukef/dtfs2-common/test-helpers";
import {
  FEE_RECORD_STATUS,
  PENDING_RECONCILIATION,
  CURRENCY,
  RECORD_CORRECTION_REASON,
} from '@ukef/dtfs2-common';
import pages from '../../../../../pages';
import USERS from '../../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../../e2e-fixtures';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context('When fee record correction feature flag is enabled', () => {
  context('PDC_RECONCILE users can add payments to fee records that have been corrected', () => {
    const BANK_ID = '961';
    const REPORT_ID = 1;

    const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(REPORT_ID).withBankId(BANK_ID).build();

    const correctionOneCorrectedFee = 200;

    const correctedFeeRecordOne = FeeRecordEntityMockBuilder.forReport(report)
      .withId(11)
      .withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED)
      .withFacilityId('11111111')
      .withExporter('Exporter 1')
      .withPaymentCurrency(CURRENCY.GBP)
      .withFeesPaidToUkefForThePeriod(correctionOneCorrectedFee)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPaymentExchangeRate(1)
      .withPayments([])
      .build();

    const correctionOne = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(correctedFeeRecordOne, true)
      .withId(111)
      .withReasons([RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT])
      .withCorrectedValues({ feesPaidToUkefForThePeriod: correctionOneCorrectedFee })
      .withPreviousValues({ feesPaidToUkefForThePeriod: 100 })
      .build();

    const correctionTwoCorrectedCurrency = CURRENCY.GBP;

    const correctedFeeRecordTwo = FeeRecordEntityMockBuilder.forReport(report)
      .withId(22)
      .withStatus(FEE_RECORD_STATUS.TO_DO_AMENDED)
      .withFacilityId('22222222')
      .withExporter('Exporter 2')
      .withPaymentCurrency(correctionTwoCorrectedCurrency)
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency(correctionTwoCorrectedCurrency)
      .withPaymentExchangeRate(1)
      .withPayments([])
      .build();

    const correctionTwo = FeeRecordCorrectionEntityMockBuilder.forFeeRecordAndIsCompleted(correctedFeeRecordOne, true)
      .withId(222)
      .withReasons([RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT])
      .withCorrectedValues({ feesPaidToUkefForThePeriodCurrency: correctionTwoCorrectedCurrency })
      .withPreviousValues({ feesPaidToUkefForThePeriodCurrency: CURRENCY.EUR })
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

      const feeRecords = [correctedFeeRecordOne, correctedFeeRecordTwo, feeRecordWithoutCorrection];
      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

      const corrections = [correctionOne, correctionTwo];
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

    it(`should be able to add payment to fee record at ${FEE_RECORD_STATUS.TO_DO_AMENDED}`, () => {
      premiumPaymentsTable.checkbox([correctedFeeRecordOne.id], correctedFeeRecordOne.paymentCurrency, correctedFeeRecordOne.status).click();

      premiumPaymentsContent.addAPaymentButton().click();

      cy.getInputByLabelText(correctedFeeRecordOne.paymentCurrency).click();

      cy.keyboardInput(cy.getInputByLabelText('Amount received'), correctedFeeRecordOne.feesPaidToUkefForThePeriod);

      cy.completeDateFormFields({ idPrefix: 'payment-date', day: '12', month: '12', year: '2023' });

      cy.getInputByLabelText('No').click();

      cy.clickContinueButton();

      cy.assertText(premiumPaymentsTable.status(correctedFeeRecordOne.id), 'Match');
    });

    it(`should be able to add payment to fee records with a combination of ${FEE_RECORD_STATUS.TO_DO_AMENDED} and ${FEE_RECORD_STATUS.TO_DO}`, () => {
      premiumPaymentsTable.checkbox([correctedFeeRecordTwo.id], correctedFeeRecordTwo.paymentCurrency, correctedFeeRecordTwo.status).click();
      premiumPaymentsTable.checkbox([feeRecordWithoutCorrection.id], feeRecordWithoutCorrection.paymentCurrency, feeRecordWithoutCorrection.status).click();

      premiumPaymentsContent.addAPaymentButton().click();

      cy.getInputByLabelText(correctedFeeRecordTwo.paymentCurrency).click();

      cy.keyboardInput(cy.getInputByLabelText('Amount received'), correctedFeeRecordTwo.feesPaidToUkefForThePeriod);

      cy.completeDateFormFields({ idPrefix: 'payment-date', day: '12', month: '12', year: '2023' });

      cy.getInputByLabelText('No').click();

      cy.clickContinueButton();

      cy.assertText(premiumPaymentsTable.status(correctedFeeRecordTwo.id), 'Does not match');

      // We assert this row does not have it's own status as it should now grouped with the row above
      cy.assertText(premiumPaymentsTable.status(feeRecordWithoutCorrection.id), '');
    });
  });
});
