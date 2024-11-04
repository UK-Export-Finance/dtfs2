import {
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  getOneIndexedMonth,
  getPreviousReportPeriodForBankScheduleByMonth,
  toIsoMonthStamp,
} from '@ukef/dtfs2-common';
import { subMonths } from 'date-fns';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import { aliasSelector } from '../../../../../../support/alias-selector';

context('Users can route to the payments page for a bank', () => {
  const allBanksAlias = 'allBanksAlias';
  const today = new Date();
  const submissionMonthStamp = toIsoMonthStamp(today);
  const previousSubmissionMonthStamp = toIsoMonthStamp(subMonths(today, 1));
  const latestQuarterlySubmissionMonthStamp = getLatestQuarterlySubmissionMonthStamp();
  const QUARTERLY_REPORTING_BANK_ID = '10';
  const MONTHLY_REPORTING_BANK_ID = '956';

  before(() => {
    cy.task(NODE_TASKS.REINSERT_ZERO_THRESHOLD_PAYMENT_MATCHING_TOLERANCES);
  });

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

    // Insert a report for each visible bank for their latest reporting period
    cy.wrap(visibleBanks).each((bank) => {
      const reportPeriod = getPreviousReportPeriodForBankScheduleByMonth(bank.utilisationReportPeriodSchedule, submissionMonthStamp);

      if (bank.id === MONTHLY_REPORTING_BANK_ID) {
        const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED)
          .withId(bank.id)
          .withBankId(bank.id)
          .withReportPeriod(reportPeriod)
          .build();
        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockUtilisationReport]);
      } else {
        const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
          .withId(bank.id)
          .withBankId(bank.id)
          .withReportPeriod(reportPeriod)
          .build();
        cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockUtilisationReport]);
      }
    });

    // Insert a report for the previous month for a specific monthly reporting bank
    const previousMonthlyReportPeriod = getMonthlyReportPeriodForPreviousSubmissionMonth();
    const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED)
      .withId(99999999)
      .withBankId(MONTHLY_REPORTING_BANK_ID)
      .withReportPeriod(previousMonthlyReportPeriod)
      .build();
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [mockUtilisationReport]);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    pages.utilisationReportsSummaryPage.visit();
  });

  it('should NOT render a read only banner when logging in as a "PDC_RECONCILE" user', () => {
    pages.utilisationReportsSummaryPage.readOnlyBanner().should('not.exist');
  });

  it('should render all current reports and open previous reports for banks visible in tfm utilisation reports', () => {
    pages.utilisationReportsSummaryPage.heading(submissionMonthStamp).should('exist');
    pages.utilisationReportsSummaryPage.heading(previousSubmissionMonthStamp).should('exist');

    cy.get(aliasSelector(allBanksAlias)).each((bank) => {
      const { id, isVisibleInTfmUtilisationReports } = bank;

      if (isVisibleInTfmUtilisationReports) {
        if (id === QUARTERLY_REPORTING_BANK_ID) {
          pages.utilisationReportsSummaryPage.tableRowSelector(id, latestQuarterlySubmissionMonthStamp).should('exist');
          return;
        }
        if (id === MONTHLY_REPORTING_BANK_ID) {
          pages.utilisationReportsSummaryPage.tableRowSelector(id, previousSubmissionMonthStamp).should('exist');
        }
        pages.utilisationReportsSummaryPage.tableRowSelector(id, submissionMonthStamp).should('exist');
      } else {
        pages.utilisationReportsSummaryPage.tableRowSelector(id, submissionMonthStamp).should('not.exist');
      }
    });

    pages.utilisationReportsSummaryPage.tableRowSelector(MONTHLY_REPORTING_BANK_ID, submissionMonthStamp).should('contain', 'Monthly');
    pages.utilisationReportsSummaryPage.tableRowSelector(QUARTERLY_REPORTING_BANK_ID, latestQuarterlySubmissionMonthStamp).should('contain', 'Quarterly');
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

  it('should render a read only banner when signing in as a "PDC_READ" user', () => {
    pages.landingPage.visit();
    cy.login(USERS.PDC_READ);

    pages.utilisationReportsSummaryPage.visit();
    pages.utilisationReportsSummaryPage.readOnlyBanner().should('exist');
    cy.assertText(
      pages.utilisationReportsSummaryPage.readOnlyBanner(),
      'You are viewing the trade finance manager in read-only view. You will not be able to perform any actions to the reported fees on the system.',
    );
  });

  function getLatestQuarterlySubmissionMonthStamp() {
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

  function getMonthlyReportPeriodForPreviousSubmissionMonth() {
    const dateInCurrentMonth = new Date();
    const dateTwoMonthsAgo = subMonths(dateInCurrentMonth, 2);
    return {
      start: { month: getOneIndexedMonth(dateTwoMonthsAgo), year: dateTwoMonthsAgo.getFullYear() },
      end: { month: getOneIndexedMonth(dateTwoMonthsAgo), year: dateTwoMonthsAgo.getFullYear() },
    };
  }
});
