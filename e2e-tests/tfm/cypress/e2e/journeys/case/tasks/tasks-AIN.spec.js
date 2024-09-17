import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import * as MOCK_USERS from '../../../../../../e2e-fixtures';
import { BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

const { T1_USER_1 } = MOCK_USERS;

context('Case tasks - AIN deal', () => {
  let dealId;
  const dealFacilities = [];
  const userFullName = `${MOCK_USERS.BUSINESS_SUPPORT_USER_1.firstName} ${MOCK_USERS.BUSINESS_SUPPORT_USER_1.lastName}`;
  let userId;
  let usersInTeam;

  before(() => {
    cy.getUser(MOCK_USERS.BUSINESS_SUPPORT_USER_1.username).then((userObj) => {
      userId = userObj._id;
    });

    usersInTeam = [MOCK_USERS.BUSINESS_SUPPORT_USER_1, MOCK_USERS.BUSINESS_SUPPORT_USER_2];
  });

  beforeEach(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, T1_USER_1);

      cy.login(MOCK_USERS.BUSINESS_SUPPORT_USER_1);
      cy.visit(relative(`/case/${dealId}/deal`));
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should render all AIN tasks', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioAllTasks().click();

    const TOTAL_AIN_TASK_GROUPS = 1;
    pages.tasksPage.taskGroupTable().should('have.length', TOTAL_AIN_TASK_GROUPS);

    const TOTAL_AIN_TASKS = 2;
    pages.tasksPage.tasksTableRows().should('have.length', TOTAL_AIN_TASKS);
  });

  it('should not let wrong user edit a task', () => {
    cy.login(MOCK_USERS.T1_USER_1);
    cy.visit(relative(`/case/${dealId}/deal`));
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    //---------------------------------------------------------------
    // user cannot assign tasks to themselves if in wrong group
    //---------------------------------------------------------------
    pages.tasksPage.filterRadioAllTasks().click();
    const firstTask = pages.tasksPage.tasks.row(1, 1);
    firstTask.link().should('not.exist');
  });

  it('user can assign a task to themselves, change status and then unassign.', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    //---------------------------------------------------------------
    // user assigns task to themselves
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

    // `in progress` status should be selected
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
});
