import {
  TFM_AMENDMENT_STATUS,
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
  convertMillisecondsToSeconds,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import relative from '../../../relativeURL';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';

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

  const firstValueString = '1,000,000.00';
  const secondValueString = '300,000.00';
  const thirdValueString = '1,050,000.00';

  const firstExposureString = '400,000.00';
  const secondExposureString = '169,999.99';
  const thirdExposureString = '72,000.00';

  const reportPeriod = { start: { month: 12, year: 2023 }, end: { month: 2, year: 2024 } };
  const dateWithinReportPeriod = new Date('2024-01-01');
  const dateAfterReportPeriodEnd = new Date('2024-03-01');

  const { utilisationContent } = pages.utilisationReportPage.tabs;

  before(() => {
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
          status: TFM_AMENDMENT_STATUS.COMPLETED,
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
          status: TFM_AMENDMENT_STATUS.COMPLETED,
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
        value: 1050000,
      },
    };

    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, [tfmFacilityOne, tfmFacilityTwo, tfmFacilityThree]);

    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

    const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
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
  });

  beforeEach(() => {
    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);

    pages.utilisationReportPage.tabs.utilisation().click();
  });

  it('should render the utilisation for each fee record', () => {
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_ONE).facilityId(), FACILITY_ID_ONE);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_ONE).exporter(), firstExporter);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_ONE).baseCurrency(), CURRENCY.GBP);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_ONE).value(), '1,000,000.00');
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_ONE).utilisation(), firstUtilisationString);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_ONE).coverPercentage(), '80%');
    // 80% of 500,000 is 400,000
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_ONE).exposure(), '400,000.00');
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_ONE).feesAccrued(), `${CURRENCY.EUR} 300.00`);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_ONE).feesPayable(), `${CURRENCY.JPY} 100.00`);

    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_TWO).facilityId(), FACILITY_ID_TWO);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_TWO).exporter(), secondExporter);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_TWO).baseCurrency(), CURRENCY.GBP);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_TWO).value(), '300,000.00');
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_TWO).utilisation(), secondUtilisationString);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_TWO).coverPercentage(), '85%');
    // 85% of 199,999.99 is 169,999.9915
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_TWO).exposure(), '169,999.99');
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_TWO).feesAccrued(), `${CURRENCY.EUR} 200.00`);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_TWO).feesPayable(), `${CURRENCY.GBP} 100.00`);

    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_THREE).facilityId(), FACILITY_ID_THREE);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_THREE).exporter(), thirdExporter);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_THREE).baseCurrency(), CURRENCY.GBP);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_THREE).value(), '1,050,000.00');
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_THREE).utilisation(), thirdUtilisationString);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_THREE).coverPercentage(), '80%');
    // 85% of 90,000 is 72,000
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_THREE).exposure(), '72,000.00');
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_THREE).feesAccrued(), `${CURRENCY.EUR} 200.00`);
    cy.assertText(utilisationContent.table.row(FEE_RECORD_ID_THREE).feesPayable(), `${CURRENCY.GBP} 100.00`);
  });

  describe('when sorting by ascending utilisation', () => {
    it('should sort the reports correctly by utilisation', () => {
      utilisationContent.table.utilisationHeader().click();

      cy.assertText(utilisationContent.table.rowIndex(0).utilisation(), thirdUtilisationString);
      cy.assertText(utilisationContent.table.rowIndex(1).utilisation(), secondUtilisationString);
      cy.assertText(utilisationContent.table.rowIndex(2).utilisation(), firstUtilisationString);
    });
  });

  describe('when sorting by descending utilisation', () => {
    it('should sort the reports correctly by utilisation', () => {
      // click twice for descending sort
      utilisationContent.table.utilisationHeader().click();
      utilisationContent.table.utilisationHeader().click();

      cy.assertText(utilisationContent.table.rowIndex(0).utilisation(), firstUtilisationString);
      cy.assertText(utilisationContent.table.rowIndex(1).utilisation(), secondUtilisationString);
      cy.assertText(utilisationContent.table.rowIndex(2).utilisation(), thirdUtilisationString);
    });
  });

  describe('when sorting by ascending value', () => {
    it('should sort the reports correctly by value', () => {
      utilisationContent.table.valueHeader().click();

      cy.assertText(utilisationContent.table.rowIndex(0).value(), secondValueString);
      cy.assertText(utilisationContent.table.rowIndex(1).value(), firstValueString);
      cy.assertText(utilisationContent.table.rowIndex(2).value(), thirdValueString);
    });
  });

  describe('when sorting by descending value', () => {
    it('should sort the reports correctly by value', () => {
      // click twice for descending sort
      utilisationContent.table.valueHeader().click();
      utilisationContent.table.valueHeader().click();

      cy.assertText(utilisationContent.table.rowIndex(0).value(), thirdValueString);
      cy.assertText(utilisationContent.table.rowIndex(1).value(), firstValueString);
      cy.assertText(utilisationContent.table.rowIndex(2).value(), secondValueString);
    });
  });

  describe('when sorting by ascending exposure', () => {
    it('should sort the reports correctly by exposure', () => {
      utilisationContent.table.exposureHeader().click();

      cy.assertText(utilisationContent.table.rowIndex(0).exposure(), thirdExposureString);
      cy.assertText(utilisationContent.table.rowIndex(1).exposure(), secondExposureString);
      cy.assertText(utilisationContent.table.rowIndex(2).exposure(), firstExposureString);
    });
  });

  describe('when sorting by descending exposure', () => {
    it('should sort the reports correctly by exposure', () => {
      // click twice for descending sort
      utilisationContent.table.exposureHeader().click();
      utilisationContent.table.exposureHeader().click();

      cy.assertText(utilisationContent.table.rowIndex(0).exposure(), firstExposureString);
      cy.assertText(utilisationContent.table.rowIndex(1).exposure(), secondExposureString);
      cy.assertText(utilisationContent.table.rowIndex(2).exposure(), thirdExposureString);
    });
  });

  it('should render a link to download the report', () => {
    cy.assertText(utilisationContent.downloadReportLink(), 'Download the report submitted by the bank as a CSV');

    utilisationContent.downloadReportLink().click();
    cy.url().should('eq', relative(`/utilisation-reports/${REPORT_ID}/download`));
  });
});
