import {
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntityMockBuilder,
  getReportPeriodForBankScheduleBySubmissionMonth,
} from '@ukef/dtfs2-common';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { PDC_TEAMS } from '../../../../fixtures/teams';
import { getMonthlyReportPeriodFromIsoSubmissionMonth, toIsoMonthStamp } from '../../../../support/utils/dateHelpers';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import { aliasSelector } from '../../../../../../support/alias-selector';
import { BANK1_PAYMENT_REPORT_OFFICER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';

context(`${PDC_TEAMS.PDC_RECONCILE} users can mark reports as done and not done`, () => {
  let uploadedByUserId;

  const submissionMonth = toIsoMonthStamp(new Date());
  const utilisationReportsAlias = 'utilisationReportsAlias';

  const displayStatusSelector = 'td > strong[data-cy="utilisation-report-reconciliation-status"]';
  const tableCellCheckboxSelector = (reportId, status) => `input[data-cy="table-cell-checkbox--set-status--reportId-${reportId}-currentStatus-${status}"]`;

  const getDisplayStatus = (utilisationReportReconciliationStatus) => {
    switch (utilisationReportReconciliationStatus) {
      case UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED:
        return 'Not received';
      case UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION:
        return 'Pending reconciliation';
      case UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS:
        return 'Reconciliation in progress';
      case UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED:
        return 'Report completed';
      default:
        throw new Error('Unrecognised utilisation report reconciliation status');
    }
  };

  beforeEach(() => {
    cy.getUserByUsername(BANK1_PAYMENT_REPORT_OFFICER1.username).then((user) => {
      uploadedByUserId = user._id.toString();
    });

    const visibleBanks = [];
    cy.task(NODE_TASKS.GET_ALL_BANKS).then((getAllBanksResult) => {
      getAllBanksResult
        .filter((bank) => bank.isVisibleInTfmUtilisationReports)
        .forEach((bank) => {
          visibleBanks.push(bank);
        });
      cy.wrap(visibleBanks).its('length').should('be.gte', 3);
    });

    /**
     * @type {import('@ukef/dtfs2-common').UtilisationReportEntity[]}
     */
    const utilisationReports = [];
    cy.wrap(visibleBanks).each((bank) => {
      const bankId = bank.id;

      const reportId = bankId;

      const reportPeriod = getReportPeriodForBankScheduleBySubmissionMonth(bank.utilisationReportPeriodSchedule, submissionMonth);

      const pendingReconciliationReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION')
        .withId(reportId)
        .withBankId(bankId)
        .withReportPeriod(reportPeriod)
        .withUploadedByUserId(uploadedByUserId)
        .withDateUploaded(new Date(submissionMonth))
        .build();
      utilisationReports.push(pendingReconciliationReport);
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, utilisationReports);
    cy.wrap(utilisationReports).as(utilisationReportsAlias);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    pages.utilisationReportsPage.visit();
  });

  it(`should only allow users to manually mark a report as completed/not completed if the report is not in the '${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED}' state`, () => {
    /**
     * @type {import('@ukef/dtfs2-common').UtilisationReportEntity[]}
     */
    const notReceivedUtilisationReports = [];
    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { bankId, id, reportPeriod, status } = utilisationReport;

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id, status)).should('exist');
        });

      const notReceivedUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
        .withId(id)
        .withBankId(bankId)
        .withReportPeriod(reportPeriod)
        .build();
      notReceivedUtilisationReports.push(notReceivedUtilisationReport);
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, notReceivedUtilisationReports).each((notReceivedReport) => {
      const { bankId, id, status } = notReceivedReport;

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id, status)).should('not.exist');
        });
    });
  });

  it('should allow the user to mark reports as completed and refresh the page with the updated reports', () => {
    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { id, bankId, status } = utilisationReport;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id, status)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { bankId } = utilisationReport;
      const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
        });
    });
  });

  it('should allow the user to mark reports as completed and not completed and refresh the page with the updated reports', () => {
    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { id, bankId, status } = utilisationReport;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id, status)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { bankId, id } = utilisationReport;

      const completedStatus = UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED;
      const displayStatus = getDisplayStatus(completedStatus);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id, completedStatus)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsNotCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { bankId } = utilisationReport;
      const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
        });
    });
  });

  it('should not make any changes and reload the page when trying to mark not completed reports as not completed', () => {
    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { id, bankId, status } = utilisationReport;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id, status)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsNotCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { bankId } = utilisationReport;
      const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
        });
    });
  });

  it('should not make any changes and reload the page when trying to mark completed reports as completed', () => {
    /**
     * @type {import('@ukef/dtfs2-common').UtilisationReportEntity[]}
     */
    const reconciliationCompletedReports = [];
    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { id, bankId, reportPeriod, dateUploaded } = utilisationReport;

      const reconciliationCompletedReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED)
        .withId(id)
        .withBankId(bankId)
        .withReportPeriod(reportPeriod)
        .withUploadedByUserId(uploadedByUserId)
        .withDateUploaded(dateUploaded)
        .build();
      reconciliationCompletedReports.push(reconciliationCompletedReport);
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);
    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, reconciliationCompletedReports);

    cy.reload();

    cy.wrap(reconciliationCompletedReports).each((reconciliationCompletedReport) => {
      const { bankId, id, status } = reconciliationCompletedReport;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id, status)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { bankId } = utilisationReport;
      const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
        });
    });
  });

  it('should no longer display previous reports which are marked as completed', () => {
    const previousUtilisationReportAlias = 'previousUtilisationReport';
    const previousSubmissionMonth = '2023-12';
    const previousReportPeriod = getMonthlyReportPeriodFromIsoSubmissionMonth(previousSubmissionMonth);

    cy.get(aliasSelector(utilisationReportsAlias)).then((utilisationReports) => {
      const { bankId } = utilisationReports[0];

      const previousUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION)
        .withId(999) // this report id should always be unique
        .withBankId(bankId)
        .withReportPeriod(previousReportPeriod)
        .withUploadedByUserId(uploadedByUserId)
        .build();

      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [previousUtilisationReport]);
      cy.wrap(previousUtilisationReport).as(previousUtilisationReportAlias);
    });

    cy.reload();

    cy.get(aliasSelector(previousUtilisationReportAlias)).then((utilisationReport) => {
      const { id, bankId, status } = utilisationReport;

      pages.utilisationReportsPage
        .tableRowSelector(bankId, previousSubmissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id, status)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsCompletedButton(previousSubmissionMonth);

    cy.get(aliasSelector(previousUtilisationReportAlias)).then((utilisationReport) => {
      const { bankId } = utilisationReport;

      pages.utilisationReportsPage.tableRowSelector(bankId, previousSubmissionMonth).should('not.exist');
    });
  });
});
