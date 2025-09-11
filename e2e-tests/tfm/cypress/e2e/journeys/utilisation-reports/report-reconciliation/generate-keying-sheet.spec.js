import { FeeRecordEntityMockBuilder, PaymentEntityMockBuilder, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common/test-helpers';
import { startOfMonth, subMonths } from 'date-fns';
import { PENDING_RECONCILIATION, CURRENCY, FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import relative from '../../../relativeURL';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

const { keyingSheetContent } = pages.utilisationReportPage.tabs;

context('PDC_RECONCILE users can generate keying data', () => {
  const bankId = '961';
  const reportId = 1;

  const today = new Date();

  const startOfCurrentReportPeriodDate = startOfMonth(subMonths(today, 1));
  const endOfCurrentReportPeriodDate = startOfMonth(today);
  const currentReportPeriod = {
    start: { month: startOfCurrentReportPeriodDate.getMonth() + 1, year: startOfCurrentReportPeriodDate.getFullYear() },
    end: { month: endOfCurrentReportPeriodDate.getMonth() + 1, year: endOfCurrentReportPeriodDate.getFullYear() },
  };

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
    .withId(reportId)
    .withBankId(bankId)
    .withReportPeriod(currentReportPeriod)
    .build();

  const firstFeeRecordId = '11';
  const secondFeeRecordId = '22';

  const paymentCurrency = CURRENCY.GBP;

  const matchingPayment = PaymentEntityMockBuilder.forCurrency(paymentCurrency).withAmount(100).build();

  const matchingFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
    .withId(firstFeeRecordId)
    .withBaseCurrency(paymentCurrency)
    .withPaymentCurrency(paymentCurrency)
    .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
    .withFeesPaidToUkefForThePeriod(100)
    .withStatus(FEE_RECORD_STATUS.MATCH)
    .withPayments([matchingPayment])
    .build();

  const toDoFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
    .withId(secondFeeRecordId)
    .withBaseCurrency(CURRENCY.JPY)
    .withPaymentCurrency(CURRENCY.EUR)
    .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.USD)
    .withFeesPaidToUkefForThePeriod(100)
    .withStatus(FEE_RECORD_STATUS.TO_DO)
    .build();

  beforeEach(() => {
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);

    cy.task(NODE_TASKS.GET_ALL_BANKS).then((banks) => {
      const bankWithReportToReconcile = banks.find((bank) => bank.id === bankId);
      cy.wrap(bankWithReportToReconcile).should('not.be.undefined');
    });
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

    const feeRecords = [matchingFeeRecord, toDoFeeRecord];
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, getMatchingTfmFacilitiesForFeeRecords(feeRecords));

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);
  });

  it('can generate keying data for fee record at MATCH status', () => {
    cy.visit(`utilisation-reports/${reportId}`);
    pages.utilisationReportPage.tabs.premiumPaymentsContent.generateKeyingDataButton().click();
    pages.checkKeyingDataPage.generateKeyingSheetDataButton().click();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}#keying-sheet`));

    keyingSheetContent.keyingSheetTableRow(firstFeeRecordId).should('contain', 'To do');
    keyingSheetContent.keyingSheetTableRow(secondFeeRecordId).should('not.exist');
  });
});
