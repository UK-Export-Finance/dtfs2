import {
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  RECONCILIATION_IN_PROGRESS,
  UtilisationReportEntityMockBuilder,
  FEE_RECORD_STATUS,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import { PDC_TEAMS } from '../../../fixtures/teams';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import USERS from '../../../fixtures/users';
import relative from '../../relativeURL';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context(`${PDC_TEAMS.PDC_RECONCILE} users can filter fee records by facility id`, () => {
  const bankId = '961';
  const reportId = 12;

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
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

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`/utilisation-reports/${reportId}`);
  });

  it('should display all the fee records attached to the utilisation report', () => {
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(3).withFacilityId('33333333').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(4).withFacilityId('44444444').build(),
    ];
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    cy.reload();

    feeRecords.forEach(({ id, facilityId }) => {
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(id).should('exist');
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(id).should('contain', facilityId);
    });
  });

  it('should only display the fee record with the facility id inputted in the filter', () => {
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(3).withFacilityId('33333333').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(4).withFacilityId('44444444').build(),
    ];
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    cy.reload();

    cy.keyboardInput(pages.utilisationReportPage.premiumPaymentsTab.getFacilityIdFilterInput(), '11111111');
    pages.utilisationReportPage.premiumPaymentsTab.submitFacilityIdFilter();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}?premiumPaymentsFacilityId=11111111`));

    const [visibleFeeRecord, ...removedFeeRecords] = feeRecords;

    pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(visibleFeeRecord.id).should('exist');
    pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(visibleFeeRecord.id).should('contain', visibleFeeRecord.facilityId);

    removedFeeRecords.forEach(({ id }) => {
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(id).should('not.exist');
    });
  });

  it('should display the fee records which partially match the supplied facility id query', () => {
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('11112222').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(3).withFacilityId('33333333').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(4).withFacilityId('44444444').build(),
    ];
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    cy.reload();

    cy.keyboardInput(pages.utilisationReportPage.premiumPaymentsTab.getFacilityIdFilterInput(), '1111');
    pages.utilisationReportPage.premiumPaymentsTab.submitFacilityIdFilter();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}?premiumPaymentsFacilityId=1111`));

    const [firstVisibleFeeRecord, secondVisibleFeeRecord, ...removedFeeRecords] = feeRecords;

    pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(firstVisibleFeeRecord.id).should('exist');
    pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(firstVisibleFeeRecord.id).should('contain', firstVisibleFeeRecord.facilityId);

    pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(secondVisibleFeeRecord.id).should('exist');
    pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(secondVisibleFeeRecord.id).should('contain', secondVisibleFeeRecord.facilityId);

    removedFeeRecords.forEach(({ id }) => {
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(id).should('not.exist');
    });
  });

  it('should display an error if the supplied facility id query is an invalid value and persist the inputted value', () => {
    cy.keyboardInput(pages.utilisationReportPage.premiumPaymentsTab.getFacilityIdFilterInput(), 'nonsense');
    pages.utilisationReportPage.premiumPaymentsTab.submitFacilityIdFilter();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}?premiumPaymentsFacilityId=nonsense`));

    pages.utilisationReportPage.premiumPaymentsTab.getFacilityIdFilterInput().should('have.value', 'nonsense');

    cy.get('a').should('contain', 'Facility ID must be a number');
  });

  it('should display an error if the facility id is submitted with no value', () => {
    pages.utilisationReportPage.premiumPaymentsTab.submitFacilityIdFilter();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}?premiumPaymentsFacilityId=`));

    pages.utilisationReportPage.premiumPaymentsTab.getFacilityIdFilterInput().should('be.empty');

    cy.get('a').should('contain', 'Enter a facility ID');
  });

  it('should display the entire fee record payment group when only one of the fee records in the group has a matching facility id', () => {
    const groupedFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).withFacilityId('11111111').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).withFacilityId('22222222').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(3).withStatus(FEE_RECORD_STATUS.DOES_NOT_MATCH).withFacilityId('33333333').build(),
    ];

    const toDoFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(4).withStatus(FEE_RECORD_STATUS.TO_DO).withFacilityId('44444444').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(5).withStatus(FEE_RECORD_STATUS.TO_DO).withFacilityId('55555555').build(),
    ];

    const allFeeRecords = [...groupedFeeRecords, ...toDoFeeRecords];

    const paymentId = 15;
    const payment = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).withAmount(100).withFeeRecords(groupedFeeRecords).build();

    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, allFeeRecords);
    cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [payment]);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(allFeeRecords);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    cy.reload();

    allFeeRecords.forEach(({ id, facilityId }) => {
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(id).should('exist');
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(id).should('contain', facilityId);
    });

    pages.utilisationReportPage.premiumPaymentsTab.getPaymentLink(paymentId).should('exist');

    cy.keyboardInput(pages.utilisationReportPage.premiumPaymentsTab.getFacilityIdFilterInput(), '1111');
    pages.utilisationReportPage.premiumPaymentsTab.submitFacilityIdFilter();

    toDoFeeRecords.forEach(({ id }) => {
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(id).should('not.exist');
    });

    groupedFeeRecords.forEach(({ id, facilityId }) => {
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(id).should('exist');
      pages.utilisationReportPage.premiumPaymentsTab.premiumPaymentsTable.row(id).should('contain', facilityId);
    });

    pages.utilisationReportPage.premiumPaymentsTab.getPaymentLink(paymentId).should('exist');
  });

  it('displays a message when the supplied facility id matches no fee records', () => {
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build(),
    ];
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);

    cy.reload();

    cy.keyboardInput(pages.utilisationReportPage.premiumPaymentsTab.getFacilityIdFilterInput(), '33333333');
    pages.utilisationReportPage.premiumPaymentsTab.submitFacilityIdFilter();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}?premiumPaymentsFacilityId=33333333`));

    cy.get('[data-cy="no-matched-facilities-message"]').should('exist');
    cy.get('[data-cy="no-matched-facilities-message"]').should('contain', 'Your search matched no facilities');
    cy.get('[data-cy="no-matched-facilities-message"]').should('contain', 'There are no results for the facility ID you entered');
  });
});
