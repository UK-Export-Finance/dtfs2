import {
  FeeRecordEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntityMockBuilder,
  FacilityUtilisationDataEntityMockBuilder,
  PaymentEntityMockBuilder,
  AMENDMENT_STATUS,
  CURRENCY,
  FEE_RECORD_STATUS,
  convertMillisecondsToSeconds,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import relative from '../../../relativeURL';

/**
 * This test is skipped because fixed fee adjustments are temporarily turned off.
 *
 * TODO FN-3639: Remove this skip and update with new calculation requirements.
 */
context.skip('Fixed fee calculation uses effective amendment to cover end date at report period end', () => {
  const bankId = '961';
  const reportId = 1;
  const facilityId = '12345678';
  const feeRecordId = 2;

  const reportPeriod = { start: { month: 12, year: 2023 }, end: { month: 2, year: 2024 } };
  const dateBeforeReportPeriodEnd = new Date('2024-01-01');
  const dateBeforeDateBeforeReportPeriodEnd = new Date('2023-12-01');
  const dateAfterReportPeriodEnd = new Date('2024-03-01');

  const report = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withReportPeriod(reportPeriod)
    .withBankId(bankId)
    .build();

  const facilityUtilisationData = FacilityUtilisationDataEntityMockBuilder.forId(facilityId).withFixedFee(700).build();

  const paymentCurrency = CURRENCY.GBP;
  const paymentAmount = 100;
  const matchingPayment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(paymentAmount).build();
  const feeRecord = FeeRecordEntityMockBuilder.forReport(report)
    .withStatus(FEE_RECORD_STATUS.MATCH)
    .withId(feeRecordId)
    .withFacilityUtilisation(1)
    .withFacilityUtilisationData(facilityUtilisationData)
    .withPaymentCurrency(paymentCurrency)
    .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
    .withFeesPaidToUkefForThePeriod(paymentAmount)
    .withPayments([matchingPayment])
    .build();

  const tfmFacility = {
    facilitySnapshot: {
      coverStartDate: new Date('2023-01-01').getTime(),
      // 1095 days after report period end
      coverEndDate: new Date('2027-03-01').getTime(),
      interestPercentage: 100,
      dayCountBasis: 1,
      value: 700000,
      coverPercentage: 100,
      ukefFacilityId: facilityId,
    },
    amendments: [
      {
        status: AMENDMENT_STATUS.COMPLETED,
        // Effective date is stored as unix epoch time in seconds not milliseconds.
        effectiveDate: convertMillisecondsToSeconds(dateAfterReportPeriodEnd.getTime()),
        // 365 days after report period end
        coverEndDate: new Date('2025-03-01').getTime(),
      },
      {
        status: AMENDMENT_STATUS.IN_PROGRESS,
        // Effective date is stored as unix epoch time in seconds not milliseconds.
        effectiveDate: convertMillisecondsToSeconds(dateBeforeReportPeriodEnd.getTime()),
        // 370 days after report period end
        coverEndDate: new Date('2025-03-06').getTime(),
      },
      {
        status: AMENDMENT_STATUS.COMPLETED,
        // Effective date is stored as unix epoch time in seconds not milliseconds.
        effectiveDate: convertMillisecondsToSeconds(dateBeforeDateBeforeReportPeriodEnd.getTime()),
        // 730 days after report period end
        coverEndDate: new Date('2026-03-01').getTime(),
      },
    ],
  };

  const { utilisationReportPage, checkKeyingDataPage } = pages;
  const { keyingSheetTab, premiumPaymentsTab } = utilisationReportPage;

  beforeEach(() => {
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [tfmFacility]);

    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${reportId}`);
  });

  it('should calculate the fixed fee adjustment using effective amendment at report period end', () => {
    premiumPaymentsTab.generateKeyingDataButton().click();
    checkKeyingDataPage.generateKeyingSheetDataButton().click();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}#keying-sheet`));

    /**
     * The fixed fee adjustment is the difference between
     * the current fixed fee and the previous fixed fee,
     * where the previous fixed fee is equal to the value
     * stored on the FacilityUtilisationData table, and the
     * current fixed fee is given by the product of the below
     * values:
     * - utilisation: 1
     * - coverPercentage: 100 / 100 = 1
     * - bank margin: 0.9 (this is a fixed, constant value)
     * - interest percentage: 100 / 100 = 1
     * - number of days left in cover period divided by day count basis: 730 / 1 = 730
     * This yields a current utilisation value of 730 * 0.9 = 657
     *
     * The adjustment is therefore the difference between the previous
     * fixed fee which was 700 and 657 which is a decrease of 43
     */
    cy.assertText(keyingSheetTab.fixedFeeAdjustmentDecrease(feeRecordId), '43.00');
    cy.assertText(keyingSheetTab.fixedFeeAdjustmentIncrease(feeRecordId), '-');
  });
});
