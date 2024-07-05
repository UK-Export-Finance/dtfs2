import {
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  getPreviousReportPeriodForBankScheduleByMonth,
  toIsoMonthStamp,
} from '@ukef/dtfs2-common';
import { subMonths } from 'date-fns';
import pages from '../../pages';
import USERS from '../../../fixtures/users';
import { NODE_TASKS } from '../../../../../e2e-fixtures';
import { aliasSelector } from '../../../../../support/alias-selector';

context('PDC_RECONCILE users can route to the payments page for a bank', () => {
  const allBanksAlias = 'allBanksAlias';
  const submissionMonth = toIsoMonthStamp(new Date());
  const latestQuarterlySubmissionMonth = getLatestQuarterlySubmissionMonth();
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
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    cy.wrap(visibleBanks).each((bank) => {
      const reportPeriod = getPreviousReportPeriodForBankScheduleByMonth(bank.utilisationReportPeriodSchedule, submissionMonth);

      const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(status)
        .withId(bank.id)
        .withBankId(bank.id)
        .withReportPeriod(reportPeriod)
        .build();
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockUtilisationReport]);
    });

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    pages.utilisationReportsSummaryPage.visit();
  });

  it('should only render a table row for the banks which should be visible', () => {
    pages.utilisationReportsSummaryPage.heading(submissionMonth).should('exist');

    cy.get(aliasSelector(allBanksAlias)).each((bank) => {
      const { id, isVisibleInTfmUtilisationReports } = bank;

      if (isVisibleInTfmUtilisationReports) {
        if (bank.id === '10') {
          pages.utilisationReportsSummaryPage.tableRowSelector(id, latestQuarterlySubmissionMonth).should('exist');
          return;
        }
        pages.utilisationReportsSummaryPage.tableRowSelector(id, submissionMonth).should('exist');
      } else {
        pages.utilisationReportsSummaryPage.tableRowSelector(id, submissionMonth).should('not.exist');
      }
    });
  });

  it('should show the problem with service page if there are no reports in the database', () => {
    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    pages.utilisationReportsSummaryPage.visit();

    cy.get('.govuk-heading-xl')
      .should('exist')
      .then(($heading) => {
        expect($heading).to.contain('Sorry, there is a problem with the service');
      });
  });

  function getLatestQuarterlySubmissionMonth() {
    const now = new Date();
    const currentMonthOneIndexed = now.getMonth() + 1;
    // Quarterly mock banks have report periods ending in months 2, 5, 8, 11
    // The corresponding submission periods are 3, 6, 9, 12
    switch (currentMonthOneIndexed) {
      case 3:
      case 6:
      case 9:
      case 12:
        return toIsoMonthStamp(now);
      case 1:
      case 4:
      case 7:
      case 10:
        return toIsoMonthStamp(subMonths(now, 1));
      case 2:
      case 5:
      case 8:
      case 11:
        return toIsoMonthStamp(subMonths(now, 2));
      default:
        return toIsoMonthStamp(now);
    }
  }
});
