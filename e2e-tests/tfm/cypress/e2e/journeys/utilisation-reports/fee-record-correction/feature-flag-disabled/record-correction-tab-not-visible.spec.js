import { PENDING_RECONCILIATION, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';

const { utilisationReportPage } = pages;

context('When fee record correction feature flag is disabled', () => {
  context('The record correction tab is not visible for PDC_RECONCILE users', () => {
    const bankId = '961';
    const reportId = 1;

    const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();

    before(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
    });

    beforeEach(() => {
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);

      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    afterEach(() => {
      cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
      cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
    });

    it('should NOT display create record correction request button', () => {
      utilisationReportPage.recordCorrectionHistoryTabLink().should('not.exist');
    });
  });
});
