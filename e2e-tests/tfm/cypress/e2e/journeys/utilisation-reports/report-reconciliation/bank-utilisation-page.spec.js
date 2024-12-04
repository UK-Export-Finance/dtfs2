import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  REPORT_NOT_RECEIVED,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntityMockBuilder,
  toIsoMonthStamp,
  toMonthYearString,
  getPreviousReportPeriodForBankScheduleByMonth,
  FEE_RECORD_STATUS,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';

const { utilisationReportPage } = pages;

context('Bank utilisation report page', () => {
  const SUBMISSION_MONTH = toIsoMonthStamp(new Date());
  const BANK_ID = '961';
  const REPORT_ID = 1;
  const FEE_RECORD_ID_ONE = '11';
  const FEE_RECORD_ID_TWO = '22';
  const FACILITY_ID_ONE = '11111111';
  const FACILITY_ID_TWO = '22222222';
  let bankName;
  let reportPeriodString;

  const aTfmFacilityFacilitySnapshot = () => ({
    coverStartDate: new Date().getTime(),
    coverEndDate: new Date().getTime(),
    interestPercentage: 5,
    dayCountBasis: 365,
    coverPercentage: 80,
    value: 100000,
  });

  const TFM_FACILITIES = [
    {
      facilitySnapshot: { ...aTfmFacilityFacilitySnapshot(), ukefFacilityId: FACILITY_ID_ONE },
    },
    {
      facilitySnapshot: { ...aTfmFacilityFacilitySnapshot(), ukefFacilityId: FACILITY_ID_TWO },
    },
  ];

  before(() => {
    const visibleBanks = [];

    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, TFM_FACILITIES);

    cy.task(NODE_TASKS.GET_ALL_BANKS).then((getAllBanksResult) => {
      getAllBanksResult
        .filter((bank) => bank.isVisibleInTfmUtilisationReports)
        .forEach((visibleBank) => {
          visibleBanks.push(visibleBank);
        });
    });

    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

    cy.wrap(visibleBanks).each((bank) => {
      const reportPeriod = getPreviousReportPeriodForBankScheduleByMonth(bank.utilisationReportPeriodSchedule, SUBMISSION_MONTH);

      reportPeriodString = toMonthYearString(reportPeriod.start);

      if (bank.id === BANK_ID) {
        bankName = bank.name;

        const reportToReconcile = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
          .withId(REPORT_ID)
          .withBankId(BANK_ID)
          .withReportPeriod(reportPeriod)
          .build();
        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [reportToReconcile]);

        const paymentMatchingFeeRecordOneAndTwo = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
          .withAmount(450)
          .withDateReceived(new Date('2023-02-02'))
          .withReference('REF01234')
          .build();
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(reportToReconcile)
          .withId(FEE_RECORD_ID_ONE)
          .withFacilityId(FACILITY_ID_ONE)
          .withExporter('Exporter 1')
          .withPaymentCurrency(CURRENCY.GBP)
          .withFeesPaidToUkefForThePeriod(100)
          .withFeesPaidToUkefForThePeriodCurrency('JPY')
          .withPaymentExchangeRate(2)
          .withStatus(FEE_RECORD_STATUS.MATCH)
          .withPayments([paymentMatchingFeeRecordOneAndTwo])
          .build();

        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(reportToReconcile)
          .withId(FEE_RECORD_ID_TWO)
          .withFacilityId(FACILITY_ID_TWO)
          .withExporter('Exporter 2')
          .withFeesPaidToUkefForThePeriod(200)
          .withFeesPaidToUkefForThePeriodCurrency('EUR')
          .withPaymentCurrency(CURRENCY.GBP)
          .withPaymentExchangeRate(0.5)
          .withStatus(FEE_RECORD_STATUS.MATCH)
          .withPayments([paymentMatchingFeeRecordOneAndTwo])
          .build();
        cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecordOne, feeRecordTwo]);
      } else {
        const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(REPORT_NOT_RECEIVED)
          .withId(bank.id)
          .withBankId(bank.id)
          .withReportPeriod(reportPeriod)
          .build();
        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockUtilisationReport]);
      }
    });
  });

  beforeEach(() => {
    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);
  });

  describe('when navigating to the page', () => {
    it('should display the page heading and date', () => {
      cy.assertText(utilisationReportPage.heading(), bankName);

      cy.assertText(utilisationReportPage.reportPeriodHeading(), reportPeriodString);
    });

    it('should display the correct tabs', () => {
      cy.assertText(utilisationReportPage.premiumPaymentsTabLink(), 'Premium payments');
      cy.assertText(utilisationReportPage.keyingSheetTabLink(), 'Keying sheet');
      cy.assertText(utilisationReportPage.paymentDetailsTabLink(), 'Payment details');
      cy.assertText(utilisationReportPage.utilisationTabLink(), 'Utilisation');
      cy.assertText(utilisationReportPage.recordCorrectionHistoryLink(), 'Record correction history');
    });
  });
});
