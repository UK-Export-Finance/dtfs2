import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';
import {
  submitTaskInProgress,
  submitTaskComplete,
} from './tasks-helpers';

context('Case tasks - MIA deal', () => {
  let dealId;
  const dealFacilities = [];
  const businessSupportUser = MOCK_USERS.find((u) => u.teams.includes('BUSINESS_SUPPORT'));
  const userFullName = `${businessSupportUser.firstName} ${businessSupportUser.lastName}`;
  let userId;
  let loggedInUserTeamName;
  let usersInTeam;

  before(() => {
    cy.getUser(businessSupportUser.username).then((userObj) => {
      userId = userObj._id;
    });

    [loggedInUserTeamName] = businessSupportUser.teams;
    usersInTeam = MOCK_USERS.filter((u) => u.teams.includes(loggedInUserTeamName));
  });

  beforeEach(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);

      cy.login(businessSupportUser);
      cy.visit(relative(`/case/${dealId}/deal`));
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  it('should render all MIA task groups and tasks', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioAllTasks().click();

    const TOTAL_MIA_TASK_GROUPS = 4;
    pages.tasksPage.taskGroupTable().should('have.length', TOTAL_MIA_TASK_GROUPS);

    const TOTAL_MIA_TASKS = 13;
    pages.tasksPage.tasksTableRows().should('have.length', TOTAL_MIA_TASKS);
  });

  it('user can assign a task to themself, change status and then unassign', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    //---------------------------------------------------------------
    // user assigns task to themself
    //---------------------------------------------------------------
    pages.tasksPage.filterRadioYourTeam().click();
    const firstTask = pages.tasksPage.tasks.row(1, 1);
    firstTask.link().click();

    cy.url().should('eq', relative(`/case/${dealId}/tasks/1/1`));

    // `assign to` should have total amount of users in the team and unassigned users
    const TOTAL_USERS_IN_TEAM = usersInTeam.length;
    const expected = TOTAL_USERS_IN_TEAM + 1;

    pages.taskPage.assignedToSelectInputOption().should('have.length', expected);

    // task should be unassigned by default
    pages.taskPage.assignedToSelectInput().invoke('val').should('eq', 'Unassigned');

    // select the `assign to me` option
    pages.taskPage.assignedToSelectInput().select(userId);

    // `assign to me` option should have the correct text
    const assignToMeSelectOptionText = `${userFullName} (Assign to me)`;
    pages.taskPage.assignedToSelectInputSelectedOption().should('have.text', assignToMeSelectOptionText);

    // task status should have 3 options, `to do` selected by default
    pages.taskPage.taskStatusRadioInput().should('have.length', 3);
    pages.taskPage.taskStatusRadioInputTodo().should('be.checked');

    // change task status
    pages.taskPage.taskStatusRadioInputInProgress().click();

    // submit form
    pages.taskPage.submitButton().click();

    // should now be back on the tasks page
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    // go back into the same task
    firstTask.link().click();

    // `assigned to` should be updated, only displaying the full name
    pages.taskPage.assignedToSelectInput().invoke('val').should('eq', userId);
    pages.taskPage.assignedToSelectInputSelectedOption().should('have.text', userFullName);

    // `in progess` status should be selected
    pages.taskPage.taskStatusRadioInputInProgress().should('be.checked');

    //---------------------------------------------------------------
    // user can unassign the task
    //---------------------------------------------------------------
    pages.taskPage.assignedToSelectInput().select('Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().click();
    pages.taskPage.submitButton().click();

    // should now be back on the tasks page
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    // go back into the same task, check values
    pages.tasksPage.filterRadioYourTeam().click();
    firstTask.link().click();
    pages.taskPage.assignedToSelectInput().find('option:selected').should('have.text', 'Unassigned');
    pages.taskPage.taskStatusRadioInputTodo().should('be.checked');
  });

  it('starting the first task in the first group updates the deal stage from `Application` to `In progress`', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioAllTasks().click();

    // check initial deal stage
    partials.caseSummary.ukefDealStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Application');
    });

    submitTaskInProgress(1, 1, userId);

    partials.caseSummary.ukefDealStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('In progress');
    });
  });

  it('immediately completing the first task in the first group updates the deal stage from `Application` to `In progress`', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioAllTasks().click();

    // check initial deal stage
    partials.caseSummary.ukefDealStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Application');
    });

    submitTaskComplete(1, 1, userId);

    partials.caseSummary.ukefDealStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('In progress');
    });
  });
});
