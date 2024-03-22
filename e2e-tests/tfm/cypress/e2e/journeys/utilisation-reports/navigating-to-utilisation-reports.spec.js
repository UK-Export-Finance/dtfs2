import {
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  getReportPeriodForBankScheduleBySubmissionMonth,
} from '@ukef/dtfs2-common';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { toIsoMonthStamp } from '../../../support/utils/dateHelpers';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import { aliasSelector } from '../../../../../support/alias-selector';

context('PDC_READ users can route to the payments page for a bank', () => {
  const allBanksAlias = 'allBanksAlias';
  const submissionMonth = toIsoMonthStamp(new Date());
  const status = UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;

  beforeEach(() => {
    const visibleBanks = [];
    cy.task(NODE_TASKS.GET_ALL_BANKS).then((getAllBanksResult) => {
      cy.wrap(getAllBanksResult).as(allBanksAlias);

      getAllBanksResult
        .filter((bank) => bank.isVisibleInTfmUtilisationReports)
        .forEach((visibleBank) => {
          visibleBanks.push(visibleBank);
        });
      cy.wrap(visibleBanks).its('length').should('be.gte', 1);
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    cy.wrap(visibleBanks).each((bank) => {
      // TODO FN-1601 update after TFM is working for quarterly banks
      if (bank.id === '10') {
        return;
      }

      const reportPeriod = getReportPeriodForBankScheduleBySubmissionMonth(bank.utilisationReportPeriodSchedule);

      const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(status)
        .withId(bank.id)
        .withBankId(bank.id)
        .withReportPeriod(reportPeriod)
        .build();
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockUtilisationReport]);
    });

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    pages.utilisationReportsPage.visit();
  });

  it('should only render a table row for the banks which should be visible', () => {
    pages.utilisationReportsPage.heading(submissionMonth).should('exist');

    cy.get(aliasSelector(allBanksAlias)).each((bank) => {
      const { id, isVisibleInTfmUtilisationReports } = bank;

      if (isVisibleInTfmUtilisationReports) {
        pages.utilisationReportsPage.tableRowSelector(id, submissionMonth).should('exist');
      } else {
        pages.utilisationReportsPage.tableRowSelector(id, submissionMonth).should('not.exist');
      }
    });
  });

  it('should show the problem with service page if there are no reports in the database', () => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    pages.utilisationReportsPage.visit();

    cy.get('.govuk-heading-xl')
      .should('exist')
      .then(($heading) => {
        expect($heading).to.contain('Sorry, there is a problem with the service');
      });
  });
});
