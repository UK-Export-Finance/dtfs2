import {
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import { PDC_TEAMS } from '../../../../fixtures/teams';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import USERS from '../../../../fixtures/users';
import relative from '../../../relativeURL';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context(`${PDC_TEAMS.PDC_RECONCILE} users can delete payments`, () => {
  const reportIdGenerator = idGenerator();
  const feeRecordIdGenerator = idGenerator();
  const paymentIdGenerator = idGenerator();
  const paymentCurrency = CURRENCY.GBP;

  const aUtilisationReport = () =>
    UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
      .withId(reportIdGenerator.next().value)
      .withBankId('961')
      .withDateUploaded(new Date())
      .build();

  const aPaymentWithAmount = (amount) =>
    PaymentEntityMockBuilder.forCurrency(paymentCurrency).withId(paymentIdGenerator.next().value).withAmount(amount).build();

  const aFeeRecordForReportWithAmountStatusAndPayments = (report, amount, status, payments) =>
    FeeRecordEntityMockBuilder.forReport(report)
      .withId(feeRecordIdGenerator.next().value)
      .withStatus(status)
      .withFeesPaidToUkefForThePeriod(amount)
      .withFeesPaidToUkefForThePeriodCurrency(paymentCurrency)
      .withPaymentCurrency(paymentCurrency)
      .withPayments(payments)
      .build();

  before(() => {
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);
  });

  it('navigates back to the edit-payment page when the No button is selected on the confirm delete payment page', () => {
    const report = aUtilisationReport();

    const payment = aPaymentWithAmount(100);

    const feeRecord = aFeeRecordForReportWithAmountStatusAndPayments(report, 300, FEE_RECORD_STATUS.DOES_NOT_MATCH, [payment]);

    const editPaymentUrl = `/utilisation-reports/${report.id}/edit-payment/${payment.id}`;

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, getMatchingTfmFacilitiesForFeeRecords([feeRecord]));

    cy.visit(`/utilisation-reports/${report.id}`);

    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(payment.id);

    cy.url().should('eq', relative(`${editPaymentUrl}?redirectTab=premium-payments`));

    pages.utilisationReportEditPaymentPage.clickDeletePaymentButton();

    cy.url().should('eq', relative(`${editPaymentUrl}/confirm-delete?redirectTab=premium-payments`));

    pages.utilisationReportConfirmDeletePaymentPage.selectNoRadio();
    pages.utilisationReportConfirmDeletePaymentPage.clickContinueButton();

    cy.url().should('eq', relative(`${editPaymentUrl}?redirectTab=premium-payments`));
  });

  it(`allows the user to delete the payment and resets the status to '${FEE_RECORD_STATUS.DOES_NOT_MATCH}' when the remaining payments do not match`, () => {
    const report = aUtilisationReport();

    const firstPayment = aPaymentWithAmount(100);

    const secondPayment = aPaymentWithAmount(200);

    const feeRecord = aFeeRecordForReportWithAmountStatusAndPayments(report, 300, FEE_RECORD_STATUS.MATCH, [firstPayment, secondPayment]);

    const editPaymentUrl = `/utilisation-reports/${report.id}/edit-payment/${firstPayment.id}`;

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, getMatchingTfmFacilitiesForFeeRecords([feeRecord]));

    cy.visit(`/utilisation-reports/${report.id}`);

    cy.get('strong[data-cy="fee-record-status"]:contains("Match)').should('exist');
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(firstPayment.id);

    cy.url().should('eq', relative(`${editPaymentUrl}?redirectTab=premium-payments`));

    pages.utilisationReportEditPaymentPage.clickDeletePaymentButton();

    cy.url().should('eq', relative(`${editPaymentUrl}/confirm-delete?redirectTab=premium-payments`));

    pages.utilisationReportConfirmDeletePaymentPage.selectYesRadio();
    pages.utilisationReportConfirmDeletePaymentPage.clickContinueButton();

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}#premium-payments`));

    pages.utilisationReportPage.premiumPaymentsTab.getPaymentLink(firstPayment.id).should('not.exist');
    cy.get('strong[data-cy="fee-record-status"]:contains("Does not match")').should('exist');
  });

  it(`allows the user to delete the payment and resets the status to '${FEE_RECORD_STATUS.MATCH}' when the remaining payments match`, () => {
    const report = aUtilisationReport();

    const firstPayment = aPaymentWithAmount(100);

    const secondPayment = aPaymentWithAmount(200);

    const feeRecord = aFeeRecordForReportWithAmountStatusAndPayments(report, 200, FEE_RECORD_STATUS.DOES_NOT_MATCH, [firstPayment, secondPayment]);

    const editPaymentUrl = `/utilisation-reports/${report.id}/edit-payment/${firstPayment.id}`;

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, getMatchingTfmFacilitiesForFeeRecords([feeRecord]));

    cy.visit(`/utilisation-reports/${report.id}`);

    cy.get('strong[data-cy="fee-record-status"]:contains("Does not match")').should('exist');
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(firstPayment.id);

    cy.url().should('eq', relative(`${editPaymentUrl}?redirectTab=premium-payments`));

    pages.utilisationReportEditPaymentPage.clickDeletePaymentButton();

    cy.url().should('eq', relative(`${editPaymentUrl}/confirm-delete?redirectTab=premium-payments`));

    pages.utilisationReportConfirmDeletePaymentPage.selectYesRadio();
    pages.utilisationReportConfirmDeletePaymentPage.clickContinueButton();

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}#premium-payments`));

    pages.utilisationReportPage.premiumPaymentsTab.getPaymentLink(firstPayment.id).should('not.exist');
    cy.get('strong[data-cy="fee-record-status"]:contains("Match")').should('exist');
  });

  it(`allows the user to delete the payment and resets the status to '${FEE_RECORD_STATUS.TO_DO}' when all payments are deleted`, () => {
    const report = aUtilisationReport();

    const payment = aPaymentWithAmount(100);

    const feeRecord = aFeeRecordForReportWithAmountStatusAndPayments(report, 300, FEE_RECORD_STATUS.DOES_NOT_MATCH, [payment]);

    const editPaymentUrl = `/utilisation-reports/${report.id}/edit-payment/${payment.id}`;

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, getMatchingTfmFacilitiesForFeeRecords([feeRecord]));

    cy.visit(`/utilisation-reports/${report.id}`);

    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(payment.id);

    cy.url().should('eq', relative(`${editPaymentUrl}?redirectTab=premium-payments`));

    pages.utilisationReportEditPaymentPage.clickDeletePaymentButton();

    cy.url().should('eq', relative(`${editPaymentUrl}/confirm-delete?redirectTab=premium-payments`));

    pages.utilisationReportConfirmDeletePaymentPage.selectYesRadio();
    pages.utilisationReportConfirmDeletePaymentPage.clickContinueButton();

    pages.utilisationReportPage.premiumPaymentsTab.getPaymentLink(payment.id).should('not.exist');
    cy.get('strong[data-cy="fee-record-status"]:contains("TO DO")').should('exist');
  });

  function* idGenerator() {
    let id = 0;
    while (true) {
      id += 1;
      yield id;
    }
  }
});
