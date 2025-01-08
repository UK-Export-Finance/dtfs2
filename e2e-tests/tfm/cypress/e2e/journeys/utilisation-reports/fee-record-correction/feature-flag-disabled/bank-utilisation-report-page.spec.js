import { PENDING_RECONCILIATION, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import pages from '../../../../pages';
import USERS from '../../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../../e2e-fixtures';

const { utilisationReportPage } = pages;

context('When fee record correction feature flag is disabled', () => {
  const bankId = '961';
  const reportId = 1;

  const report = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).withBankId(bankId).build();

  before(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [report]);
  });

  after(() => {
    cy.task(NODE_TASKS.DELETE_ALL_FROM_SQL_DB);
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

  context('The record correction tab and text is not visible for PDC_RECONCILE users', () => {
    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_RECONCILE);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    it('should NOT display the record correction log tab', () => {
      utilisationReportPage.tabs.recordCorrectionLog().should('not.exist');
    });

    it('should NOT display the record correction text', () => {
      utilisationReportPage.premiumPaymentsTab.createRecordCorrectionRequestText().should('not.exist');
    });
  });

  context('The record correction tab and text is not visible for PDC_READ users', () => {
    beforeEach(() => {
      pages.landingPage.visit();
      cy.login(USERS.PDC_READ);

      cy.visit(`utilisation-reports/${reportId}`);
    });

    it('should NOT display the record correction log tab', () => {
      utilisationReportPage.tabs.recordCorrectionLog().should('not.exist');
    });

    it('should NOT display the record correction text', () => {
      utilisationReportPage.premiumPaymentsTab.createRecordCorrectionRequestText().should('not.exist');
    });
  });
});
