import {
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PENDING_RECONCILIATION,
  UtilisationReportEntityMockBuilder,
  PaymentEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import { errorSummary } from '../../../../partials';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context('PDC_RECONCILE users cannot add payments with invalid fee selections', () => {
  const bankId = '961';
  const reportId = 1;

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();
  const toDoGbpFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).withPaymentCurrency(CURRENCY.GBP).build();
  const toDoEurFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(2).withStatus(FEE_RECORD_STATUS.TO_DO).withPaymentCurrency(CURRENCY.EUR).build();
  const doesNotMatchGbpFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
    .withId(3)
    .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
    .withPaymentCurrency(CURRENCY.GBP)
    .withPayments([PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(1).build()])
    .build();
  const anotherDoesNotMatchGbpFeeRecord = FeeRecordEntityMockBuilder.forReport(report)
    .withId(4)
    .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
    .withPaymentCurrency(CURRENCY.GBP)
    .withPayments([PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(2).build()])
    .build();

  const { premiumPaymentsTab } = pages.utilisationReportPage;

  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

    const feeRecords = [toDoGbpFeeRecord, toDoEurFeeRecord, doesNotMatchGbpFeeRecord, anotherDoesNotMatchGbpFeeRecord];
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  context('', () => {
    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    it('should not allow user to add a payment with no fees selected', () => {
      premiumPaymentsTab.addAPaymentButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

      errorSummary().contains('Select a fee or fees to add a payment to');
      premiumPaymentsTab.premiumPaymentsTable.error().should('exist');
      cy.assertText(premiumPaymentsTab.premiumPaymentsTable.error(), 'Error: Select a fee or fees to add a payment to');
    });

    it('should not allow user to add a payment to multiple fees with different statuses', () => {
      premiumPaymentsTab.premiumPaymentsTable.checkbox([toDoGbpFeeRecord.id], toDoGbpFeeRecord.paymentCurrency, toDoGbpFeeRecord.status).click();
      premiumPaymentsTab.premiumPaymentsTable
        .checkbox([doesNotMatchGbpFeeRecord.id], doesNotMatchGbpFeeRecord.paymentCurrency, doesNotMatchGbpFeeRecord.status)
        .click();

      premiumPaymentsTab.addAPaymentButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

      errorSummary().contains('Select a fee or fees with the same status');
      premiumPaymentsTab.premiumPaymentsTable.error().should('exist');
      cy.assertText(premiumPaymentsTab.premiumPaymentsTable.error(), 'Error: Select a fee or fees with the same status');
    });

    it('should not allow user to add a payment to multiple fees with DOES_NOT_MATCH status', () => {
      premiumPaymentsTab.premiumPaymentsTable
        .checkbox([doesNotMatchGbpFeeRecord.id], doesNotMatchGbpFeeRecord.paymentCurrency, doesNotMatchGbpFeeRecord.status)
        .click();
      premiumPaymentsTab.premiumPaymentsTable
        .checkbox([anotherDoesNotMatchGbpFeeRecord.id], anotherDoesNotMatchGbpFeeRecord.paymentCurrency, anotherDoesNotMatchGbpFeeRecord.status)
        .click();

      premiumPaymentsTab.addAPaymentButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

      errorSummary().contains("Select only one fee or fee group at 'Does not match' status");
      premiumPaymentsTab.premiumPaymentsTable.error().should('exist');
      cy.assertText(premiumPaymentsTab.premiumPaymentsTable.error(), "Error: Select only one fee or fee group at 'Does not match' status");
    });

    it('should not allow user to add a payment to fees with different payment currencies', () => {
      premiumPaymentsTab.premiumPaymentsTable.checkbox([toDoGbpFeeRecord.id], toDoGbpFeeRecord.paymentCurrency, toDoGbpFeeRecord.status).click();
      premiumPaymentsTab.premiumPaymentsTable.checkbox([toDoEurFeeRecord.id], toDoEurFeeRecord.paymentCurrency, toDoEurFeeRecord.status).click();
      premiumPaymentsTab.addAPaymentButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

      errorSummary().contains('Select fees with the same Reported payment currency');
      premiumPaymentsTab.premiumPaymentsTable.error().should('exist');
      cy.assertText(premiumPaymentsTab.premiumPaymentsTable.error(), 'Error: Select fees with the same Reported payment currency');
    });
  });
});
