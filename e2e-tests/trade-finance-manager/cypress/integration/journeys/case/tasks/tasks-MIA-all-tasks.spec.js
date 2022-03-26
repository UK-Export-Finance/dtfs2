import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { BUSINESS_SUPPORT_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';
import {
  MIA_TASKS_STRUCTURE,
  submitTaskInProgress,
  submitTaskComplete,
  assertTaskStatusAndLink,
  submitTaskCompleteAndAssertOtherTasks,
  assertTaskStatus,
  assertTaskLinkDoesNotExist,
} from './tasks-helpers';

context('Case tasks - MIA deal - all tasks', () => {
  let dealId;
  const dealFacilities = [];
  let userId;

  const underwritingGroupId = 3;

  const underwritingFirstTaskId = 1;
  const underwritingSecondTaskId = 2;
  const underwritingLastTaskId = 3;

  before(() => {
    cy.getUser(BUSINESS_SUPPORT_USER_1.username).then((userObj) => {
      userId = userObj._id;
    });
  });

  beforeEach(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_MIA;

      cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType);

      cy.login(BUSINESS_SUPPORT_USER_1);
      cy.visit(relative(`/case/${dealId}/deal`));
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN_LOGIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM);
    });
  });

  const startAndCompleteLastUnderwritingTask = () => {
    const firstTaskRow = pages.tasksPage.tasks.row(underwritingGroupId, underwritingFirstTaskId);
    const secondTaskRow = pages.tasksPage.tasks.row(underwritingGroupId, underwritingSecondTaskId);
    const lastTaskRow = pages.tasksPage.tasks.row(underwritingGroupId, underwritingLastTaskId);

    submitTaskInProgress(underwritingGroupId, underwritingLastTaskId, userId);

    // go to 'all' tasks page
    pages.tasksPage.filterRadioAllTasks().click();

    // check other Underwriting group tasks have not changed
    assertTaskStatus(firstTaskRow, 'To do');
    firstTaskRow.link().should('exist');

    assertTaskStatus(secondTaskRow, 'To do');
    secondTaskRow.link().should('exist');

    // complete last task
    submitTaskComplete(underwritingGroupId, underwritingLastTaskId, userId);

    // go to 'all' tasks page
    pages.tasksPage.filterRadioAllTasks().click();

    // check the task link is no longer visible because it's complete
    lastTaskRow.link().should('not.exist');

    // check other Underwriting group tasks have not changed
    assertTaskStatus(firstTaskRow, 'To do');
    firstTaskRow.link().should('exist');

    assertTaskStatus(secondTaskRow, 'To do');
    secondTaskRow.link().should('exist');
  };

  const startAndCompleteFirstUnderwritingTask = () => {
    const secondTaskRow = pages.tasksPage.tasks.row(underwritingGroupId, underwritingSecondTaskId);
    const lastTaskRow = pages.tasksPage.tasks.row(underwritingGroupId, underwritingLastTaskId);

    submitTaskInProgress(underwritingGroupId, underwritingFirstTaskId, userId);

    // go to 'all' tasks page
    pages.tasksPage.filterRadioAllTasks().click();

    // check other Underwriting group tasks have not changed
    assertTaskStatus(lastTaskRow, 'Done');
    lastTaskRow.link().should('not.exist');

    assertTaskStatus(secondTaskRow, 'To do');
    secondTaskRow.link().should('exist');

    // complete first task
    submitTaskComplete(underwritingGroupId, underwritingFirstTaskId, userId);

    // go to 'all' tasks page
    pages.tasksPage.filterRadioAllTasks().click();

    // check the task link is no longer visible because it's complete
    lastTaskRow.link().should('not.exist');

    // check other Underwriting group tasks have not changed
    assertTaskStatus(lastTaskRow, 'Done');
    lastTaskRow.link().should('not.exist');

    assertTaskStatus(secondTaskRow, 'To do');
    secondTaskRow.link().should('exist');
  };

  const startAndCompleteSecondUnderwritingTask = () => {
    const firstTaskRow = pages.tasksPage.tasks.row(underwritingGroupId, underwritingFirstTaskId);
    const secondTaskRow = pages.tasksPage.tasks.row(underwritingGroupId, underwritingSecondTaskId);
    const lastTaskRow = pages.tasksPage.tasks.row(underwritingGroupId, underwritingLastTaskId);

    submitTaskInProgress(underwritingGroupId, underwritingSecondTaskId, userId);

    // go to 'all' tasks page
    pages.tasksPage.filterRadioAllTasks().click();

    // check other Underwriting group tasks have not changed
    assertTaskStatus(firstTaskRow, 'Done');
    firstTaskRow.link().should('not.exist');

    assertTaskStatus(lastTaskRow, 'Done');
    lastTaskRow.link().should('not.exist');

    // complete second task
    submitTaskComplete(underwritingGroupId, underwritingSecondTaskId, userId);

    // go to 'all' tasks page
    pages.tasksPage.filterRadioAllTasks().click();

    // check the task link is no longer visible because it's complete
    secondTaskRow.link().should('not.exist');

    // check other Underwriting group tasks have not changed
    assertTaskStatus(firstTaskRow, 'Done');
    firstTaskRow.link().should('not.exist');

    assertTaskStatus(lastTaskRow, 'Done');
    lastTaskRow.link().should('not.exist');
  };

  it('user cannot start a task in a group until all tasks in the previous group are completed. Each time a task is completed, the next task can be started.', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioAllTasks().click();

    //---------------------------------------------------------------
    // complete all tasks in all groups
    //
    // - previously completed tasks should NOT be clickable.
    // - next task should be clickable.
    // - tasks in the next group should NOT be clickable;
    // - - unless all tasks in the previous group are completed.
    // - - unless the group is Underwriting, in which case
    // - - - all tasks are unlocked.
    //--------------------------------------------------------------
    const group1Tasks = new Array(MIA_TASKS_STRUCTURE[1].totalGroupTasks);
    const group2Tasks = new Array(MIA_TASKS_STRUCTURE[2].totalGroupTasks);
    const group3Tasks = new Array(MIA_TASKS_STRUCTURE[3].totalGroupTasks);
    const group4Tasks = new Array(MIA_TASKS_STRUCTURE[4].totalGroupTasks);

    // Complete all tasks in 'Set up deal' group
    cy.wrap(group1Tasks).each((_, index) => {
      const taskId = index + 1;
      return new Cypress.Promise((resolve) => {
        submitTaskCompleteAndAssertOtherTasks(1, taskId, userId);
        resolve();
      });
    });

    // Complete all tasks in 'Adverse history check' group
    cy.wrap(group2Tasks).each((_, index) => {
      const taskId = index + 1;
      return new Cypress.Promise((resolve) => {
        submitTaskCompleteAndAssertOtherTasks(2, taskId, userId);
        resolve();
      });
    });

    // Because the 'Complete an adverse history check' task in 'Adverse history check' group has been completed,
    // All tasks in Underwriting Group are should be unlocked and editable
    const underwritingunderwritingGroupId = 3;
    cy.wrap(group3Tasks).each((_, index) => {
      const taskId = index + 1;

      assertTaskStatusAndLink(underwritingunderwritingGroupId, taskId, 'To do');
    });

    // Complete the last Underwriting task first
    startAndCompleteLastUnderwritingTask();

    // The next task in the next group should remain unlocked.
    const group4GroupId = 4;
    const group4FirstTaskRow = pages.tasksPage.tasks.row(group4GroupId, 1);

    assertTaskLinkDoesNotExist(group4FirstTaskRow);
    assertTaskStatus(group4FirstTaskRow, 'Cannot start yet');

    // Complete the remaining Underwriting tasks.
    startAndCompleteFirstUnderwritingTask();
    startAndCompleteSecondUnderwritingTask();

    // Complete all tasks in 'Approvals' group
    cy.wrap(group4Tasks).each((_, index) => {
      const taskId = index + 1;
      return new Cypress.Promise((resolve) => {
        submitTaskCompleteAndAssertOtherTasks(4, taskId, userId);
        resolve();
      });
    });
  });
});
