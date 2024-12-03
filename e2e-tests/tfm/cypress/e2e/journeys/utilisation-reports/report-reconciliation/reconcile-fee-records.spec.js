import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  REPORT_NOT_RECEIVED,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntityMockBuilder,
  toIsoMonthStamp,
  getPreviousReportPeriodForBankScheduleByMonth,
  FEE_RECORD_STATUS,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';

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

    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

    cy.wrap(visibleBanks).each((bank) => {
      const reportPeriod = getPreviousReportPeriodForBankScheduleByMonth(bank.utilisationReportPeriodSchedule, SUBMISSION_MONTH);

      if (bank.id === BANK_ID) {
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

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${REPORT_ID}`);
    pages.utilisationReportPage.premiumPaymentsTab.generateKeyingDataButton().click();
    pages.checkKeyingDataPage.generateKeyingSheetDataButton().click();
  });

  describe('when logging in as "PDC_RECONCILE" user', () => {
    it('should display the relevant text', () => {
      pages.utilisationReportPage.premiumPaymentsTab.selectPaymentsText().should('exist');
      pages.utilisationReportPage.premiumPaymentsTab.paymentsOnPremiumPaymentsText().should('exist');

      cy.assertText(
        pages.utilisationReportPage.premiumPaymentsTab.selectPaymentsText(),
        'Select payments and mark as done when the adjustments have been keyed into ACBS.',
      );
      cy.assertText(
        pages.utilisationReportPage.premiumPaymentsTab.paymentsOnPremiumPaymentsText(),
        'Payments on the premium payments tab will show as reconciled when they have been marked as done here.',
      );
    });
  });

  describe('when logging in as "PDC_READ" user', () => {
    it('should display the relevant text', () => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_READ);

      cy.visit(`utilisation-reports/${REPORT_ID}`);
      pages.utilisationReportPage.keyingSheetTabLink().click();

      pages.utilisationReportPage.premiumPaymentsTab.selectPaymentsText().should('not.exist');
      pages.utilisationReportPage.premiumPaymentsTab.paymentsOnPremiumPaymentsText().should('exist');

      cy.assertText(
        pages.utilisationReportPage.premiumPaymentsTab.paymentsOnPremiumPaymentsText(),
        'Payments on the premium payments tab will show as reconciled when they have been marked as done here.',
      );
    });
  });

  it('can mark keying sheet rows as done and to do', () => {
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_ONE).should('contain', 'To do');

    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_ONE).within(() => cy.get('input[type="checkbox"]').click());
    pages.utilisationReportPage.keyingSheetTab.markAsDoneButton().click();
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_ONE).should('contain', 'Done');

    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_ONE).within(() => cy.get('input[type="checkbox"]').click());
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_TWO).within(() => cy.get('input[type="checkbox"]').click());
    pages.utilisationReportPage.keyingSheetTab.markAsToDoButton().click();
    pages.utilisationReportPage.keyingSheetTab.keyingSheetTableRow(FEE_RECORD_ID_ONE).should('contain', 'To do');
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

  it('should not display select all checkbox when there are no further actions to take', () => {
    pages.utilisationReportPage.keyingSheetTab.selectAllCheckbox().click();
    pages.utilisationReportPage.keyingSheetTab.markAsDoneButton().click();

    pages.utilisationReportPage.premiumPaymentsTabLink().click();

    pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.selectAllCheckboxContainer().should('not.exist');
  });
});
