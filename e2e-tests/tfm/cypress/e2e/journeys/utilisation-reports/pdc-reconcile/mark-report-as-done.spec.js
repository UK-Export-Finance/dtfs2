import { UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { PDC_TEAMS } from '../../../../fixtures/teams';
import { getMonthlyReportPeriodFromIsoSubmissionMonth, toIsoMonthStamp } from '../../../../support/utils/dateHelpers';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import { aliasSelector } from '../../../../../../support/alias-selector';

context(`${PDC_TEAMS.PDC_RECONCILE} users can mark reports as done and not done`, () => {
  const submissionMonth = toIsoMonthStamp(new Date());
  const reportPeriod = getMonthlyReportPeriodFromIsoSubmissionMonth(submissionMonth);
  const utilisationReportsAlias = 'utilisationReportsAlias';

  const displayStatusSelector = 'td > strong[data-cy="utilisation-report-reconciliation-status"]';
  const tableCellCheckboxSelector = (reportId) => `th > div > div > input[data-cy="table-cell-checkbox--set-status--reportId-${reportId}"]`;

  const statusWithBankId = [
    {
      bankId: undefined,
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
    },
    {
      bankId: undefined,
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
    },
    {
      bankId: undefined,
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
    },
  ];

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
    const visibleBanks = [];
    cy.task(NODE_TASKS.GET_ALL_BANKS).then((getAllBanksResult) => {
      getAllBanksResult
        .filter((bank) => bank.isVisibleInTfmUtilisationReports)
        .forEach((bank) => {
          visibleBanks.push(bank);
        });
      cy.wrap(visibleBanks).its('length').should('be.gte', 3);
    });

    const mockUtilisationReports = [];
    cy.wrap(visibleBanks).each((bank, index) => {
      const bankId = bank.id;
      const reportId = bankId;
      const status = statusWithBankId.at(index)?.status;

      if (!status || status === UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED) {
        const mockNotReceivedReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
          .withId(reportId)
          .withBankId(bankId)
          .withReportPeriod(reportPeriod)
          .build();
        mockUtilisationReports.push(mockNotReceivedReport);
        return;
      }

      const mockUtilisationReport = UtilisationReportEntityMockBuilder.forStatus(status)
        .withId(reportId)
        .withBankId(bankId)
        .withReportPeriod(reportPeriod)
        .build();
      mockUtilisationReports.push(mockUtilisationReport);
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORTS_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, mockUtilisationReports);
    cy.wrap(mockUtilisationReports).as(utilisationReportsAlias);

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    pages.utilisationReportsPage.visit();
  });

  it('should allow the user to mark reports as done and refresh the page with the updated reports', () => {
    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { id, bankId } = utilisationReport;
      const statusWithSpecificBankId = statusWithBankId.find(({ bankId: bankIdToMatch }) => bankId === bankIdToMatch);
      if (!statusWithSpecificBankId) {
        return;
      }
      const { status } = statusWithSpecificBankId;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { bankId } = utilisationReport;
      if (!statusWithBankId.find(({ bankId: bankIdToMatch }) => bankId === bankIdToMatch)) {
        return;
      }

      const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);
      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
        });
    });
  });

  it('should allow the user to mark reports as completed and not completed, resetting the reports to their previous "not completed" status', () => {
    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { id, bankId } = utilisationReport;
      const statusWithSpecificBankId = statusWithBankId.find(({ bankId: bankIdToMatch }) => bankId === bankIdToMatch);
      if (!statusWithSpecificBankId) {
        return;
      }
      const { status } = statusWithSpecificBankId;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { bankId, id } = utilisationReport;
      if (!statusWithBankId.find(({ bankId: bankIdToMatch }) => bankId === bankIdToMatch)) {
        return;
      }

      const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);
      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsNotCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportsAlias)).each((utilisationReport) => {
      const { bankId } = utilisationReport;
      const statusWithSpecificBankId = statusWithBankId.find(({ bankId: bankIdToMatch }) => bankIdToMatch === bankId);
      if (!statusWithSpecificBankId) {
        return;
      }
      const { status } = statusWithSpecificBankId;

      pages.utilisationReportsPage
        .tableRowSelector(bankId, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          if (status !== UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED) {
            const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION);
            cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
            return;
          }

          const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED);
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

      const previousUtilisationReport = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED')
        .withId(999) // this report id should always be unique
        .withBankId(bankId)
        .withReportPeriod(previousReportPeriod)
        .build();

      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORTS_INTO_DB, [previousUtilisationReport]);
      cy.wrap(previousUtilisationReport).as(previousUtilisationReportAlias);
    });

    // Refresh the page
    cy.reload();

    cy.get(aliasSelector(previousUtilisationReportAlias)).then((utilisationReport) => {
      const { id, bankId } = utilisationReport;

      pages.utilisationReportsPage
        .tableRowSelector(bankId, previousSubmissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(tableCellCheckboxSelector(id)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsCompletedButton(previousSubmissionMonth);

    cy.get(aliasSelector(previousUtilisationReportAlias)).then((utilisationReport) => {
      const { bankId } = utilisationReport;

      pages.utilisationReportsPage.tableRowSelector(bankId, previousSubmissionMonth).should('not.exist');
    });
  });
});
