import relative from '../../../relativeURL';
import caseSubNavigation from '../../../partials/caseSubNavigation';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';
import pages from '../../../pages';
import { USER_TEAMS } from '../../../../fixtures/constants';

const completeTask = (completeTaskParams) => {
  const { userId, groupId, taskId } = completeTaskParams;

  cy.url().should('contain', '/amendment');
  cy.url().should('contain', `task/${taskId}/group/${groupId}`);

  pages.taskPage.assignedToSelectInput().select(userId);
  pages.taskPage.taskStatusRadioInputDone().click();
  pages.taskPage.submitButton().click();
};

context('Amendments tasks - manual amendment tasks', () => {
  let dealId;
  let userId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);

      cy.getUser(PIM_USER_1.username).then((userObj) => {
        userId = userObj._id;
      });
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('should submit an amendment request', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'request-approval');
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'cover-end-date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.tomorrowDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);
    amendmentsPage.continueAmendment().click();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');

    amendmentsPage.continueAmendment().click();
    cy.url().should('contain', 'check-answers');
    amendmentsPage.continueAmendment().click();
  });

  it('should open task links with correct amendment tasks with correct status and titles', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.taskTypeHeading().contains('Amendment for facility');
    pages.tasksPage.taskGroupHeading().contains('Set up amendment');
    pages.tasksPage.taskGroupHeading().contains('Underwrite amendment');
    pages.tasksPage.taskGroupHeading().contains('Amendment approvals');

    pages.tasksPage.tasks.row(1, 1).link().contains('File all emails about this amendment request');
    pages.tasksPage.tasks.row(1, 1).assignedTo().contains('Unassigned');
    pages.tasksPage.tasks.row(1, 1).team().contains(USER_TEAMS.PIM);
    pages.tasksPage.tasks.row(1, 1).dateStarted().contains('-');
    pages.tasksPage.tasks.row(1, 1).dateCompleted().contains('-');
    pages.tasksPage.tasks.row(1, 1).status().contains('To do');

    pages.tasksPage.tasks.row(1, 2).title().contains('Create a credit submission document');
    pages.tasksPage.tasks.row(1, 2).team().contains(USER_TEAMS.UNDERWRITING_SUPPORT);
    pages.tasksPage.tasks.row(1, 2).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(1, 3).title().contains('Assign an underwriter for this amendment request');
    pages.tasksPage.tasks.row(1, 3).team().contains(USER_TEAMS.UNDERWRITER_MANAGERS);
    pages.tasksPage.tasks.row(1, 3).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(2, 1).title().contains('Complete an adverse history check');
    pages.tasksPage.tasks.row(2, 1).team().contains(USER_TEAMS.UNDERWRITERS);
    pages.tasksPage.tasks.row(2, 1).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(3, 1).title().contains('Check exposure');
    pages.tasksPage.tasks.row(3, 1).team().contains(USER_TEAMS.UNDERWRITERS);
    pages.tasksPage.tasks.row(3, 1).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(3, 2).title().contains('Complete the credit submission');
    pages.tasksPage.tasks.row(3, 2).team().contains(USER_TEAMS.UNDERWRITERS);
    pages.tasksPage.tasks.row(3, 2).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(4, 1).title().contains('Check adverse history check');
    pages.tasksPage.tasks.row(4, 1).team().contains(USER_TEAMS.UNDERWRITER_MANAGERS);
    pages.tasksPage.tasks.row(4, 1).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(4, 2).title().contains('Check the credit submission');
    pages.tasksPage.tasks.row(4, 2).team().contains(USER_TEAMS.UNDERWRITER_MANAGERS);
    pages.tasksPage.tasks.row(4, 2).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(4, 3).title().contains('Complete risk analysis (RAD)');
    pages.tasksPage.tasks.row(4, 3).team().contains(USER_TEAMS.RISK_MANAGERS);
    pages.tasksPage.tasks.row(4, 3).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(4, 4).title().contains('Approve or decline the amendment');
    pages.tasksPage.tasks.row(4, 4).team().contains(USER_TEAMS.UNDERWRITER_MANAGERS);
    pages.tasksPage.tasks.row(4, 4).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(4, 5).title().contains('Record the bank\'s decision');
    pages.tasksPage.tasks.row(4, 5).team().contains(USER_TEAMS.PIM);
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');
  });

  it('should change the status of group 1 task 2 after completing the first task', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(1, 1).link().first().click();

    const completeTaskParams = {
      userId,
      groupId: 1,
      taskId: 1,
    };
    completeTask(completeTaskParams);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(1, 1).assignedTo().first().contains(`${PIM_USER_1.firstName} ${PIM_USER_1.lastName}`);
    pages.tasksPage.tasks.row(1, 1).dateStarted().first().contains(dateConstants.todayTaskFormat);
    pages.tasksPage.tasks.row(1, 1).dateCompleted().first().contains(dateConstants.todayTaskFormat);
    pages.tasksPage.tasks.row(1, 1).status().first().contains('Done');

    pages.tasksPage.tasks.row(1, 2).status().contains('To do');
    pages.tasksPage.tasks.row(1, 3).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(2, 1).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(3, 1).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(3, 2).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 1).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 2).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 3).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 4).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');
  });

  it('should change change status of group 2 tasks after completing group 1', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(1, 2).link().first().click();

    const completeTaskParams = {
      userId,
      groupId: 1,
      taskId: 2,
    };
    completeTask(completeTaskParams);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(1, 2).status().first().contains('Done');

    pages.tasksPage.tasks.row(1, 3).status().contains('To do');
    pages.tasksPage.tasks.row(2, 1).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(3, 1).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(3, 2).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 1).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 2).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 3).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 4).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');

    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(1, 3).link().first().click();

    const completeTaskParams1 = {
      userId,
      groupId: 1,
      taskId: 3,
    };
    completeTask(completeTaskParams1);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(1, 3).status().first().contains('Done');

    pages.tasksPage.tasks.row(2, 1).status().contains('To do');
    pages.tasksPage.tasks.row(3, 1).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(3, 2).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 1).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 2).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 3).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 4).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');
  });

  it('should change change status of group 3 tasks after completing group 2', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(2, 1).link().first().click();

    const completeTaskParams = {
      userId,
      groupId: 2,
      taskId: 1,
    };
    completeTask(completeTaskParams);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(2, 1).status().first().contains('Done');

    pages.tasksPage.tasks.row(3, 1).status().contains('To do');
    pages.tasksPage.tasks.row(3, 2).status().contains('To do');
    pages.tasksPage.tasks.row(4, 1).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 2).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 3).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 4).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');
  });

  it('should change change status of group 4 tasks after completing group 3', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(3, 2).link().first().click();

    const completeTaskParams = {
      userId,
      groupId: 3,
      taskId: 2,
    };
    completeTask(completeTaskParams);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(3, 2).status().first().contains('Done');

    pages.tasksPage.tasks.row(3, 1).status().contains('To do');
    pages.tasksPage.tasks.row(4, 1).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 2).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 3).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 4).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(3, 1).link().first().click();

    const completeTaskParams1 = {
      userId,
      groupId: 3,
      taskId: 1,
    };
    completeTask(completeTaskParams1);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(3, 1).status().first().contains('Done');

    pages.tasksPage.tasks.row(4, 1).status().contains('To do');
    pages.tasksPage.tasks.row(4, 2).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 3).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 4).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');
  });

  it('should allow you to add UW decision after completing `approve or decline the amendment` task in order', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(4, 1).link().first().click();

    const completeTaskParams = {
      userId,
      groupId: 4,
      taskId: 1,
    };
    completeTask(completeTaskParams);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(4, 1).status().first().contains('Done');
    pages.tasksPage.tasks.row(4, 2).status().contains('To do');
    pages.tasksPage.tasks.row(4, 3).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 4).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(4, 2).link().first().click();

    const completeTaskParams1 = {
      userId,
      groupId: 4,
      taskId: 2,
    };
    completeTask(completeTaskParams1);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(4, 2).status().contains('Done');
    pages.tasksPage.tasks.row(4, 3).status().contains('To do');
    pages.tasksPage.tasks.row(4, 4).status().contains('Cannot start yet');
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');

    // TODO: add when add decision is dependent on tasks
    // cy.login(UNDERWRITER_MANAGER_1);

    // cy.visit(relative(`/case/${dealId}/underwriting`));

    // pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().should('not.exist');

    // cy.login(PIM_USER_1);
    // cy.visit(relative(`/case/${dealId}/deal`));
    // caseSubNavigation.tasksLink().click();
    // cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    // pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(4, 3).link().first().click();

    const completeTaskParams2 = {
      userId,
      groupId: 4,
      taskId: 3,
    };
    completeTask(completeTaskParams2);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(4, 3).status().contains('Done');
    pages.tasksPage.tasks.row(4, 4).status().contains('To do');
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');

    pages.tasksPage.tasks.row(4, 4).link().first().click();

    cy.url().should('contain', '/amendment');
    cy.url().should('contain', `task/${4}/group/${4}`);

    pages.taskPage.assignedToSelectInput().select(userId);
    pages.taskPage.taskStatusRadioInputInProgress().click();
    pages.taskPage.submitButton().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(4, 4).status().contains('In progress');
    pages.tasksPage.tasks.row(4, 5).status().contains('Cannot start yet');

    // TODO: add when add decision is dependent on tasks
    // cy.login(UNDERWRITER_MANAGER_1);

    // cy.visit(relative(`/case/${dealId}/underwriting`));

    // pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');

    // cy.login(PIM_USER_1);
    // cy.visit(relative(`/case/${dealId}/deal`));
    // caseSubNavigation.tasksLink().click();
    // cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    // pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(4, 4).link().first().click();

    const completeTaskParams3 = {
      userId,
      groupId: 4,
      taskId: 4,
    };
    completeTask(completeTaskParams3);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(4, 4).status().contains('Done');
    pages.tasksPage.tasks.row(4, 5).status().contains('To do');

    pages.tasksPage.tasks.row(4, 5).link().first().click();

    const completeTaskParams4 = {
      userId,
      groupId: 4,
      taskId: 5,
    };
    completeTask(completeTaskParams4);
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));
    pages.tasksPage.filterRadioAllTasks().click();

    pages.tasksPage.tasks.row(4, 5).status().contains('Done');
  });
});
