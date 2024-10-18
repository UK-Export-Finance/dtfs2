import { startOfMonth, subMonths, subYears, addDays } from 'date-fns';
import {
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  FacilityUtilisationDataEntityMockBuilder,
  CURRENCY,
  FEE_RECORD_STATUS,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import relative from '../../relativeURL';

context('PDC_RECONCILE users can generate keying data', () => {
  const BANK_ID = '961';
  const REPORT_ID = 1;
  const PAYMENT_CURRENCY = CURRENCY.GBP;
  const TODAY = new Date();

  const START_OF_CURRENT_REPORT_PERIOD = startOfMonth(subMonths(TODAY, 1));
  const END_OF_CURRENT_REPORT_PERIOD = startOfMonth(TODAY);
  const CURRENT_REPORT_PERIOD = {
    start: { month: START_OF_CURRENT_REPORT_PERIOD.getMonth() + 1, year: START_OF_CURRENT_REPORT_PERIOD.getFullYear() },
    end: { month: START_OF_CURRENT_REPORT_PERIOD.getMonth() + 1, year: START_OF_CURRENT_REPORT_PERIOD.getFullYear() },
  };
  const CURRENT_PERIOD_UTILISATION = 180000;
  const CURRENT_PERIOD_UTILISATION_REPORT = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
    .withId(REPORT_ID)
    .withBankId(BANK_ID)
    .withReportPeriod(CURRENT_REPORT_PERIOD)
    .build();

  const START_OF_PREVIOUS_REPORT_PERIOD = startOfMonth(subMonths(TODAY, 2));
  const PREVIOUS_REPORT_PERIOD = {
    start: { month: START_OF_PREVIOUS_REPORT_PERIOD.getMonth() + 1, year: START_OF_PREVIOUS_REPORT_PERIOD.getFullYear() },
    end: { month: START_OF_PREVIOUS_REPORT_PERIOD.getMonth() + 1, year: START_OF_PREVIOUS_REPORT_PERIOD.getFullYear() },
  };
  const PREVIOUS_PERIOD_FIXED_FEE = 1000;
  const PREVIOUS_PERIOD_UTILISATION = 200000;
  const FACILITY_UTILISATION_DATA = FacilityUtilisationDataEntityMockBuilder.forId('11111111')
    .withReportPeriod(PREVIOUS_REPORT_PERIOD)
    .withUtilisation(PREVIOUS_PERIOD_UTILISATION)
    .withFixedFee(PREVIOUS_PERIOD_FIXED_FEE)
    .build();

  const ONE_YEAR_AGO = subYears(TODAY, 1);
  const ONE_YEAR_FROM_CURRENT_REPORT_PERIOD_END = addDays(END_OF_CURRENT_REPORT_PERIOD, 365); // days left in cover period = 365

  const FIRST_FEE_RECORD_ID = '11';
  const SECOND_FEE_RECORD_ID = '22';

  const TFM_FACILITY = {
    facilitySnapshot: {
      coverStartDate: ONE_YEAR_AGO.getTime(),
      coverEndDate: ONE_YEAR_FROM_CURRENT_REPORT_PERIOD_END.getTime(), // days left in cover period = 365
      interestPercentage: 5,
      dayCountBasis: 365,
      value: 30,
      coverPercentage: 40,
      ukefFacilityId: FACILITY_UTILISATION_DATA.id,
    },
  };

  beforeEach(() => {
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [TFM_FACILITY]);

    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

    cy.task(NODE_TASKS.GET_ALL_BANKS).then((banks) => {
      const bankWithReportToReconcile = banks.find((bank) => bank.id === BANK_ID);
      cy.wrap(bankWithReportToReconcile).should('not.be.undefined');
    });
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [CURRENT_PERIOD_UTILISATION_REPORT]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);
  });

  it('can generate keying data when only one fee record for a facility is at MATCH status but does not generate the fixed fee adjustment or principal balance adjustment', () => {
    const matchingPayment = PaymentEntityMockBuilder.forCurrency(PAYMENT_CURRENCY).withAmount(100).build();
    const matchingFeeRecord = FeeRecordEntityMockBuilder.forReport(CURRENT_PERIOD_UTILISATION_REPORT)
      .withId(FIRST_FEE_RECORD_ID)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .withFacilityUtilisationData(FACILITY_UTILISATION_DATA)
      .withBaseCurrency(PAYMENT_CURRENCY)
      .withFacilityUtilisation(CURRENT_PERIOD_UTILISATION)
      .withPaymentCurrency(PAYMENT_CURRENCY)
      .withFeesPaidToUkefForThePeriodCurrency(PAYMENT_CURRENCY)
      .withFeesPaidToUkefForThePeriod(100)
      .withStatus(FEE_RECORD_STATUS.MATCH)
      .withPayments([matchingPayment])
      .build();

    const toDoFeeRecord = FeeRecordEntityMockBuilder.forReport(CURRENT_PERIOD_UTILISATION_REPORT)
      .withId(SECOND_FEE_RECORD_ID)
      .withFacilityUtilisationData(FACILITY_UTILISATION_DATA)
      .withBaseCurrency(PAYMENT_CURRENCY)
      .withFacilityUtilisation(CURRENT_PERIOD_UTILISATION)
      .withPaymentCurrency(PAYMENT_CURRENCY)
      .withFeesPaidToUkefForThePeriodCurrency(PAYMENT_CURRENCY)
      .withFeesPaidToUkefForThePeriod(100)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .build();

    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [matchingFeeRecord, toDoFeeRecord]);

    cy.visit(`utilisation-reports/${REPORT_ID}`);
    pages.utilisationReportPage.premiumPaymentsTab.generateKeyingDataButton().click();
    pages.checkKeyingDataPage.generateKeyingSheetDataButton().click();

    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}#keying-sheet`));

    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FIRST_FEE_RECORD_ID).should('contain', 'TO DO');
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(SECOND_FEE_RECORD_ID).should('not.exist');

    pages.utilisationReportPage.keyingSheetTab.fixedFeeAdjustmentDecrease(FIRST_FEE_RECORD_ID).should('contain', '-');
    pages.utilisationReportPage.keyingSheetTab.fixedFeeAdjustmentIncrease(FIRST_FEE_RECORD_ID).should('contain', '-');

    pages.utilisationReportPage.keyingSheetTab.principalBalanceAdjustmentDecrease(FIRST_FEE_RECORD_ID).should('contain', '-');
    pages.utilisationReportPage.keyingSheetTab.principalBalanceAdjustmentIncrease(FIRST_FEE_RECORD_ID).should('contain', '-');
  });

  it('calculates the fixed fee adjustment and principal balance adjustment when all fee records for a facility are at MATCH status for only one of the fee records for the facility', () => {
    const matchingPayment = PaymentEntityMockBuilder.forCurrency(PAYMENT_CURRENCY).withAmount(200).build();
    const matchingFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(CURRENT_PERIOD_UTILISATION_REPORT)
        .withId(FIRST_FEE_RECORD_ID)
        .withStatus(FEE_RECORD_STATUS.TO_DO)
        .withFacilityUtilisationData(FACILITY_UTILISATION_DATA)
        .withBaseCurrency(PAYMENT_CURRENCY)
        .withFacilityUtilisation(CURRENT_PERIOD_UTILISATION)
        .withPaymentCurrency(PAYMENT_CURRENCY)
        .withFeesPaidToUkefForThePeriodCurrency(PAYMENT_CURRENCY)
        .withFeesPaidToUkefForThePeriod(100)
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withPayments([matchingPayment])
        .build(),
      FeeRecordEntityMockBuilder.forReport(CURRENT_PERIOD_UTILISATION_REPORT)
        .withId(SECOND_FEE_RECORD_ID)
        .withStatus(FEE_RECORD_STATUS.TO_DO)
        .withFacilityUtilisationData(FACILITY_UTILISATION_DATA)
        .withBaseCurrency(PAYMENT_CURRENCY)
        .withFacilityUtilisation(CURRENT_PERIOD_UTILISATION)
        .withPaymentCurrency(PAYMENT_CURRENCY)
        .withFeesPaidToUkefForThePeriodCurrency(PAYMENT_CURRENCY)
        .withFeesPaidToUkefForThePeriod(100)
        .withStatus(FEE_RECORD_STATUS.MATCH)
        .withPayments([matchingPayment])
        .build(),
    ];

    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, matchingFeeRecords);

    cy.visit(`utilisation-reports/${REPORT_ID}`);
    pages.utilisationReportPage.premiumPaymentsTab.generateKeyingDataButton().click();
    pages.checkKeyingDataPage.generateKeyingSheetDataButton().click();

    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}#keying-sheet`));

    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FIRST_FEE_RECORD_ID).should('contain', 'TO DO');
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(SECOND_FEE_RECORD_ID).should('contain', 'TO DO');

    /**
     * The principal balance adjustment is simply the
     * difference between the current and previous
     * utilisation
     */
    const expectedPrincipalBalanceAdjustment = '128,000.00'; // 200000 - (180000 * 0.4), DECREASE

    /**
     * The fixed fee adjustment is the difference between
     * the current fixed fee and the previous fixed fee,
     * where the previous fixed fee is equal to the value
     * stored on the FacilityUtilisationData table, and the
     * current fixed fee is given by the product of the below
     * values:
     * - utilisation: 180000
     * - cover percentage: 40
     * - ukef utilisation: 180000 * 0.4 = 72000
     * - bank margin: 0.9 (this is a fixed, constant value)
     * - interest percentage: 0.05
     * - number of days left in cover period divided by day count basis: 365 / 365 = 1
     * - (72000 * 0.9 * 0.05 * 1) = 3240
     * This yields a current utilisation value of 3240
     */
    const expectedFixedFeeAdjustment = '2,240.00'; // 3240  - 1000, INCREASE

    pages.utilisationReportPage.keyingSheetTab.fixedFeeAdjustmentDecrease(FIRST_FEE_RECORD_ID).should('contain', '-');
    pages.utilisationReportPage.keyingSheetTab.fixedFeeAdjustmentIncrease(FIRST_FEE_RECORD_ID).should('contain', expectedFixedFeeAdjustment);
    pages.utilisationReportPage.keyingSheetTab.principalBalanceAdjustmentDecrease(FIRST_FEE_RECORD_ID).should('contain', expectedPrincipalBalanceAdjustment);
    pages.utilisationReportPage.keyingSheetTab.principalBalanceAdjustmentIncrease(FIRST_FEE_RECORD_ID).should('contain', '-');

    pages.utilisationReportPage.keyingSheetTab.fixedFeeAdjustmentDecrease(SECOND_FEE_RECORD_ID).should('contain', '-');
    pages.utilisationReportPage.keyingSheetTab.fixedFeeAdjustmentIncrease(SECOND_FEE_RECORD_ID).should('contain', '-');
    pages.utilisationReportPage.keyingSheetTab.principalBalanceAdjustmentDecrease(SECOND_FEE_RECORD_ID).should('contain', '-');
    pages.utilisationReportPage.keyingSheetTab.principalBalanceAdjustmentIncrease(SECOND_FEE_RECORD_ID).should('contain', '-');
  });
});
