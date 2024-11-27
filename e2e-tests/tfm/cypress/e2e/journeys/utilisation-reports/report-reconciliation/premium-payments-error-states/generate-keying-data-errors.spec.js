import { FEE_RECORD_STATUS, FeeRecordEntityMockBuilder, PENDING_RECONCILIATION, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';
import relative from '../../../../relativeURL';
import { errorSummary } from '../../../../partials';
import { getMatchingTfmFacilitiesForFeeRecords } from '../../../../../support/utils/getMatchingTfmFacilitiesForFeeRecords';

context('PDC_RECONCILE users cannot generate keying data when no data to generate', () => {
  const bankId = '961';
  const reportId = 1;

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();
  const toDoFeeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(1).withStatus(FEE_RECORD_STATUS.TO_DO).build();

  const { premiumPaymentsTab } = pages.utilisationReportPage;

  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

    const feeRecords = [toDoFeeRecord];
    cy.task(NODE_TASKS.INSERT_FEE_RECORDS_INTO_DB, feeRecords);

    const matchingTfmFacilities = getMatchingTfmFacilitiesForFeeRecords(feeRecords);
    cy.task(NODE_TASKS.INSERT_TFM_FACILITIES_INTO_DB, matchingTfmFacilities);
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  beforeEach(() => {
    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    cy.visit(`utilisation-reports/${reportId}`);
  });

  it('should not allow user to generate keying data when there are no fees at MATCH status', () => {
    premiumPaymentsTab.generateKeyingDataButton().click();

    cy.url().should('eq', relative(`/utilisation-reports/${reportId}`));

    errorSummary().contains('No matched fees to generate keying data with');
    premiumPaymentsTab.premiumPaymentsTable.error().should('exist');
    cy.assertText(premiumPaymentsTab.premiumPaymentsTable.error(), 'Error: No matched fees to generate keying data with');
  });
});
