import {
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  toIsoMonthStamp,
  getPreviousReportPeriodForBankScheduleByMonth,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { NODE_TASKS } from '../../../../../e2e-fixtures';

context('PDC_RECONCILE users can reconcile fee records', () => {
  const SUBMISSION_MONTH = toIsoMonthStamp(new Date());
  const BANK_ID = '961';
  const REPORT_ID = 1;
  const FEE_RECORD_ID_ONE = '11';
  const FEE_RECORD_ID_TWO = '22';
  const FACILITY_ID_ONE = '11111111';
  const FACILITY_ID_TWO = '22222222';

  const aTfmFacilityFacilitySnapshot = () => ({
    coverStartDate: new Date().getTime(),
    coverEndDate: new Date().getTime(),
    interestPercentage: 5,
    dayCountBasis: 365,
  });

  const TFM_FACILITIES = [
    {
      facilitySnapshot: { ...aTfmFacilityFacilitySnapshot(), ukefFacilityId: FACILITY_ID_ONE },
    },
    {
      facilitySnapshot: { ...aTfmFacilityFacilitySnapshot(), ukefFacilityId: FACILITY_ID_TWO },
    },
  ];

  beforeEach(() => {
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

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    cy.wrap(visibleBanks).each((bank) => {
      const reportPeriod = getPreviousReportPeriodForBankScheduleByMonth(bank.utilisationReportPeriodSchedule, SUBMISSION_MONTH);

      if (bank.id === BANK_ID) {
        const reportToReconcile = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
          .withId(REPORT_ID)
          .withBankId(BANK_ID)
          .withReportPeriod(reportPeriod)
          .build();
        const paymentMatchingFeeRecordOneAndTwo = PaymentEntityMockBuilder.forCurrency('GBP')
          .withAmount(450)
          .withDateReceived(new Date('2023-02-02'))
          .withReference('REF01234')
          .build();
        const feeRecordOne = FeeRecordEntityMockBuilder.forReport(undefined)
          .withId(FEE_RECORD_ID_ONE)
          .withFacilityId(FACILITY_ID_ONE)
          .withExporter('Exporter 1')
          .withPaymentCurrency('GBP')
          .withFeesPaidToUkefForThePeriod(100)
          .withFeesPaidToUkefForThePeriodCurrency('JPY')
          .withPaymentExchangeRate(2)
          .withStatus('MATCH')
          .withPayments([paymentMatchingFeeRecordOneAndTwo])
          .build();
        const feeRecordTwo = FeeRecordEntityMockBuilder.forReport(undefined)
          .withId(FEE_RECORD_ID_TWO)
          .withFacilityId(FACILITY_ID_TWO)
          .withExporter('Exporter 2')
          .withFeesPaidToUkefForThePeriod(200)
          .withFeesPaidToUkefForThePeriodCurrency('EUR')
          .withPaymentCurrency('GBP')
          .withPaymentExchangeRate(0.5)
          .withStatus('MATCH')
          .withPayments([paymentMatchingFeeRecordOneAndTwo])
          .build();
        reportToReconcile.feeRecords = [feeRecordOne, feeRecordTwo];
        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [reportToReconcile]);
      } else {
        const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
          .withId(bank.id)
          .withBankId(bank.id)
          .withReportPeriod(reportPeriod)
          .build();
        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockUtilisationReport]);
      }
    });

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);
    pages.utilisationReportPage.premiumPaymentsTab.generateKeyingDataButton().click();
    pages.checkKeyingDataPage.generateKeyingSheetDataButton().click();
  });

  it('can mark keying sheet rows as done and to do', () => {
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_ONE).should('contain', 'TO DO');

    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_ONE).within(() => cy.get('input[type="checkbox"]').click());
    pages.utilisationReportPage.keyingSheetTab.markAsDoneButton().click();
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_ONE).should('contain', 'DONE');

    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_ONE).within(() => cy.get('input[type="checkbox"]').click());
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_TWO).within(() => cy.get('input[type="checkbox"]').click());
    pages.utilisationReportPage.keyingSheetTab.markAsToDoButton().click();
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_ONE).should('contain', 'TO DO');
  });

  it('updates report status when all fee records are reconciled and when some are unreconciled', () => {
    pages.utilisationReportPage.keyingSheetTab.selectAllCheckbox().click();
    pages.utilisationReportPage.keyingSheetTab.markAsDoneButton().click();

    pages.utilisationReportPage.bankReportsNavLink().click();
    pages.utilisationReportsSummaryPage.tableRowSelector(BANK_ID, SUBMISSION_MONTH).should('contain', 'Report completed');

    pages.utilisationReportsSummaryPage.reportLink(BANK_ID, SUBMISSION_MONTH).click();
    pages.utilisationReportPage.keyingSheetTabLink().click();
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_TWO).within(() => cy.get('input[type="checkbox"]').click());
    pages.utilisationReportPage.keyingSheetTab.markAsToDoButton().click();

    pages.utilisationReportPage.bankReportsNavLink().click();
    pages.utilisationReportsSummaryPage.tableRowSelector(BANK_ID, SUBMISSION_MONTH).should('contain', 'Reconciliation in progress');
  });
});
