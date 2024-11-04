import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import USERS from '../../../../../fixtures/users';
import relative from '../../../../relativeURL';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context(`users can filter payment details by payment currency`, () => {
  const bankId = '961';
  const reportId = 12;

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId(bankId)
    .withDateUploaded(new Date())
    .build();

  const { paymentDetailsTabLink, paymentDetailsTab } = pages.utilisationReportPage;
  const { filters, paymentDetailsTable, errorSummaryErrors } = paymentDetailsTab;

  before(() => {
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [utilisationReport]);
  });

  const aPaymentWithCurrencyAndFeeRecords = (currency, feeRecords) => PaymentEntityMockBuilder.forCurrency(currency).withFeeRecords(feeRecords).build();

  const aPaymentWithIdCurrencyAndFeeRecords = (id, currency, feeRecords) =>
    PaymentEntityMockBuilder.forCurrency(currency).withId(id).withFeeRecords(feeRecords).build();

  const aFeeRecord = () => FeeRecordEntityMockBuilder.forReport(utilisationReport).build();

  const aFeeRecordWithId = (id) => FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(id).build();

  const assertAllPaymentCurrencyInputsAreNotChecked = () => {
    Object.values(CURRENCY).forEach((currency) => {
      filters.paymentCurrencyRadioInput(currency).should('not.be.checked');
    });
  };

  describe('when a payment currency filter is submitted', () => {
    it('should only display the payment with the supplied payment currency and persist the checked currency', () => {
      const paymentCurrencyFilter = CURRENCY.USD;

      const firstFeeRecord = aFeeRecordWithId(1);
      const secondFeeRecord = aFeeRecordWithId(2);
      const feeRecords = [firstFeeRecord, secondFeeRecord];

      const firstPayment = aPaymentWithIdCurrencyAndFeeRecords(11, paymentCurrencyFilter, [firstFeeRecord]);
      const secondPayment = aPaymentWithIdCurrencyAndFeeRecords(12, CURRENCY.GBP, [secondFeeRecord]);

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [firstPayment, secondPayment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      filters.paymentCurrencyRadioInput(paymentCurrencyFilter).click();
      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(
          `/utilisation-reports/${reportId}?paymentDetailsPaymentCurrency=${paymentCurrencyFilter}&paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`,
        ),
      );

      filters.paymentCurrencyRadioInput(paymentCurrencyFilter).should('be.checked');

      paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
      paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('not.exist');
    });
  });

  describe('when the payment currency filter is submitted with an unknown value', () => {
    it('should not check any radio inputs', () => {
      const unknownPaymentCurrencyFilter = 'UNKNOWN';

      const feeRecord = aFeeRecord();
      const feeRecords = [feeRecord];

      const payment = aPaymentWithCurrencyAndFeeRecords(CURRENCY.GBP, [feeRecord]);

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [payment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      // The payment currency filter is a radio input, so we need to visit the URL directly with the invalid value.
      cy.visit(
        relative(
          `/utilisation-reports/${reportId}?paymentDetailsPaymentCurrency=${unknownPaymentCurrencyFilter}&paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`,
        ),
      );

      assertAllPaymentCurrencyInputsAreNotChecked();
    });
  });

  describe('when the payment currency filter is submitted with no selection', () => {
    it('should not check any radio inputs or display any error messages', () => {
      const feeRecord = aFeeRecord();
      const feeRecords = [feeRecord];

      const payment = aPaymentWithCurrencyAndFeeRecords(CURRENCY.GBP, [feeRecord]);

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [payment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      filters.submitButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`));

      assertAllPaymentCurrencyInputsAreNotChecked();

      errorSummaryErrors().should('have.length', 0);
    });
  });

  describe('when the payment currency filter matches no payments', () => {
    it('should display an error message for no payments found and persist the inputted value', () => {
      const unknownPaymentCurrencyFilter = CURRENCY.JPY;

      const feeRecord = aFeeRecord();
      const feeRecords = [feeRecord];

      const payment = aPaymentWithCurrencyAndFeeRecords(CURRENCY.GBP, [feeRecord]);

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [payment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      filters.paymentCurrencyRadioInput(unknownPaymentCurrencyFilter).click();
      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(
          `/utilisation-reports/${reportId}?paymentDetailsPaymentCurrency=${unknownPaymentCurrencyFilter}&paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`,
        ),
      );

      filters.panel().should('exist');

      filters.paymentCurrencyRadioInput(unknownPaymentCurrencyFilter).should('be.checked');

      filters.noRecordsMatchingFiltersText().should('exist');

      paymentDetailsTable.row(payment.id, feeRecord.id).should('not.exist');
    });
  });
});
