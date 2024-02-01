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

  const displayStatusSelector = 'td > strong[data-cy="utilisation-report-reconciliation-status"]';
  const tableCellCheckboxSelector = (reportId) => `th > div > div > input[data-cy="set-status--reportId-${reportId}"]`;

  const statusWithBankIdAndCheckboxSelector = [
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

    cy.task(NODE_TASKS.INSERT_UTILISATION_REPORT_DETAILS_INTO_DB, mockUtilisationReportDetailsWithoutId).then((insertManyResult) => {
      const { insertedIds } = insertManyResult;

      const utilisationReportDetailsWithId = mockUtilisationReportDetailsWithoutId.map((reportDetailsWithoutId, index) => {
        const _id = insertedIds[index];

        if (index < statusWithBankIdAndCheckboxSelector.length) {
          statusWithBankIdAndCheckboxSelector[index].bankId = reportDetailsWithoutId.bank.id;
        }

        return { ...reportDetailsWithoutId, _id };
      });

      cy.wrap(utilisationReportDetailsWithId).as(utilisationReportDetailsAlias);
    });

    pages.landingPage.visit();
    cy.login(pdcReconcileUser);

    pages.utilisationReportsPage.visit();
  });

  it('should allow the user to mark reports as done and refresh the page with the updated reports', () => {
    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReportDetails) => {
      const { _id, bank } = utilisationReportDetails;
      const statusWithSpecificBankIdAndCheckboxSelector = statusWithBankIdAndCheckboxSelector.find(({ bankId }) => bankId === bank.id);
      if (!statusWithSpecificBankIdAndCheckboxSelector) {
        return;
      }
      const { status } = statusWithSpecificBankIdAndCheckboxSelector;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(_id)).click();
        });
    });

    pages.utilisationReportsPage.markReportAsCompletedButton(submissionMonth).click();

    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReportDetails) => {
      const { bank } = utilisationReportDetails;
      if (!statusWithBankIdAndCheckboxSelector.find(({ bankId }) => bank.id === bankId)) {
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
    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReportDetails) => {
      const { _id, bank } = utilisationReportDetails;
      const statusWithSpecificBankIdAndCheckboxSelector = statusWithBankIdAndCheckboxSelector.find(({ bankId }) => bankId === bank.id);
      if (!statusWithSpecificBankIdAndCheckboxSelector) {
        return;
      }
      const { status } = statusWithSpecificBankIdAndCheckboxSelector;
      const displayStatus = getDisplayStatus(status);

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(displayStatusSelector).should('exist').contains(displayStatus);
          cy.wrap($tableRow).get(tableCellCheckboxSelector(_id)).click();
        });
    });

    pages.utilisationReportsPage.markReportAsCompletedButton(submissionMonth).click();

    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReportDetails) => {
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

    pages.utilisationReportsPage.markReportAsNotCompletedButton(submissionMonth).click();

    cy.get(`@${utilisationReportDetailsAlias}`).each((utilisationReportDetails) => {
      const { bank } = utilisationReportDetails;
      const statusWithSpecificBankIdAndCheckboxSelector = statusWithBankIdAndCheckboxSelector.find(({ bankId }) => bankId === bank.id);
      if (!statusWithSpecificBankIdAndCheckboxSelector) {
        return;
      }
      const { status } = statusWithSpecificBankIdAndCheckboxSelector;

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, submissionMonth)
        .should('exist')
        .within(($tableRow) => {
          if (status !== UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED) {
            const displayStatus = getDisplayStatus(status);
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

    cy.get(`@${utilisationReportDetailsAlias}`).first((utilisationReportDetails) => {
      const { bank } = utilisationReportDetails;
      const previousUtilisationReportDetailsWithoutId = createMockUtilisationReportDetails({
        bank: { id: bank.id, name: bank.name },
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
        submissionMonth: previousSubmissionMonth,
      });

      cy.task(NODE_TASKS.INSERT_UTILISATION_REPORT_DETAILS_INTO_DB, [previousUtilisationReportDetailsWithoutId]).then((insertManyResult) => {
        const _id = insertManyResult.insertedIds.at(0);

        cy.wrap(_id).should('be.defined');

        const previousUtilisationReportDetails = { ...previousUtilisationReportDetailsWithoutId, _id: _id.toString() };
        cy.wrap(previousUtilisationReportDetails).as(previousUtilisationReportDetailsAlias);
      });
    });

    cy.get(`@${previousUtilisationReportDetailsAlias}`).then((utilisationReportDetails) => {
      const { _id, bank } = utilisationReportDetails;

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, previousSubmissionMonth)
        .should('exist')
        .within(($tableRow) => {
          cy.wrap($tableRow).get(tableCellCheckboxSelector(_id)).click();
        });
    });

    pages.utilisationReportsPage.markReportAsCompletedButton(previousSubmissionMonth).click();

    cy.get(`@${previousUtilisationReportDetailsAlias}`).then((utilisationReportDetails) => {
      const { bank } = utilisationReportDetails;

      pages.utilisationReportsPage
        .tableRowSelector(bank.id, previousSubmissionMonth)
        .should('not.exist');
    });
  });
});
