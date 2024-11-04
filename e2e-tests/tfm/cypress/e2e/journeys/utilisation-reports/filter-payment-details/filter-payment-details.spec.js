import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
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

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId(bankId)
    .withDateUploaded(new Date())
    .build();

  const { paymentDetailsTabLink, paymentDetailsTab } = pages.utilisationReportPage;
  const { filters, paymentDetailsTable } = paymentDetailsTab;

  const aPaymentWithFeeRecords = (feeRecords) => PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withFeeRecords(feeRecords).build();

  const aPaymentWithIdFeeRecordsAndReference = (id, feeRecords, reference) =>
    PaymentEntityMockBuilder.forCurrency(CURRENCY.GBP).withId(id).withFeeRecords(feeRecords).withReference(reference).build();

  const aFeeRecordWithId = (id) => FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(id).build();

  const aFeeRecordWithIdAndFacilityId = (id, facilityId) =>
    FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(id).withFacilityId(facilityId).build();

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
      const feeRecord = aFeeRecordWithId(1);
      const feeRecords = [feeRecord];

      const payment = aPaymentWithFeeRecords(feeRecords);

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
    const firstFeeRecord = aFeeRecordWithIdAndFacilityId(1, '11111111');
    const secondFeeRecord = aFeeRecordWithIdAndFacilityId(2, '22222222');
    const feeRecords = [firstFeeRecord, secondFeeRecord];

    const firstPayment = aPaymentWithIdFeeRecordsAndReference(11, [firstFeeRecord], 'ABCD');
    const secondPayment = aPaymentWithIdFeeRecordsAndReference(12, [secondFeeRecord], 'EFGH');
    const payments = [firstPayment, secondPayment];

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);

    beforeEach(() => {
      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, payments);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();
    });

    it('should display all the payments attached to the utilisation report', () => {
      paymentDetailsTable.row(firstPayment.id, firstFeeRecord.id).should('exist');
      cy.assertText(paymentDetailsTable.paymentCurrencyAndAmount(firstPayment.id, firstFeeRecord.id), `${CURRENCY.GBP} 100.00`);
      cy.assertText(paymentDetailsTable.paymentReference(firstPayment.id, firstFeeRecord.id), 'ABCD');
      cy.assertText(paymentDetailsTable.facilityId(firstPayment.id, firstFeeRecord.id), '11111111');

      paymentDetailsTable.row(secondPayment.id, secondFeeRecord.id).should('exist');
      cy.assertText(paymentDetailsTable.paymentCurrencyAndAmount(secondPayment.id, secondFeeRecord.id), `${CURRENCY.GBP} 100.00`);
      cy.assertText(paymentDetailsTable.paymentReference(secondPayment.id, secondFeeRecord.id), 'EFGH');
      cy.assertText(paymentDetailsTable.facilityId(secondPayment.id, secondFeeRecord.id), '22222222');
    });

    it('should not display selected filters text', () => {
      filters.panel().should('not.contain', 'Selected filters');
    });
  });

  describe('when multiple filters are submitted', () => {
    const paymentCurrencyFilter = CURRENCY.GBP;
    const partialPaymentReferenceFilter = 'payment';
    const partialFacilityIdFilter = '1111';

    const firstFeeRecord = aFeeRecordWithIdAndFacilityId(1, '11111111');
    const secondFeeRecord = aFeeRecordWithIdAndFacilityId(2, '22222222');
    const thirdFeeRecord = aFeeRecordWithIdAndFacilityId(3, '11113333');
    const fourthFeeRecord = aFeeRecordWithIdAndFacilityId(4, '11113333');
    const feeRecords = [firstFeeRecord, secondFeeRecord, thirdFeeRecord, fourthFeeRecord];

    const firstPayment = aPaymentWithIdFeeRecordsAndReference(11, [firstFeeRecord], 'First payment ref');
    const secondPayment = aPaymentWithIdFeeRecordsAndReference(12, [secondFeeRecord], 'Second payment ref');
    const thirdPayment = aPaymentWithIdFeeRecordsAndReference(13, [thirdFeeRecord], 'Third payment ref');
    const fourthPayment = aPaymentWithIdFeeRecordsAndReference(14, [thirdFeeRecord, fourthFeeRecord], 'Another ref');

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);

    beforeEach(() => {
      cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
      cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [firstPayment, secondPayment, thirdPayment, fourthPayment]);
      cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`/utilisation-reports/${reportId}`);

      paymentDetailsTabLink().click();

      filters.paymentCurrencyRadioInput(paymentCurrencyFilter).click();
      cy.keyboardInput(filters.paymentReferenceInput(), partialPaymentReferenceFilter);
      cy.keyboardInput(filters.facilityIdInput(), partialFacilityIdFilter);

      filters.submitButton().click();
    });

    it('should only display the payments which match the supplied filters and persist the inputted filter values', () => {
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

    it('should display all applied filters as selected filters', () => {
      filters.panel().should('contain', 'Selected filters');

      filters.panel().within(() => {
        cy.assertText(cy.get('h3').eq(0), 'Currency');
        cy.assertText(cy.get('h3').eq(1), 'Payment reference');
        cy.assertText(cy.get('h3').eq(2), 'Facility ID');
      });

      cy.assertText(filters.selectedFilter(paymentCurrencyFilter), `Remove this filter ${paymentCurrencyFilter}`);
      cy.assertText(filters.selectedFilter(partialPaymentReferenceFilter), `Remove this filter ${partialPaymentReferenceFilter}`);
      cy.assertText(filters.selectedFilter(partialFacilityIdFilter), `Remove this filter ${partialFacilityIdFilter}`);

      cy.assertText(filters.actionBarItem(partialFacilityIdFilter), `Remove this filter ${partialFacilityIdFilter}`);
      cy.assertText(filters.actionBarItem(paymentCurrencyFilter), `Remove this filter ${paymentCurrencyFilter}`);
      cy.assertText(filters.actionBarItem(partialPaymentReferenceFilter), `Remove this filter ${partialPaymentReferenceFilter}`);
    });

    it('should remove all filters when clear filters button clicked', () => {
      filters.clearFiltersLink().click();

      filters.panel().should('not.contain', 'Selected filters');

      filters.paymentCurrencyRadioInput(paymentCurrencyFilter).should('not.be.checked');
      filters.paymentReferenceInput().should('have.value', '');
      filters.facilityIdInput().should('have.value', '');
    });

    it('should remove selected filter when selected filter clicked and leave other filters in place', () => {
      filters.selectedFilter('1111').click();

      filters.paymentCurrencyRadioInput(paymentCurrencyFilter).should('be.checked');
      filters.paymentReferenceInput().should('have.value', partialPaymentReferenceFilter);
      filters.facilityIdInput().should('have.value', '');

      filters.panel().within(() => {
        cy.assertText(cy.get('h3').eq(0), 'Currency');
        cy.assertText(cy.get('h3').eq(1), 'Payment reference');
      });

      cy.assertText(filters.selectedFilter(paymentCurrencyFilter), `Remove this filter ${paymentCurrencyFilter}`);
      cy.assertText(filters.selectedFilter(partialPaymentReferenceFilter), `Remove this filter ${partialPaymentReferenceFilter}`);

      cy.assertText(filters.actionBarItem(paymentCurrencyFilter), `Remove this filter ${paymentCurrencyFilter}`);
      cy.assertText(filters.actionBarItem(partialPaymentReferenceFilter), `Remove this filter ${partialPaymentReferenceFilter}`);
    });
  });
});
