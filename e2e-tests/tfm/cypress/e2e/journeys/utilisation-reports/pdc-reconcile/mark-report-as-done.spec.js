import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { PDC_TEAMS } from '../../../../fixtures/teams';
import { getCurrentISOSubmissionMonth } from '../../../../support/utils/dateFuncs';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, createMockUtilisationReportDetails } from '../../../../fixtures/create-mock-utilisation-report-details';

context(`${PDC_TEAMS.PDC_RECONCILE} users can mark reports as done and not done`, () => {
  const pdcReconcileUser = USERS.PDC_RECONCILE;
  const submissionMonth = getCurrentISOSubmissionMonth();
  const utilisationReportDetailsAlias = 'utilisationReportDetailsAlias';

  const statusWithBankIdAndCheckboxSelector = [
    {
      bankId: undefined,
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      checkboxSelector: undefined,
    },
    {
      bankId: undefined,
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
      checkboxSelector: undefined,
    },
    {
      bankId: undefined,
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
      checkboxSelector: undefined,
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
        throw new Error();
    }
  };

  // Aliases do not persist the first test, so need everything to be inside a beforeEach
  beforeEach(() => {
    const visibleBanks = [];
    cy.getAllBanks().then((getAllBanksResult) => {
      getAllBanksResult
        .filter((bank) => bank.isVisibleInTfmUtilisationReports)
        .forEach((bank) => {
          visibleBanks.push(bank);
        });
      cy.wrap(visibleBanks).its('length').should('be.gte', 3);
    });

    const mockUtilisationReportDetailsWithoutId = [];
    cy.wrap(visibleBanks).each((bank, index) => {
      const status = statusWithBankIdAndCheckboxSelector.at(index)?.status ?? UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED;

      const mockDetailsWithoutId = createMockUtilisationReportDetails({
        bank: { id: bank.id, name: bank.name },
        status,
        submissionMonth,
      });
      mockUtilisationReportDetailsWithoutId.push(mockDetailsWithoutId);
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORT_DETAILS_FROM_DB);

    cy.wrap(mockUtilisationReportDetailsWithoutId).then(() => {
      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORT_DETAILS_INTO_DB, mockUtilisationReportDetailsWithoutId).then((insertManyResult) => {
        const { insertedIds } = insertManyResult;
        const utilisationReportDetailsWithId = mockUtilisationReportDetailsWithoutId.map((reportDetailsWithoutId, index) => {
          const _id = insertedIds[index];

          if (index < statusWithBankIdAndCheckboxSelector.length) {
            statusWithBankIdAndCheckboxSelector[index].bankId = reportDetailsWithoutId.bank.id;

            // TODO FN-1949(?) remove this check once I update the endpoint
            if (reportDetailsWithoutId.status === UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED) {
              statusWithBankIdAndCheckboxSelector[index].checkboxSelector = `table-cell-checkbox--set-status--bankId-${reportDetailsWithoutId.bank.id}`;
            } else {
              statusWithBankIdAndCheckboxSelector[index].checkboxSelector = `table-cell-checkbox--set-status--reportId-${_id}`;
            }
          }

          return { ...reportDetailsWithoutId, _id };
        });
        cy.wrap(utilisationReportDetailsWithId).as(utilisationReportDetailsAlias);
      });
    });

    pages.landingPage.visit();
    cy.login(pdcReconcileUser);

    pages.utilisationReportsPage.visit();
  });

  it('should allow the user to mark reports as done and refresh the page with the updated reports', () => {
    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReport) => {
      const { bank } = utilisationReport;
      const statusWithSpecificBankIdAndCheckboxSelector = statusWithBankIdAndCheckboxSelector.find(({ bankId }) => bankId === bank.id);
      if (!statusWithSpecificBankIdAndCheckboxSelector) {
        return;
      }
      const { status, checkboxSelector } = statusWithSpecificBankIdAndCheckboxSelector;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get('td > strong[data-cy="utilisation-report-reconciliation-status"]').should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(`th > div > div > input[data-cy="${checkboxSelector}"]`).click();
        });
    });

    pages.utilisationReportsPage.markReportAsCompletedButton(submissionMonth).click();

    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReport) => {
      const { bank } = utilisationReport;
      if (!statusWithBankIdAndCheckboxSelector.find(({ bankId }) => bank.id === bankId)) {
        return;
      }

      const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);
      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get('td > strong[data-cy="utilisation-report-reconciliation-status"]').should('exist').contains(displayStatus);
        });
    });
  });

  // In order to do this test, you first need to
  it('should allow the user to mark the report as not done and refresh the page with the updated reports', () => {
    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReport) => {
      const { bank } = utilisationReport;
      const statusWithSpecificBankIdAndCheckboxSelector = statusWithBankIdAndCheckboxSelector.find(({ bankId }) => bankId === bank.id);
      if (!statusWithSpecificBankIdAndCheckboxSelector) {
        return;
      }
      const { status, checkboxSelector } = statusWithSpecificBankIdAndCheckboxSelector;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get('td > strong[data-cy="utilisation-report-reconciliation-status"]').should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(`th > div > div > input[data-cy="${checkboxSelector}"]`).click();
        });
    });

    pages.utilisationReportsPage.markReportAsCompletedButton(submissionMonth).click();

    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReport) => {
      const { bank } = utilisationReport;
      const statusWithSpecificBankIdAndCheckboxSelector = statusWithBankIdAndCheckboxSelector.find(({ bankId }) => bankId === bank.id);
      if (!statusWithSpecificBankIdAndCheckboxSelector) {
        return;
      }
      const { checkboxSelector } = statusWithSpecificBankIdAndCheckboxSelector;

      const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);
      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get('td > strong[data-cy="utilisation-report-reconciliation-status"]').should('exist').contains(displayStatus);
          // TODO FN-1949 selector should be consistent once all reports are uploaded by job
          cy.wrap($tableRow).get(`th > div > div > input`).click();
        });
    });

    pages.utilisationReportsPage.markReportAsNotCompletedButton(submissionMonth).click();

    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReport) => {
      const { bank } = utilisationReport;
      const statusWithSpecificBankIdAndCheckboxSelector = statusWithBankIdAndCheckboxSelector.find(({ bankId }) => bankId === bank.id);
      if (!statusWithSpecificBankIdAndCheckboxSelector) {
        return;
      }
      const { status, checkboxSelector } = statusWithSpecificBankIdAndCheckboxSelector;

      // TODO FN-1949 reports now all exist in database
      let displayStatus;
      if (status === UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION) {
        displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION);
      } else {
        displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED);
      }

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get('td > strong[data-cy="utilisation-report-reconciliation-status"]').should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(`th > div > div > input[data-cy="${checkboxSelector}"]`).click();
        });
    });
  });
});
