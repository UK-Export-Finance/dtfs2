import {
  CURRENCY,
  FEE_RECORD_STATUS,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import { PDC_TEAMS } from '../../../fixtures/teams';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import USERS from '../../../fixtures/users';
import relative from '../../relativeURL';

context(`${PDC_TEAMS.PDC_RECONCILE} users can delete payments`, () => {
  const reportIdGenerator = idGenerator();
  const feeRecordIdGenerator = idGenerator();
  const paymentIdGenerator = idGenerator();
  const paymentCurrency = CURRENCY.GBP;

  const aUtilisationReport = () =>
    UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
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

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);
  });

  it('navigates back to the edit-payment page when the No button is selected on the confirm delete payment page', () => {
    const report = aUtilisationReport();

    const payment = aPaymentWithAmount(100);

    const feeRecord = aFeeRecordForReportWithAmountStatusAndPayments(report, 300, FEE_RECORD_STATUS.DOES_NOT_MATCH, [payment]);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);

    cy.visit(`/utilisation-reports/${report.id}`);

    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(payment.id);

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}/edit-payment/${payment.id}`));

    pages.utilisationReportEditPaymentPage.clickDeletePaymentButton();

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}/edit-payment/${payment.id}/confirm-delete`));

    pages.utilisationReportConfirmDeletePaymentPage.selectNoRadio();
    pages.utilisationReportConfirmDeletePaymentPage.clickContinueButton();

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}/edit-payment/${payment.id}`));
  });

  it(`allows the user to delete the payment and resets the status to '${FEE_RECORD_STATUS.DOES_NOT_MATCH}' when the remaining payments do not match`, () => {
    const report = aUtilisationReport();

    const firstPayment = aPaymentWithAmount(100);

    const secondPayment = aPaymentWithAmount(200);

    const feeRecord = aFeeRecordForReportWithAmountStatusAndPayments(report, 300, FEE_RECORD_STATUS.MATCH, [firstPayment, secondPayment]);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);

    cy.visit(`/utilisation-reports/${report.id}`);

    cy.get('strong[data-cy="fee-record-status"]:contains("MATCH")').should('exist');
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(firstPayment.id);

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}/edit-payment/${firstPayment.id}`));

    pages.utilisationReportEditPaymentPage.clickDeletePaymentButton();

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}/edit-payment/${firstPayment.id}/confirm-delete`));

    pages.utilisationReportConfirmDeletePaymentPage.selectYesRadio();
    pages.utilisationReportConfirmDeletePaymentPage.clickContinueButton();

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}`));

    pages.utilisationReportPage.premiumPaymentsTab.getPaymentLink(firstPayment.id).should('not.exist');
    cy.get('strong[data-cy="fee-record-status"]:contains("DOES NOT MATCH")').should('exist');
  });

  it(`allows the user to delete the payment and resets the status to '${FEE_RECORD_STATUS.MATCH}' when the remaining payments match`, () => {
    const report = aUtilisationReport();

    const firstPayment = aPaymentWithAmount(100);

    const secondPayment = aPaymentWithAmount(200);

    const feeRecord = aFeeRecordForReportWithAmountStatusAndPayments(report, 200, FEE_RECORD_STATUS.DOES_NOT_MATCH, [firstPayment, secondPayment]);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);

    cy.visit(`/utilisation-reports/${report.id}`);

    cy.get('strong[data-cy="fee-record-status"]:contains("DOES NOT MATCH")').should('exist');
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(firstPayment.id);

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}/edit-payment/${firstPayment.id}`));

    pages.utilisationReportEditPaymentPage.clickDeletePaymentButton();

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}/edit-payment/${firstPayment.id}/confirm-delete`));

    pages.utilisationReportConfirmDeletePaymentPage.selectYesRadio();
    pages.utilisationReportConfirmDeletePaymentPage.clickContinueButton();

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}`));

    pages.utilisationReportPage.premiumPaymentsTab.getPaymentLink(firstPayment.id).should('not.exist');
    cy.get('strong[data-cy="fee-record-status"]:contains("MATCH")').should('exist');
  });

  it(`allows the user to delete the payment and resets the status to '${FEE_RECORD_STATUS.TO_DO}' when all payments are deleted`, () => {
    const report = aUtilisationReport();

    const payment = aPaymentWithAmount(100);

    const feeRecord = aFeeRecordForReportWithAmountStatusAndPayments(report, 300, FEE_RECORD_STATUS.DOES_NOT_MATCH, [payment]);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);

    cy.visit(`/utilisation-reports/${report.id}`);

    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(payment.id);

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}/edit-payment/${payment.id}`));

    pages.utilisationReportEditPaymentPage.clickDeletePaymentButton();

    cy.url().should('eq', relative(`/utilisation-reports/${report.id}/edit-payment/${payment.id}/confirm-delete`));

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
