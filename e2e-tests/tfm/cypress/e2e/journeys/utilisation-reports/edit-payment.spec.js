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

context(`${PDC_TEAMS.PDC_RECONCILE} users can edit payments`, () => {
  const reportId = 12;
  const paymentId = 15;
  const paymentCurrency = CURRENCY.GBP;
  const paymentAmount = 100;

  const paymentDateDay = '1';
  const paymentDateMonth = '1';
  const paymentDateYear = '2024';
  const datePaymentReceived = new Date(`${paymentDateYear}-${paymentDateMonth}-${paymentDateDay}`);

  const paymentReference = 'A payment reference';

  const clearFormValues = () => {
    cy.getInputByLabelText('Amount received').clear();
    cy.getInputByLabelText('Day').clear();
    cy.getInputByLabelText('Month').clear();
    cy.getInputByLabelText('Year').clear();
    cy.getInputByLabelText('Payment reference (optional)').clear();
  };

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId('961')
    .withDateUploaded(new Date())
    .build();

  const aPaymentWithAmount = (amount) =>
    PaymentEntityMockBuilder.forCurrency(paymentCurrency)
      .withId(paymentId)
      .withAmount(amount)
      .withDateReceived(datePaymentReceived)
      .withReference(paymentReference)
      .build();

  const aFeeRecordWithIdAmountStatusAndPayments = (feeRecordId, amount, status, payments) =>
    FeeRecordEntityMockBuilder.forReport(utilisationReport)
      .withId(feeRecordId)
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

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [utilisationReport]);

    const payment = aPaymentWithAmount(paymentAmount);
    const feeRecord = aFeeRecordWithIdAmountStatusAndPayments(123, paymentAmount, FEE_RECORD_STATUS.MATCH, [payment]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`/utilisation-reports/${reportId}`);
  });

  it('should allow the user to navigate to the edit payment page from the premium payments table', () => {
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));
  });

  it('should allow the user to navigate to the edit payment page from the payment details table', () => {
    pages.utilisationReportPage.paymentDetailsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=payment-details`));
  });

  it('should return to the premium payments page when the back link is clicked after accessing the edit payment page from the premium payments table', () => {
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));

    pages.utilisationReportEditPaymentPage.clickBackLink();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}#premium-payments`));
  });

  it('should return to the payment details page when the back link is clicked after accessing the edit payment page from the payment details table', () => {
    pages.utilisationReportPage.paymentDetailsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=payment-details`));

    pages.utilisationReportEditPaymentPage.clickBackLink();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}#payment-details`));
  });

  it('should display the payment currency as a fixed value next to the payment amount', () => {
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));

    cy.get('[data-cy="payment-currency-prefix"]').should('have.text', paymentCurrency);
  });

  it('should populate the edit payment form values with the current payment values', () => {
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));

    cy.getInputByLabelText('Amount received').should('have.value', paymentAmount.toString());
    cy.getInputByLabelText('Day').should('have.value', paymentDateDay);
    cy.getInputByLabelText('Month').should('have.value', paymentDateMonth);
    cy.getInputByLabelText('Year').should('have.value', paymentDateYear);
    cy.getInputByLabelText('Payment reference (optional)').should('have.value', paymentReference);
  });

  it('should display errors when form submitted with invalid values and persist the selected fees and inputted values', () => {
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORDS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);

    const payment = aPaymentWithAmount(200);
    const feeRecord = aFeeRecordWithIdAmountStatusAndPayments(123, 70, FEE_RECORD_STATUS.DOES_NOT_MATCH, [payment]);
    const anotherFeeRecord = aFeeRecordWithIdAmountStatusAndPayments(124, 7, FEE_RECORD_STATUS.DOES_NOT_MATCH, [payment]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord, anotherFeeRecord]);

    const getFeeRecordCheckbox = (feeRecordId) => cy.get(`[type="checkbox"][id="feeRecordId-${feeRecordId}"]`);

    cy.reload();

    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));

    clearFormValues();

    getFeeRecordCheckbox(feeRecord.id).check();

    cy.getInputByLabelText('Amount received').type('nonsense');
    cy.getInputByLabelText('Day').type('nonsense');
    cy.getInputByLabelText('Month').type('nonsense');
    cy.getInputByLabelText('Year').type('nonsense');
    cy.getInputByLabelText('Payment reference (optional)').type('This is valid');

    pages.utilisationReportEditPaymentPage.clickSaveChangesButton();

    getFeeRecordCheckbox(feeRecord.id).should('be.checked');
    getFeeRecordCheckbox(anotherFeeRecord.id).should('not.be.checked');

    cy.get('a').should('contain', 'Enter a valid amount received');
    cy.get('a').should('contain', 'The date payment received must be a real date');

    cy.get('form').should('contain', 'Enter a valid amount received');
    cy.get('form').should('contain', 'The date payment received must be a real date');

    cy.getInputByLabelText('Amount received').should('have.value', 'nonsense');
    cy.getInputByLabelText('Day').should('have.value', 'nonsense');
    cy.getInputByLabelText('Month').should('have.value', 'nonsense');
    cy.getInputByLabelText('Year').should('have.value', 'nonsense');
    cy.getInputByLabelText('Payment reference (optional)').should('have.value', 'This is valid');
  });

  it('should return to the premium payments table after the user clicks the save changes button', () => {
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));

    pages.utilisationReportEditPaymentPage.clickSaveChangesButton();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));
  });

  it('should update the payment with the supplied values after clicking the save changes button', () => {
    const newPaymentAmount = '314.59';
    const newPaymentDateDay = '12';
    const newPaymentDateMonth = '2';
    const newPaymentDateYear = '2021';
    const newPaymentReference = 'New payment reference';

    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));

    cy.getInputByLabelText('Amount received').should('have.value', paymentAmount.toString());
    cy.getInputByLabelText('Day').should('have.value', paymentDateDay);
    cy.getInputByLabelText('Month').should('have.value', paymentDateMonth);
    cy.getInputByLabelText('Year').should('have.value', paymentDateYear);
    cy.getInputByLabelText('Payment reference (optional)').should('have.value', paymentReference);

    clearFormValues();

    cy.getInputByLabelText('Amount received').type(newPaymentAmount.toString());
    cy.getInputByLabelText('Day').type(newPaymentDateDay);
    cy.getInputByLabelText('Month').type(newPaymentDateMonth);
    cy.getInputByLabelText('Year').type(newPaymentDateYear);
    cy.getInputByLabelText('Payment reference (optional)').type(newPaymentReference);

    pages.utilisationReportEditPaymentPage.clickSaveChangesButton();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));

    cy.getInputByLabelText('Amount received').should('have.value', newPaymentAmount.toString());
    cy.getInputByLabelText('Day').should('have.value', newPaymentDateDay);
    cy.getInputByLabelText('Month').should('have.value', newPaymentDateMonth);
    cy.getInputByLabelText('Year').should('have.value', newPaymentDateYear);
    cy.getInputByLabelText('Payment reference (optional)').should('have.value', newPaymentReference);
  });

  it(`should set the fee record status to '${FEE_RECORD_STATUS.DOES_NOT_MATCH}' if the new payment amount does not match the fee record amount`, () => {
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORDS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);

    const payment = aPaymentWithAmount(200);
    const feeRecord = aFeeRecordWithIdAmountStatusAndPayments(123, 200, FEE_RECORD_STATUS.MATCH, [payment]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);

    cy.reload();

    cy.get('strong[data-cy="fee-record-status"]:contains("MATCH")').should('exist');
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));

    cy.getInputByLabelText('Amount received').should('have.value', '200');
    cy.getInputByLabelText('Amount received').clear();
    cy.getInputByLabelText('Amount received').type('100');

    pages.utilisationReportEditPaymentPage.clickSaveChangesButton();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));
    cy.get('strong[data-cy="fee-record-status"]:contains("DOES NOT MATCH")').should('exist');
  });

  it(`should set the fee record status to '${FEE_RECORD_STATUS.MATCH}' if the new payment amount matches the fee record amount`, () => {
    cy.task(NODE_TASKS.REMOVE_ALL_FEE_RECORDS_FROM_DB);
    cy.task(NODE_TASKS.REMOVE_ALL_PAYMENTS_FROM_DB);

    const payment = aPaymentWithAmount(100);
    const feeRecord = aFeeRecordWithIdAmountStatusAndPayments(123, 200, FEE_RECORD_STATUS.DOES_NOT_MATCH, [payment]);
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [feeRecord]);

    cy.reload();

    cy.get('strong[data-cy="fee-record-status"]:contains("DOES NOT MATCH")').should('exist');

    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));

    cy.getInputByLabelText('Amount received').should('have.value', '100');
    cy.getInputByLabelText('Amount received').clear();
    cy.getInputByLabelText('Amount received').type('200');

    pages.utilisationReportEditPaymentPage.clickSaveChangesButton();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));
    cy.get('strong[data-cy="fee-record-status"]:contains("DOES NOT MATCH")').should('not.exist');
    cy.get('strong[data-cy="fee-record-status"]:contains("MATCH")').should('exist');
  });

  it('should return to the premium payments page when the payment is edited after accessing the edit payment page from the premium payments table', () => {
    pages.utilisationReportPage.premiumPaymentsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=premium-payments`));

    cy.getInputByLabelText('Amount received').clear();
    cy.getInputByLabelText('Amount received').type('200');

    pages.utilisationReportEditPaymentPage.clickSaveChangesButton();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}#premium-payments`));
  });

  it('should return to the payment details page when the payment is edited after accessing the edit payment page from the payment details table', () => {
    pages.utilisationReportPage.paymentDetailsTab.clickPaymentLink(paymentId);

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}/edit-payment/${paymentId}?redirectTab=payment-details`));

    cy.getInputByLabelText('Amount received').clear();
    cy.getInputByLabelText('Amount received').type('200');

    pages.utilisationReportEditPaymentPage.clickSaveChangesButton();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}#payment-details`));
  });
});
