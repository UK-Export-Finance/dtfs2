import {
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import USERS from '../../../fixtures/users';
import relative from '../../relativeURL';

context(`users can filter payment details by facility id and payment reference and currency`, () => {
  const bankId = '961';
  const reportId = 12;

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId(bankId)
    .withDateUploaded(new Date())
    .build();

  const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build();
  const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build();
  const thirdFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(3).withFacilityId('33333333').build();

  const firstPayment = PaymentEntityMockBuilder.forCurrency('GBP')
    .withId(2)
    .withAmount(100)
    .withReference('ABC')
    .withFeeRecords([firstFeeRecord, secondFeeRecord])
    .build();
  const secondPayment = PaymentEntityMockBuilder.forCurrency('GBP').withId(3).withAmount(200).withReference('DEF').withFeeRecords([thirdFeeRecord]).build();

  const payments = [firstPayment, secondPayment];

  before(() => {
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [utilisationReport]);

    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, [firstFeeRecord, secondFeeRecord, thirdFeeRecord]);
    cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, payments);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`/utilisation-reports/${reportId}`);
  });

  describe('when filter panel toggle button is clicked', () => {
    it('should toggle the filter panel', () => {
      pages.utilisationReportPage.paymentDetailsLink().click();

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
      pages.utilisationReportPage.paymentDetailsLink().click();

      payments.forEach(({ id: paymentId, currency, amount, reference, feeRecords }) => {
        feeRecords.forEach(({ id: feeRecordId, facilityId }, index) => {
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
        const completeFacilityId = '11111111';

        pages.utilisationReportPage.paymentDetailsLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput(), completeFacilityId);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${completeFacilityId}#payment-details`),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', completeFacilityId);

        // TODO FN-2311: Test that the expected payment is displayed, and other non-matching payments are not displayed.
      });
    });

    describe('when a partial facility id filter is submitted', () => {
      it('should only display the payments which partially match the supplied facility id and persist the inputted value', () => {
        // TODO FN-2311: Add implementation, to be based on the complete case above once this is implemented.
      });
    });

    describe('when the facility id filter is submitted with an invalid value', () => {
      it('should display an error message for invalid facility id and persist the inputted value', () => {
        const invalidFacilityId = '123';
        const expectedErrorMessage = 'Facility ID must be blank or contain between 4 and 10 numbers';

        pages.utilisationReportPage.paymentDetailsLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput(), invalidFacilityId);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${invalidFacilityId}#payment-details`),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', invalidFacilityId);

        pages.utilisationReportPage.paymentDetailsTab.errorSummaryErrors().should('have.length', 1);
        cy.assertText(pages.utilisationReportPage.paymentDetailsTab.errorSummaryErrors().eq(0), expectedErrorMessage);

        cy.assertText(pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdError(), `Error: ${expectedErrorMessage}`);
      });
    });

    describe('when the facility id filter is submitted with no value', () => {
      it('should persist the inputted value and not display any error messages', () => {
        const emptyFacilityId = '';

        pages.utilisationReportPage.paymentDetailsLink().click();

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', emptyFacilityId);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should('eq', relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=#payment-details`));

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', emptyFacilityId);

        pages.utilisationReportPage.paymentDetailsTab.errorSummaryErrors().should('have.length', 0);
        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdError().should('not.exist');
      });
    });

    describe('when the facility id filter matches no payments', () => {
      it('should display an error message for no payments found and persist the inputted value', () => {
        const unknownFacilityId = '99999999';

        pages.utilisationReportPage.paymentDetailsLink().click();

        cy.keyboardInput(pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput(), unknownFacilityId);
        pages.utilisationReportPage.paymentDetailsTab.filters.submitButton().click();

        cy.url().should(
          'eq',
          relative(`/utilisation-reports/${reportId}?paymentDetailsPaymentReference=&paymentDetailsFacilityId=${unknownFacilityId}#payment-details`),
        );

        pages.utilisationReportPage.paymentDetailsTab.filters.facilityIdInput().should('have.value', unknownFacilityId);

        // TODO FN-2311: Test that error message is shown once this is in place.
      });
    });
  });

  // TODO FN-2311: Add additional tests for other filters
});
