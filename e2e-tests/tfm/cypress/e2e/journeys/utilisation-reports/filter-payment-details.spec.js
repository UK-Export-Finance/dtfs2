import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
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

      pages.utilisationReportPage.paymentDetailsTabLink().click();

      // On first page load, the filter panel should be visible.
      pages.utilisationReportPage.paymentDetailsTab.filters.panel().should('be.visible');

      cy.assertText(pages.utilisationReportPage.paymentDetailsTab.filters.panelToggleButton(), 'Hide filters');
      pages.utilisationReportPage.paymentDetailsTab.filters.panelToggleButton().click();
      pages.utilisationReportPage.paymentDetailsTab.filters.panel().should('not.be.visible');

      cy.assertText(pages.utilisationReportPage.paymentDetailsTab.filters.panelToggleButton(), 'Show filters');
      pages.utilisationReportPage.paymentDetailsTab.filters.panelToggleButton().click();
      pages.utilisationReportPage.paymentDetailsTab.filters.panel().should('be.visible');
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

      pages.utilisationReportPage.paymentDetailsTabLink().click();

      payments.forEach(({ id: paymentId, currency, amount, reference, feeRecords: paymentFeeRecords }) => {
        paymentFeeRecords.forEach(({ id: feeRecordId, facilityId }, index) => {
          pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(paymentId, feeRecordId).should('exist');

          const isFirstFeeRecordRow = index === 0;

          if (isFirstFeeRecordRow) {
            cy.assertText(
              pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.paymentCurrencyAndAmount(paymentId, feeRecordId),
              `${currency} ${amount.toFixed(2)}`,
            );

            cy.assertText(pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.paymentReference(paymentId, feeRecordId), reference);
          }

          cy.assertText(pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.facilityId(paymentId, feeRecordId), facilityId);
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput(), completeFacilityIdFilter);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${completeFacilityIdFilter}#payment-details`),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', completeFacilityIdFilter);

        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('not.exist');
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput(), partialFacilityIdFilter);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${partialFacilityIdFilter}#payment-details`),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', partialFacilityIdFilter);

        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('not.exist');
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput(), invalidFacilityIdFilter);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${invalidFacilityIdFilter}#payment-details`),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', invalidFacilityIdFilter);

        pages.utilisationReportPage.paymentDetailsTab.errorSummaryErrors().should('have.length', 1);
        cy.assertText(pages.utilisationReportPage.paymentDetailsTab.errorSummaryErrors().eq(0), expectedErrorMessage);

        cy.assertText(pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdError(), `Error: ${expectedErrorMessage}`);
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', emptyFacilityIdFilter);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`));

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', emptyFacilityIdFilter);

        pages.utilisationReportPage.paymentDetailsTab.errorSummaryErrors().should('have.length', 0);
        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdError().should('not.exist');
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput(), unknownFacilityIdFilter);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${unknownFacilityIdFilter}#payment-details`),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.panel().should('exist');

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', unknownFacilityIdFilter);

        pages.utilisationReportPage.paymentDetailsTab.filters.noRecordsMatchingFiltersText().should('exist');

        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(payment.id, feeRecord.id).should('not.exist');
      });
    });
  });

  describe('payment currency filter', () => {
    const assertAllPaymentCurrencyInputsAreNotChecked = () => {
      Object.values(CURRENCY).forEach((currency) => {
        pages.utilisationReportPage.paymentDetailsTab.filters.paymentCurrencyRadioInput(currency).should('not.be.checked');
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        pages.utilisationReportPage.paymentDetailsTab.filters.paymentCurrencyRadioInput(paymentCurrencyFilter).click();
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(
            `/utilisation-reports/${reportId}?paymentDetailsPaymentCurrency=${paymentCurrencyFilter}&paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`,
          ),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.paymentCurrencyRadioInput(paymentCurrencyFilter).should('be.checked');

        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('not.exist');
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`));

        assertAllPaymentCurrencyInputsAreNotChecked();

        pages.utilisationReportPage.paymentDetailsTab.errorSummaryErrors().should('have.length', 0);
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        pages.utilisationReportPage.paymentDetailsTab.filters.paymentCurrencyRadioInput(unknownPaymentCurrencyFilter).click();
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(
            `/utilisation-reports/${reportId}?paymentDetailsPaymentCurrency=${unknownPaymentCurrencyFilter}&paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`,
          ),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.panel().should('exist');

        pages.utilisationReportPage.paymentDetailsTab.filters.paymentCurrencyRadioInput(unknownPaymentCurrencyFilter).should('be.checked');

        pages.utilisationReportPage.paymentDetailsTab.filters.noRecordsMatchingFiltersText().should('exist');

        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(payment.id, feeRecord.id).should('not.exist');
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput(), completePaymentReferenceFilter);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(
            `/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${completePaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`,
          ),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput().should('have.value', completePaymentReferenceFilter);

        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(secondPayment.id, firstFeeRecord.id).should('not.exist');
        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(thirdPayment.id, secondFeeRecord.id).should('not.exist');
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput(), partialPaymentReferenceFilter);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(
            `/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${partialPaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`,
          ),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput().should('have.value', partialPaymentReferenceFilter);

        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('not.exist');
      });
    });

    describe('when the payment reference filter is submitted with an invalid value', () => {
      it('should display an error message for invalid payment reference and persist the inputted value', () => {
        const invalidPaymentReferenceFilter = '123'; // Invalid due to length.
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput(), invalidPaymentReferenceFilter);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(
            `/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${invalidPaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`,
          ),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput().should('have.value', invalidPaymentReferenceFilter);

        pages.utilisationReportPage.paymentDetailsTab.errorSummaryErrors().should('have.length', 1);
        cy.assertText(pages.utilisationReportPage.paymentDetailsTab.errorSummaryErrors().eq(0), expectedErrorMessage);

        cy.assertText(pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceError(), `Error: ${expectedErrorMessage}`);
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput().should('have.value', emptyPaymentReferenceFilter);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`));

        pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput().should('have.value', emptyPaymentReferenceFilter);

        pages.utilisationReportPage.paymentDetailsTab.errorSummaryErrors().should('have.length', 0);
        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdError().should('not.exist');
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

        pages.utilisationReportPage.paymentDetailsTabLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput(), unknownPaymentReferenceFilter);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(
            `/utilisation-reports/${reportId}?paymentDetailsPaymentReference=${unknownPaymentReferenceFilter}&paymentDetailsFacilityId=#payment-details`,
          ),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.panel().should('exist');

        pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput().should('have.value', unknownPaymentReferenceFilter);

        pages.utilisationReportPage.paymentDetailsTab.filters.noRecordsMatchingFiltersText().should('exist');

        pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(payment.id, feeRecord.id).should('not.exist');
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

      pages.utilisationReportPage.paymentDetailsTabLink().click();

      pages.utilisationReportPage.paymentDetailsTab.filters.paymentCurrencyRadioInput(paymentCurrencyFilter).click();
      cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput(), partialPaymentReferenceFilter);
      cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput(), partialFacilityIdFilter);

      pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

      cy.url().should(
        'eq',
        relative(
          `/utilisation-reports/${reportId}?paymentDetailsPaymentCurrency=${paymentCurrencyFilter}&paymentDetailsPaymentReference=${partialPaymentReferenceFilter}&paymentDetailsFacilityId=${partialFacilityIdFilter}#payment-details`,
        ),
      );

      pages.utilisationReportPage.paymentDetailsTab.filters.paymentCurrencyRadioInput(paymentCurrencyFilter).should('be.checked');
      pages.utilisationReportPage.paymentDetailsTab.filters.paymentReferenceInput().should('have.value', partialPaymentReferenceFilter);
      pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', partialFacilityIdFilter);

      pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
      pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('not.exist');
      pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(thirdPayment.id, thirdFeeRecord.id).should('exist');
      pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(fourthPayment.id, thirdFeeRecord.id).should('not.exist');
      pages.utilisationReportPage.paymentDetailsTab.paymentDetailsTable.row(fourthPayment.id, fourthFeeRecord.id).should('not.exist');
    });
  });
});
