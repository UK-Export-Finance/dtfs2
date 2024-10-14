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

context(`users can filter payment details by facility id and payment reference and currency`, () => {
  const bankId = '961';
  const reportId = 12;

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId(bankId)
    .withDateUploaded(new Date())
    .build();

  const { paymentDetailsTabLink, paymentDetailsTab } = pages.utilisationReportPage;
  const { filters, paymentDetailsTable } = paymentDetailsTab;

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

      paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
      cy.assertText(paymentDetailsTable.paymentCurrencyAndAmount(firstPayment.id, firstFeeRecord.id), `${CURRENCY.GBP} 100.00`);
      cy.assertText(paymentDetailsTable.paymentReference(firstPayment.id, firstFeeRecord.id), 'ABCD');
      cy.assertText(paymentDetailsTable.facilityId(firstPayment.id, firstFeeRecord.id), '11111111');

      paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('exist');
      cy.assertText(paymentDetailsTable.facilityId(secondPayment.id, secondFeeRecord.id), '22222222');
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
