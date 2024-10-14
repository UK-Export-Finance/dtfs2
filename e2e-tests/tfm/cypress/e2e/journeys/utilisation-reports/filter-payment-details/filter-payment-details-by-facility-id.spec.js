import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import USERS from '../../../../fixtures/users';
import relative from '../../../relativeURL';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context(`users can filter payment details by facility id`, () => {
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

  describe('when a complete facility id filter is submitted', () => {
    it('should only display the payment with the supplied facility id and persist the inputted value', () => {
      const completeFacilityIdFilter = '11111111';

      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId(completeFacilityIdFilter).build();
      const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build();

      const feeRecords = [firstFeeRecord, secondFeeRecord];

      const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withId(11)
        .withAmount(100)
        .withReference('ABCD')
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

      cy.keyboardInput(filters.facilityIdInput(), completeFacilityIdFilter);
      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${completeFacilityIdFilter}#payment-details`),
      );

      filters.facilityIdInput().should('have.value', completeFacilityIdFilter);

      paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
      paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('not.exist');
    });
  });

  describe('when a partial facility id filter is submitted', () => {
    it('should only display the payments which partially match the supplied facility id and persist the inputted value', () => {
      const partialFacilityIdFilter = '1111';

      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('77771111').build();
      const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build();

      const feeRecords = [firstFeeRecord, secondFeeRecord];

      const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withId(11)
        .withAmount(100)
        .withReference('ABCD')
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

      cy.keyboardInput(filters.facilityIdInput(), partialFacilityIdFilter);
      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${partialFacilityIdFilter}#payment-details`),
      );

      filters.facilityIdInput().should('have.value', partialFacilityIdFilter);

      paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
      paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('not.exist');
    });
  });

  describe('when the facility id filter is submitted with an invalid value', () => {
    it('should display an error message for invalid facility id and persist the inputted value', () => {
      const invalidFacilityIdFilter = '123'; // Invalid due to length.
      const expectedErrorMessage = 'Facility ID must be blank or contain between 4 and 10 numbers';

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

      cy.keyboardInput(filters.facilityIdInput(), invalidFacilityIdFilter);
      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${invalidFacilityIdFilter}#payment-details`),
      );

      filters.facilityIdInput().should('have.value', invalidFacilityIdFilter);

      errorSummaryErrors().should('have.length', 1);
      cy.assertText(errorSummaryErrors().eq(0), expectedErrorMessage);

      cy.assertText(filters.facilityIdError(), `Error: ${expectedErrorMessage}`);
    });
  });

  describe('when the facility id filter is submitted with no value', () => {
    it('should persist the inputted value and not display any error messages', () => {
      const emptyFacilityIdFilter = '';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();

      const feeRecords = [feeRecord];

      const payment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withFeeRecords(feeRecords).build();

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [payment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      filters.facilityIdInput().should('have.value', emptyFacilityIdFilter);
      filters.submitButton().click();

      cy.url().should('eq', relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`));

      filters.facilityIdInput().should('have.value', emptyFacilityIdFilter);

      errorSummaryErrors().should('have.length', 0);
      filters.facilityIdError().should('not.exist');
    });
  });

  describe('when the facility id filter matches no payments', () => {
    it('should display an error message for no payments found and persist the inputted value', () => {
      const unknownFacilityIdFilter = '99999999';

      const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build();

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

      cy.keyboardInput(filters.facilityIdInput(), unknownFacilityIdFilter);
      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${unknownFacilityIdFilter}#payment-details`),
      );

      filters.panel().should('exist');

      filters.facilityIdInput().should('have.value', unknownFacilityIdFilter);

      filters.noRecordsMatchingFiltersText().should('exist');

      paymentDetailsTable.row(payment.id, feeRecord.id).should('not.exist');
    });
  });
});
