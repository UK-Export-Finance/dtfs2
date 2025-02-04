import {
  CURRENCY,
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntityMockBuilder,
  FEE_RECORD_STATUS,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import USERS from '../../../../fixtures/users';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context(`users can sort premium payments table by total reported payments and total payments received and status`, () => {
  const bankId = '961';
  const reportId = 12;

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId(bankId)
    .withDateUploaded(new Date())
    .build();

  const firstFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(1)
    .withFeesPaidToUkefForThePeriod(30)
    .withFeesPaidToUkefForThePeriodCurrency('EUR')
    .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
    .withFacilityId('11111111')
    .build();
  const secondFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(2)
    .withFeesPaidToUkefForThePeriod(20)
    .withFeesPaidToUkefForThePeriodCurrency(CURRENCY.GBP)
    .withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH)
    .withFacilityId('22222222')
    .build();
  const thirdFeeRecord = FeeRecordEntityMockBuilder.forReport(utilisationReport)
    .withId(3)
    .withFeesPaidToUkefForThePeriod(10)
    .withFeesPaidToUkefForThePeriodCurrency('USD')
    .withFacilityId('33333333')
    .build();
  const feeRecords = [firstFeeRecord, secondFeeRecord, thirdFeeRecord];
  const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);

  const firstPayment = PaymentEntityMockBuilder.forCurrency('USD').withId(1).withAmount(300).withFeeRecords([firstFeeRecord]).build();
  const secondPayment = PaymentEntityMockBuilder.forCurrency('EUR').withId(2).withAmount(200).withFeeRecords([secondFeeRecord]).build();

  before(() => {
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.DELETE_ALL_TFM_FACILITIES_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [utilisationReport]);

    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
    cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [firstPayment, secondPayment]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`/utilisation-reports/${reportId}`);
  });

  describe('when status column heading is clicked', () => {
    it('should sort the rows by status', () => {
      pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.header.status().click();

      // Check that the rows are sorted by status by checking the facility IDs.

      // Facility 22222222 has status 'DOES_NOT_MATCH' (alphabetically first) and has the lowest total reported payments
      // (secondary sorting criteria, ascending), so it should appear first.
      cy.assertText(pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.rowIndex(0).facilityId(), '22222222');

      // Facility 11111111 also has status 'DOES_NOT_MATCH' but has a slightly higher total reported payments, so it
      // should appear second.
      cy.assertText(pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.rowIndex(1).facilityId(), '11111111');

      // Facility 33333333 has status 'TO_DO' (alphabetically last), so it should appear last.
      cy.assertText(pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.rowIndex(2).facilityId(), '33333333');
    });
  });

  describe('when total payment received column heading is clicked', () => {
    it('should sort the rows by total payment received', () => {
      pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.header.totalPaymentsReceived().click();

      // Check that the rows are sorted by total payment received by checking the facility IDs.

      // Facility 33333333 has no reported payments, so it should appear first.
      cy.assertText(pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.rowIndex(0).facilityId(), '33333333');

      // Facility 22222222 has the highest total reported payments (200 EUR), so it should appear second.
      cy.assertText(pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.rowIndex(1).facilityId(), '22222222');

      // Facility 11111111 has the lowest total reported payments (300 USD), so it should appear last.
      cy.assertText(pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.rowIndex(2).facilityId(), '11111111');
    });
  });

  describe('when total reported payments column heading is clicked', () => {
    it('should sort the rows by total reported payments', () => {
      pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.header.totalReportedPayments().click();

      // Check that the rows are sorted by total reported payments by checking the facility IDs.

      // NOTE: This column is the default sorting column and defaults to ascending, therefore the descending case is being tested.

      // Facility 11111111 has reported payment currency 'EUR' (alphabetically first), so it should appear first.
      cy.assertText(pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.rowIndex(0).facilityId(), '11111111');

      // Facility 22222222 has reported payment currency 'GBP' (alphabetically second), so it should appear second.
      cy.assertText(pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.rowIndex(1).facilityId(), '22222222');

      // Facility 33333333 has reported payment currency 'USD' (alphabetically last), so it should appear last.
      cy.assertText(pages.utilisationReportPage.tabs.premiumPaymentsContent.premiumPaymentsTable.rowIndex(2).facilityId(), '33333333');
    });
  });
});
