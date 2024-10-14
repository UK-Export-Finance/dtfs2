import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
  MIN_PAYMENT_REFERENCE_FILTER_CHARACTER_COUNT,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import USERS from '../../../fixtures/users';
import relative from '../../relativeURL';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context(`users can filter payment details by facility id and payment reference and currency`, () => {
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

  describe('when filter panel toggle button is clicked', () => {
    it('should toggle the filter panel', () => {
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

      // On first page load, the filter panel should be visible.
      filters.panel().should('be.visible');

      cy.assertText(filters.panelToggleButton(), 'Hide filters');
      filters.panelToggleButton().click();
      filters.panel().should('not.be.visible');

      cy.assertText(filters.panelToggleButton(), 'Show filters');
      filters.panelToggleButton().click();
      filters.panel().should('be.visible');
    });
  });

  describe('when no filters are applied', () => {
    it('should display all the payments attached to the utilisation report', () => {
      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build();
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

      const payments = [firstPayment, secondPayment];

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, payments);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      payments.forEach(({ id: paymentId, currency, amount, reference, feeRecords: paymentFeeRecords }) => {
        paymentFeeRecords.forEach(({ id: feeRecordId, facilityId }, index) => {
          paymentDetailsTable.row(paymentId, feeRecordId).should('exist');

          const isFirstFeeRecordRow = index === 0;

          if (isFirstFeeRecordRow) {
            cy.assertText(paymentDetailsTable.paymentCurrencyAndAmount(paymentId, feeRecordId), `${currency} ${amount.toFixed(2)}`);

            cy.assertText(paymentDetailsTable.paymentReference(paymentId, feeRecordId), reference);
          }

          cy.assertText(paymentDetailsTable.facilityId(paymentId, feeRecordId), facilityId);
        });
      });
    });
  });

  describe('facility id filter', () => {
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

  describe('payment currency filter', () => {
    const assertAllPaymentCurrencyInputsAreNotChecked = () => {
      Object.values(CURRENCY).forEach((currency) => {
        filters.paymentCurrencyRadioInput(currency).should('not.be.checked');
      });
    };

    describe('when a payment currency filter is submitted', () => {
      it('should only display the payment with the supplied payment currency and persist the checked currency', () => {
        const paymentCurrencyFilter = CURRENCY.USD;

        const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build();
        const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build();

        const feeRecords = [firstFeeRecord, secondFeeRecord];

        const firstPayment = PaymentEntityMockBuilder.forCurrency(paymentCurrencyFilter)
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

        const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build();

        const feeRecords = [feeRecord];

        const payment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withFeeRecords([feeRecord]).build();

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

        filters.submitButton().click();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`));

        assertAllPaymentCurrencyInputsAreNotChecked();

        errorSummaryErrors().should('have.length', 0);
      });
    });

    describe('when the payment currency filter matches no payments', () => {
      it('should display an error message for no payments found and persist the inputted value', () => {
        const unknownPaymentCurrencyFilter = CURRENCY.JPY;

        const feeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build();
        const payment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withFeeRecords([feeRecord]).build();

        const feeRecords = [feeRecord];

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

  describe('payment reference filter', () => {
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
          relative(
            `/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${completePaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`,
          ),
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
          relative(
            `/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${partialPaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`,
          ),
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
          relative(
            `/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${invalidPaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`,
          ),
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
          relative(
            `/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${unknownPaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`,
          ),
        );

        filters.panel().should('exist');

        filters.paymentReferenceInput().should('have.value', unknownPaymentReferenceFilter);

        filters.noRecordsMatchingFiltersText().should('exist');

        paymentDetailsTable.row(payment.id, feeRecord.id).should('not.exist');
      });
    });
  });

  describe('when multiple filters are submitted', () => {
    it('should only display the payments which match the supplied filters and persist the inputted filter values', () => {
      const paymentCurrencyFilter = CURRENCY.GBP;
      const partialPaymentReferenceFilter = 'payment';
      const partialFacilityIdFilter = '1111';

      const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build();
      const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build();
      const thirdFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(3).withFacilityId('11113333').build();
      const fourthFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(4).withFacilityId('11113333').build();

      const feeRecords = [firstFeeRecord, secondFeeRecord, thirdFeeRecord, fourthFeeRecord];

      const firstPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withId(11)
        .withAmount(100)
        .withReference('First payment ref')
        .withFeeRecords([firstFeeRecord])
        .build();
      const secondPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.EUR)
        .withId(12)
        .withAmount(200)
        .withReference('Second payment ref')
        .withFeeRecords([secondFeeRecord])
        .build();
      const thirdPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withId(13)
        .withAmount(300)
        .withReference('Third payment ref')
        .withFeeRecords([thirdFeeRecord])
        .build();
      const fourthPayment = PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP)
        .withId(14)
        .withAmount(400)
        .withReference('Another ref')
        .withFeeRecords([thirdFeeRecord, fourthFeeRecord])
        .build();

      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [firstPayment, secondPayment, thirdPayment, fourthPayment]);

      const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      filters.paymentCurrencyRadioInput(paymentCurrencyFilter).click();
      cy.keyboardInput(filters.paymentReferenceInput(), partialPaymentReferenceFilter);
      cy.keyboardInput(filters.facilityIdInput(), partialFacilityIdFilter);

      filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(
          `/utilisation-reports/${reportId}?paymentDetailsPaymentCurrency=${paymentCurrencyFilter}&paymentDetailsPaymentReference=${partialPaymentReferenceFilter}&paymentDetailsFacilityId=${partialFacilityIdFilter}#payment-details`,
        ),
      );

      filters.paymentCurrencyRadioInput(paymentCurrencyFilter).should('be.checked');
      filters.paymentReferenceInput().should('have.value', partialPaymentReferenceFilter);
      filters.facilityIdInput().should('have.value', partialFacilityIdFilter);

      paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
      paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('not.exist');
      paymentDetailsTable.row(thirdPayment.id, thirdFeeRecord.id).should('exist');
      paymentDetailsTable.row(fourthPayment.id, thirdFeeRecord.id).should('not.exist');
      paymentDetailsTable.row(fourthPayment.id, fourthFeeRecord.id).should('not.exist');
    });
  });
});
