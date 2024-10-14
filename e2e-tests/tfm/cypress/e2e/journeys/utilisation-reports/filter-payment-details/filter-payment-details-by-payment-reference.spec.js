import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
  MIN_PAYMENT_REFERENCE_FILTER_CHARACTER_COUNT,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import USERS from '../../../../fixtures/users';
import relative from '../../../relativeURL';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context(`users can filter payment details by payment reference`, () => {
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

  describe('when a complete payment reference filter is submitted', () => {
    it('should only display the payment with the supplied payment reference and persist the inputted value', () => {
      const completePaymentReferenceFilter = 'AAAA';

      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build();
      const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build();

      const feeRecords = [firstFeeRecord, secondFeeRecord];

      const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withId(11)
        .withAmount(100)
        .withReference(completePaymentReferenceFilter)
        .withFeeRecords([firstFeeRecord])
        .build();
      const secondPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withId(12)
        .withAmount(200)
        .withReference('BBBB')
        .withFeeRecords([firstFeeRecord])
        .build();
      const thirdPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withId(13)
        .withAmount(300)
        .withReference('CCCC')
        .withFeeRecords([secondFeeRecord])
        .build();

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [firstFeeRecord, secondFeeRecord]);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [firstPayment, secondPayment, thirdPayment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      cy.keyboardInput(filters.paymentReferenceInput(), completePaymentReferenceFilter);
      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${completePaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`),
      );

      filters.paymentReferenceInput().should('have.value', completePaymentReferenceFilter);

      paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
      paymentDetailsTable.row(secondPayment.id, firstFeeRecord.id).should('not.exist');
      paymentDetailsTable.row(thirdPayment.id, secondFeeRecord.id).should('not.exist');
    });
  });

  describe('when a partial payment reference filter is submitted', () => {
    it('should only display the payments which partially match the supplied payment reference and persist the inputted value', () => {
      const partialPaymentReferenceFilter = 'ABCD';

      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build();
      const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build();

      const feeRecords = [firstFeeRecord, secondFeeRecord];

      const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withId(11)
        .withAmount(100)
        .withReference('ABCDEFGH')
        .withFeeRecords([firstFeeRecord])
        .build();
      const secondPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withId(12)
        .withAmount(200)
        .withReference('EFGH')
        .withFeeRecords([secondFeeRecord])
        .build();

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [firstPayment, secondPayment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      cy.keyboardInput(filters.paymentReferenceInput(), partialPaymentReferenceFilter);
      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${partialPaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`),
      );

      filters.paymentReferenceInput().should('have.value', partialPaymentReferenceFilter);

      paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
      paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('not.exist');
    });
  });

  describe('when the payment reference filter is submitted with an invalid value', () => {
    it('should display an error message for invalid payment reference and persist the inputted value', () => {
      const invalidPaymentReferenceFilter = 'a'.repeat(MIN_PAYMENT_REFERENCE_FILTER_CHARACTER_COUNT - 1); // Invalid due to length.
      const expectedErrorMessage = 'Payment reference must be blank or contain a minimum of 4 characters';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();

      const feeRecords = [feeRecord];

      const payment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withFeeRecords([feeRecord]).build();

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [payment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      cy.keyboardInput(filters.paymentReferenceInput(), invalidPaymentReferenceFilter);
      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${invalidPaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`),
      );

      filters.paymentReferenceInput().should('have.value', invalidPaymentReferenceFilter);

      errorSummaryErrors().should('have.length', 1);
      cy.assertText(errorSummaryErrors().eq(0), expectedErrorMessage);

      cy.assertText(filters.paymentReferenceError(), `Error: ${expectedErrorMessage}`);
    });
  });

  describe('when the payment reference filter is submitted with no value', () => {
    it('should persist the inputted value and not display any error messages', () => {
      const emptyPaymentReferenceFilter = '';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();

      const feeRecords = [feeRecord];

      const payment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withFeeRecords([feeRecord]).build();

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [payment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      filters.paymentReferenceInput().should('have.value', emptyPaymentReferenceFilter);
      filters.submitButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`));

      filters.paymentReferenceInput().should('have.value', emptyPaymentReferenceFilter);

      errorSummaryErrors().should('have.length', 0);
      filters.facilityIdError().should('not.exist');
    });
  });

  describe('when the payment reference filter matches no payments', () => {
    it('should display an error message for no payments found and persist the inputted value', () => {
      const unknownPaymentReferenceFilter = 'some-unknown-payment-reference';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build();

      const feeRecords = [feeRecord];

      const payment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withReference('ABCD').withFeeRecords([feeRecord]).build();

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [payment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      cy.keyboardInput(filters.paymentReferenceInput(), unknownPaymentReferenceFilter);
      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${unknownPaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`),
      );

      filters.panel().should('exist');

      filters.paymentReferenceInput().should('have.value', unknownPaymentReferenceFilter);

      filters.noRecordsMatchingFiltersText().should('exist');

      paymentDetailsTable.row(payment.id, feeRecord.id).should('not.exist');
    });
  });
});
