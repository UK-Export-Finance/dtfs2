import {
  FeeRecordEntityMockBuilder,
  PaymentEntityMockBuilder,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import { PDC_TEAMS } from '../../../fixtures/teams';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import USERS from '../../../fixtures/users';
import relative from '../../relativeURL';

context(`${PDC_TEAMS.PDC_RECONCILE} users can filter fee records by facility id`, () => {
  const bankId = '961';
  const reportId = 12;

  const utilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS)
    .withId(reportId)
    .withBankId(bankId)
    .withDateUploaded(new Date())
    .build();

  beforeEach(() => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

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

    cy.reload();

    feeRecords.forEach(({ id, facilityId }) => {
      pages.utilisationReportsPage.getPremiumPaymentsTableRow(id).should('exist');
      pages.utilisationReportsPage.getPremiumPaymentsTableRow(id).should('contain', facilityId);
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

    cy.reload();

    pages.utilisationReportsPage.getFacilityIdFilterInput().type('11111111');
    pages.utilisationReportsPage.submitFacilityIdFilter();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}?facilityIdQuery=11111111`));

    const [visibleFeeRecord, ...removedFeeRecords] = feeRecords;

    pages.utilisationReportsPage.getPremiumPaymentsTableRow(visibleFeeRecord.id).should('exist');
    pages.utilisationReportsPage.getPremiumPaymentsTableRow(visibleFeeRecord.id).should('contain', visibleFeeRecord.facilityId);

    removedFeeRecords.forEach(({ id }) => {
      pages.utilisationReportsPage.getPremiumPaymentsTableRow(id).should('not.exist');
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

    cy.reload();

    pages.utilisationReportsPage.getFacilityIdFilterInput().type('1111');
    pages.utilisationReportsPage.submitFacilityIdFilter();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}?facilityIdQuery=1111`));

    const [firstVisibleFeeRecord, secondVisibleFeeRecord, ...removedFeeRecords] = feeRecords;

    pages.utilisationReportsPage.getPremiumPaymentsTableRow(firstVisibleFeeRecord.id).should('exist');
    pages.utilisationReportsPage.getPremiumPaymentsTableRow(firstVisibleFeeRecord.id).should('contain', firstVisibleFeeRecord.facilityId);

    pages.utilisationReportsPage.getPremiumPaymentsTableRow(secondVisibleFeeRecord.id).should('exist');
    pages.utilisationReportsPage.getPremiumPaymentsTableRow(secondVisibleFeeRecord.id).should('contain', secondVisibleFeeRecord.facilityId);

    removedFeeRecords.forEach(({ id }) => {
      pages.utilisationReportsPage.getPremiumPaymentsTableRow(id).should('not.exist');
    });
  });

  it('should display an error if the supplied facility id query is an invalid value and persist the inputted value', () => {
    pages.utilisationReportsPage.getFacilityIdFilterInput().type('nonsense');
    pages.utilisationReportsPage.submitFacilityIdFilter();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}?facilityIdQuery=nonsense`));

    pages.utilisationReportsPage.getFacilityIdFilterInput().should('have.value', 'nonsense');

    cy.get('a').should('contain', 'Enter 4-10 characters of a facility ID');
  });

  it('should display an error if the facility id is submitted with no value', () => {
    pages.utilisationReportsPage.submitFacilityIdFilter();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}?facilityIdQuery=`));

    pages.utilisationReportsPage.getFacilityIdFilterInput().should('be.empty');

    cy.get('a').should('contain', 'Enter 4-10 characters of a facility ID');
  });

  it('should display the entire fee record payment group when only one of the fee records in the group has a matching facility id', () => {
    const groupedFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withStatus('DOES_NOT_MATCH').withFacilityId('11111111').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withStatus('DOES_NOT_MATCH').withFacilityId('22222222').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(3).withStatus('DOES_NOT_MATCH').withFacilityId('33333333').build(),
    ];

    const toDoFeeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(4).withStatus('TO_DO').withFacilityId('44444444').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(5).withStatus('TO_DO').withFacilityId('55555555').build(),
    ];

    const allFeeRecords = [...groupedFeeRecords, ...toDoFeeRecords];

    const paymentId = 15;
    const payment = PaymentEntityMockBuilder.forCurrency('GBP').withId(paymentId).withAmount(100).withFeeRecords(groupedFeeRecords).build();

    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, allFeeRecords);
    cy.task(NODE_TASKS.INSERT_PAYMENTS_INTO_DB, [payment]);

    cy.reload();

    allFeeRecords.forEach(({ id, facilityId }) => {
      pages.utilisationReportsPage.getPremiumPaymentsTableRow(id).should('exist');
      pages.utilisationReportsPage.getPremiumPaymentsTableRow(id).should('contain', facilityId);
    });

    pages.utilisationReportsPage.getPaymentLink(paymentId).should('exist');

    pages.utilisationReportsPage.getFacilityIdFilterInput().type('1111');
    pages.utilisationReportsPage.submitFacilityIdFilter();

    toDoFeeRecords.forEach(({ id }) => {
      pages.utilisationReportsPage.getPremiumPaymentsTableRow(id).should('not.exist');
    });

    groupedFeeRecords.forEach(({ id, facilityId }) => {
      pages.utilisationReportsPage.getPremiumPaymentsTableRow(id).should('exist');
      pages.utilisationReportsPage.getPremiumPaymentsTableRow(id).should('contain', facilityId);
    });

    pages.utilisationReportsPage.getPaymentLink(paymentId).should('exist');
  });

  it('displays a message when the supplied facility id matches no fee records', () => {
    const feeRecords = [
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).withFacilityId('11111111').build(),
      FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).withFacilityId('22222222').build(),
    ];
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

    cy.reload();

    pages.utilisationReportsPage.getFacilityIdFilterInput().type('33333333');
    pages.utilisationReportsPage.submitFacilityIdFilter();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}?facilityIdQuery=33333333`));

    cy.get('[data-cy="no-matched-facilities-message"]').should('exist');
    cy.get('[data-cy="no-matched-facilities-message"]').should('contain', 'Your search matched no facilities');
    cy.get('[data-cy="no-matched-facilities-message"]').should('contain', 'There are no results for the facility ID you entered');
  });
});
