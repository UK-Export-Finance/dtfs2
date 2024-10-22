import {
  AMENDMENT_STATUS,
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  convertMillisecondsToSeconds,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import relative from '../../relativeURL';
import { NODE_TASKS } from '../../../../../e2e-fixtures';

context('Users can view utilisation', () => {
  const BANK_ID = '961';
  const REPORT_ID = 1;
  const FEE_RECORD_ID_ONE = '11';
  const FEE_RECORD_ID_TWO = '22';
  const FEE_RECORD_ID_THREE = '33';
  const FACILITY_ID_ONE = '11111111';
  const FACILITY_ID_TWO = '22222222';
  const FACILITY_ID_THREE = '33333333';

  const firstExporter = 'Exporter 1';
  const secondExporter = 'Exporter 2';
  const thirdExporter = 'Exporter 3';

  const firstUtilisationString = '500,000.00';
  const secondUtilisationString = '199,999.99';
  const thirdUtilisationString = '90,000.00';

  const reportPeriod = { start: { month: 12, year: 2023 }, end: { month: 2, year: 2024 } };
  const dateWithinReportPeriod = new Date('2024-01-01');
  const dateAfterReportPeriodEnd = new Date('2024-03-01');

  beforeEach(() => {
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);

    const tfmFacilityOne = {
      facilitySnapshot: {
        ukefFacilityId: FACILITY_ID_ONE,
        coverPercentage: 80,
        value: 1000000,
      },
    };
    const tfmFacilityTwo = {
      facilitySnapshot: {
        ukefFacilityId: FACILITY_ID_TWO,
        coverPercentage: 85,
        value: 200000,
      },
      amendments: [
        {
          value: 350000,
          status: AMENDMENT_STATUS.COMPLETED,
          /**
           * This amendment is not in effect for the report in question
           * so should be ignored.
           *
           * Effective date is stored as unix epoch time in seconds.
           */
          effectiveDate: convertMillisecondsToSeconds(dateAfterReportPeriodEnd.getTime()),
        },
        {
          value: 300000,
          status: AMENDMENT_STATUS.COMPLETED,
          /**
           * This amendment is in effect for the report in question
           * so it's value should be used.
           *
           * Effective date is stored as unix epoch time in seconds.
           */
          effectiveDate: convertMillisecondsToSeconds(dateWithinReportPeriod.getTime()),
        },
      ],
    };

    const tfmFacilityThree = {
      facilitySnapshot: {
        ukefFacilityId: FACILITY_ID_THREE,
        coverPercentage: 80,
        value: 1000000,
      },
    };

    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [tfmFacilityOne, tfmFacilityTwo, tfmFacilityThree]);

    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

    const report = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
      .withId(REPORT_ID)
      .withReportPeriod(reportPeriod)
      .withBankId(BANK_ID)
      .build();
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

    const feeRecordOne = FeeRecordEntityMockBuilder.forReport(report)
      .withId(FEE_RECORD_ID_ONE)
      .withFacilityId(FACILITY_ID_ONE)
      .withExporter(firstExporter)
      .withBaseCurrency(CURRENCY.GBP)
      .withFacilityUtilisation(500000)
      .withTotalFeesAccruedForThePeriod(300)
      .withTotalFeesAccruedForThePeriodCurrency(CURRENCY.EUR)
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.JPY)
      .withPaymentExchangeRate(2)
      .withPaymentCurrency(CURRENCY.USD)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .build();

    const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(report)
      .withId(FEE_RECORD_ID_TWO)
      .withFacilityId(FACILITY_ID_TWO)
      .withExporter(secondExporter)
      .withBaseCurrency(CURRENCY.GBP)
      .withFacilityUtilisation(199999.99)
      .withTotalFeesAccruedForThePeriod(200)
      .withTotalFeesAccruedForThePeriodCurrency(CURRENCY.EUR)
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPaymentExchangeRate(2)
      .withPaymentCurrency(CURRENCY.USD)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .build();

    const feeRecordThree = FeeRecordEntityMockBuilder.forReport(report)
      .withId(FEE_RECORD_ID_THREE)
      .withFacilityId(FACILITY_ID_THREE)
      .withExporter(thirdExporter)
      .withBaseCurrency(CURRENCY.GBP)
      .withFacilityUtilisation(90000)
      .withTotalFeesAccruedForThePeriod(200)
      .withTotalFeesAccruedForThePeriodCurrency(CURRENCY.EUR)
      .withFeesPaidToUkefForThePeriod(100)
      .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
      .withPaymentExchangeRate(2)
      .withPaymentCurrency(CURRENCY.USD)
      .withStatus(FEE_RECORD_STATUS.TO_DO)
      .build();

    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordOne, feeRecordTwo, feeRecordThree]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);

    pages.utilisationReportPage.utilisationTabLink().click();
  });

  it('should render the utilisation for each fee record', () => {
    pages.utilisationReportPage.utilisationTab.table.row(FEE_RECORD_ID_ONE).within(() => {
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.facilityId(), FACILITY_ID_ONE);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.exporter(), firstExporter);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.baseCurrency(), CURRENCY.GBP);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.value(), '1,000,000.00');
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.utilisation(), firstUtilisationString);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.coverPercentage(), '80%');
      // 80% of 500,000 is 400,000
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.exposure(), '400,000.00');
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.feesAccrued(), `${CURRENCY.EUR} 300.00`);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.feesPayable(), `${CURRENCY.JPY} 100.00`);
    });

    pages.utilisationReportPage.utilisationTab.table.row(FEE_RECORD_ID_TWO).within(() => {
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.facilityId(), FACILITY_ID_TWO);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.exporter(), secondExporter);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.baseCurrency(), CURRENCY.GBP);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.value(), '300,000.00');
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.utilisation(), secondUtilisationString);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.coverPercentage(), '85%');
      // 85% of 199,999.99 is 169,999.9915
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.exposure(), '169,999.99');
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.feesAccrued(), `${CURRENCY.EUR} 200.00`);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.feesPayable(), `${CURRENCY.GBP} 100.00`);
    });

    pages.utilisationReportPage.utilisationTab.table.row(FEE_RECORD_ID_THREE).within(() => {
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.facilityId(), FACILITY_ID_THREE);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.exporter(), thirdExporter);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.baseCurrency(), CURRENCY.GBP);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.value(), '1,000,000.00');
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.utilisation(), thirdUtilisationString);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.coverPercentage(), '80%');
      // 85% of 90,000 is 72,000
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.exposure(), '72,000.00');
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.feesAccrued(), `${CURRENCY.EUR} 200.00`);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.feesPayable(), `${CURRENCY.GBP} 100.00`);
    });
  });

  describe('when sorting by ascending utilisation', () => {
    it('should sort the reports correctly by utilisation', () => {
      pages.utilisationReportPage.utilisationTab.table.utilisationHeader().click();

      cy.assertText(pages.utilisationReportPage.utilisationTab.table.utilisation().eq(0), thirdUtilisationString);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.utilisation().eq(1), secondUtilisationString);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.utilisation().eq(2), firstUtilisationString);
    });
  });

  describe('when sorting by descending utilisation', () => {
    it('should sort the reports correctly by utilisation', () => {
      // click twice for descending sort
      pages.utilisationReportPage.utilisationTab.table.utilisationHeader().click();
      pages.utilisationReportPage.utilisationTab.table.utilisationHeader().click();

      cy.assertText(pages.utilisationReportPage.utilisationTab.table.utilisation().eq(0), firstUtilisationString);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.utilisation().eq(1), secondUtilisationString);
      cy.assertText(pages.utilisationReportPage.utilisationTab.table.utilisation().eq(2), thirdUtilisationString);
    });
  });

  it('should render a link to download the report', () => {
    cy.assertText(pages.utilisationReportPage.utilisationTab.downloadReportLink(), 'Download the report submitted by the bank as a CSV');

    pages.utilisationReportPage.utilisationTab.downloadReportLink().click();
    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/download`));
  });
});
