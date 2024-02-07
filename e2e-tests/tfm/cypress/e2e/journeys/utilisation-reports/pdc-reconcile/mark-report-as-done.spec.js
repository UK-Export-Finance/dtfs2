import pages from '../../../pages';
import USERS from '../../../../fixtures/users';
import { PDC_TEAMS } from '../../../../fixtures/teams';
import { getMonthlyReportPeriodFromIsoSubmissionMonth, toIsoMonthStamp } from '../../../../support/utils/dateHelpers';
import { NODE_TASKS } from '../../../../../../e2e-fixtures';
import {
  MOCK_UTILISATION_REPORT_DETAILS_WITHOUT_ID,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  createNotReceivedReportDetails,
} from '../../../../fixtures/mock-utilisation-report-details';
import { aliasSelector } from '../../../../../../support/alias-selector';

context(`${PDC_TEAMS.PDC_RECONCILE} users can mark reports as done and not done`, () => {
  const submissionMonth = toIsoMonthStamp(new Date());
  const reportPeriod = getMonthlyReportPeriodFromIsoSubmissionMonth(submissionMonth);
  const utilisationReportDetailsAlias = 'utilisationReportDetailsAlias';

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

    const mockUtilisationReportDetailsWithoutId = [];
    cy.wrap(visibleBanks).each((bank, index) => {
      const reportBank = { id: bank.id, name: bank.name };
      const status = statusWithBankId.at(index)?.status;

      if (!status || status === UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED) {
        mockUtilisationReportDetailsWithoutId.push(
          createNotReceivedReportDetails(reportBank, {
            reportPeriod,
          }),
        );
        return;
      }

      mockUtilisationReportDetailsWithoutId.push({
        ...MOCK_UTILISATION_REPORT_DETAILS_WITHOUT_ID,
        bank: reportBank,
        status,
        reportPeriod,
      });
    });

    cy.task(NODE_TASKS.REMOVE_ALL_UTILISATION_REPORT_DETAILS_FROM_DB);

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORT_DETAILS_INTO_DB, mockUtilisationReportDetailsWithoutId).then((insertManyResult) => {
      const { insertedIds } = insertManyResult;

      const utilisationReportDetailsWithId = mockUtilisationReportDetailsWithoutId
        .map((reportDetailsWithoutId, index) => {
          const _id = insertedIds[index];

          if (index < statusWithBankId.length) {
            statusWithBankId[index].bankId = reportDetailsWithoutId.bank.id;
          }

          return { ...reportDetailsWithoutId, _id };
        })
        .slice(0, statusWithBankId.length);

      cy.wrap(utilisationReportDetailsWithId).as(utilisationReportDetailsAlias);
    });

    pages.landingPage.visit();
    cy.login(USERS.PDC_RECONCILE);

    pages.utilisationReportsPage.visit();
  });

  it('should allow the user to mark reports as done and refresh the page with the updated reports', () => {
    cy.get(aliasSelector(utilisationReportDetailsAlias)).each((utilisationReportDetails) => {
      const { _id, bank } = utilisationReportDetails;
      const statusWithSpecificBankId = statusWithBankId.find(({ bankId }) => bankId === bank.id);
      if (!statusWithSpecificBankId) {
        return;
      }
      const { status } = statusWithSpecificBankId;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(_id)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportDetailsAlias)).each((utilisationReportDetails) => {
      const { bank } = utilisationReportDetails;
      if (!statusWithBankId.find(({ bankId }) => bank.id === bankId)) {
        return;
      }

      const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);
      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
        });
    });
  });

  it('should allow the user to mark reports as completed and not completed, resetting the reports to their previous "not completed" status', () => {
    cy.get(aliasSelector(utilisationReportDetailsAlias)).each((utilisationReportDetails) => {
      const { _id, bank } = utilisationReportDetails;
      const statusWithSpecificBankId = statusWithBankId.find(({ bankId }) => bankId === bank.id);
      if (!statusWithSpecificBankId) {
        return;
      }
      const { status } = statusWithSpecificBankId;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(_id)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportDetailsAlias)).each((utilisationReportDetails) => {
      const { _id, bank } = utilisationReportDetails;

      const displayStatus = getDisplayStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);
      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(_id)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsNotCompletedButton(submissionMonth);

    cy.get(aliasSelector(utilisationReportDetailsAlias)).each((utilisationReportDetails) => {
      const { bank } = utilisationReportDetails;
      const statusWithSpecificBankId = statusWithBankId.find(({ bankId }) => bankId === bank.id);
      if (!statusWithSpecificBankId) {
        return;
      }
      const { status } = statusWithSpecificBankId;

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
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
    const previousUtilisationReportDetailsAlias = 'previousUtilisationReportDetails';
    const previousSubmissionMonth = '2023-12';
    const previousReportPeriod = getMonthlyReportPeriodFromIsoSubmissionMonth(previousSubmissionMonth);

    cy.get(aliasSelector(utilisationReportDetailsAlias)).then((utilisationReportDetails) => {
      const { bank } = utilisationReportDetails[0];
      const reportBank = { id: bank.id, name: bank.name };
      const previousUtilisationReportDetailsWithoutId = createNotReceivedReportDetails(reportBank, {
        reportPeriod: previousReportPeriod,
      });

      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORT_DETAILS_INTO_DB, [previousUtilisationReportDetailsWithoutId]).then((insertManyResult) => {
        const _id = insertManyResult.insertedIds[0];

        const previousUtilisationReportDetails = { ...previousUtilisationReportDetailsWithoutId, _id: _id.toString() };
        cy.wrap(previousUtilisationReportDetails).as(previousUtilisationReportDetailsAlias);
      });
    });

    // Refresh the page
    cy.reload();

    cy.get(aliasSelector(previousUtilisationReportDetailsAlias)).then((utilisationReportDetails) => {
      const { _id, bank } = utilisationReportDetails;

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, previousSubmissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(tableCellCheckboxSelector(_id)).click();
        });
    });

    pages.utilisationReportsPage.clickMarkReportAsCompletedButton(previousSubmissionMonth);

    cy.get(aliasSelector(previousUtilisationReportDetailsAlias)).then((utilisationReportDetails) => {
      const { bank } = utilisationReportDetails;

      pages.utilisationReportsPage.tableRowSelector(bank.id, previousSubmissionMonth).should('not.exist');
    });
  });
});
