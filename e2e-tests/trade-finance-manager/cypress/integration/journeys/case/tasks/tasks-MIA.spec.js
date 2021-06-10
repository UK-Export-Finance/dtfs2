import relative from '../../../relativeURL';
import partials from '../../../partials';
import pages from '../../../pages';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import MOCK_MIA_TASKS from '../../../../fixtures/tasks-MIA';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

const getGroup = (groupId) =>
  MOCK_MIA_TASKS.find((g) => g.id === groupId);

const MIA_TASKS_STRUCTURE = {
  1: {
    totalGroupTasks: getGroup(1).groupTasks.length,
  },
  2: {
    totalGroupTasks: getGroup(2).groupTasks.length,
  },
  3: {
    totalGroupTasks: getGroup(3).groupTasks.length,
  },
  4: {
    totalGroupTasks: getGroup(4).groupTasks.length,
  },
};


context('Case tasks - MIA deal', () => {
  let deal;
  let dealId;
  const dealFacilities = [];
  const businessSupportUser = MOCK_USERS.find((u) => u.teams.includes('BUSINESS_SUPPORT'));
  const userFullName = `${businessSupportUser.firstName} ${businessSupportUser.lastName}`;
  let userId;
  let loggedInUserTeamName;
  let usersInTeam;

  before(() => {
    cy.deleteDeals(MOCK_DEAL_MIA._id, ADMIN_LOGIN); // eslint-disable-line no-underscore-dangle

    cy.getUser(businessSupportUser.username).then((userObj) => {
      userId = userObj._id;
    });

    loggedInUserTeamName = businessSupportUser.teams[0]; // eslint-disable-line
    usersInTeam = MOCK_USERS.filter((u) => u.teams.includes(loggedInUserTeamName));
  });

  beforeEach(() => {
    cy.insertOneDeal(MOCK_DEAL_MIA, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = MOCK_DEAL_MIA;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId);

        cy.login(businessSupportUser);
        cy.visit(relative(`/case/${dealId}/deal`));
      });
  });

  after(() => {
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, MOCK_MAKER_TFM); // eslint-disable-line no-underscore-dangle
    });
  });

  it('should render all MIA task groups and tasks', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioAllTasks().click();

    const TOTAL_AIN_GROUPS = 4;
    pages.tasksPage.taskGroupTable().should('have.length', TOTAL_AIN_GROUPS);

    const TOTAL_MIA_TASKS = 12;
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

  const submitTaskInProgress = (groupId, taskId) => {
    const firstGroupFirstTask = pages.tasksPage.tasks.row(groupId, taskId);
    firstGroupFirstTask.link().click();

    pages.taskPage.assignedToSelectInput().select(userId);
    pages.taskPage.taskStatusRadioInputInProgress().click();
    pages.taskPage.submitButton().click();
  };

  const submitTaskComplete = (groupId, taskId) => {
    const firstGroupFirstTask = pages.tasksPage.tasks.row(groupId, taskId);
    firstGroupFirstTask.link().click();

    pages.taskPage.assignedToSelectInput().select(userId);
    pages.taskPage.taskStatusRadioInputDone().click();
    pages.taskPage.submitButton().click();
  };

  const assertCannotClickPreviousTask = (currentGroupId, currentTaskId) => {
    if (currentGroupId !== 1) {
      const isFirstTaskInGroup = currentTaskId === 1;

      if (isFirstTaskInGroup) {
        const previousGroup = MIA_TASKS_STRUCTURE[currentGroupId - 1];
        const previousGroupId = currentGroupId - 1;

        const lastTaskIdInPreviousGroup = previousGroup.totalGroupTasks;

        const lastTaskRow = pages.tasksPage.tasks.row(previousGroupId, lastTaskIdInPreviousGroup);

        lastTaskRow.link().should('not.be.visible');
      }
    } else if (currentTaskId !== 1) {
      const previousTaskId = currentTaskId - 1;

      const lastTaskRow = pages.tasksPage.tasks.row(currentGroupId, previousTaskId);

      lastTaskRow.link().should('not.be.visible');
    }
  };

  const assertCompleteTask = (groupId, taskId) => {
    const row = pages.tasksPage.tasks.row(groupId, taskId);

    row.link().should('not.be.visible');

    row.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Done');
    });
  };

  const assertNextTaskStatus = (currentGroupId, currentTaskId) => {
    const currentGroup = MIA_TASKS_STRUCTURE[currentGroupId];
    const isLastTaskInGroup = currentGroup.totalGroupTasks === currentTaskId;
    const isLastGroup = currentGroupId === 4;

    if (isLastTaskInGroup && !isLastGroup) {
      // check the next task in the next group
      const nextGroupId = currentGroupId + 1;

      const nextGroupFirstTaskRow = pages.tasksPage.tasks.row(nextGroupId, 1);

      nextGroupFirstTaskRow.status().invoke('text').then((text) => {
        expect(text.trim()).to.equal('To do');
      });
    } else if (!isLastTaskInGroup && !isLastGroup) {
      // check the next task in current group
      const nextTaskId = currentTaskId + 1;

      const nextTaskRow = pages.tasksPage.tasks.row(currentGroupId, nextTaskId);

      nextTaskRow.status().invoke('text').then((text) => {
        expect(text.trim()).to.equal('To do');
      });
    }
  };

  const assertCannotClickNextTask = (currentGroupId, currentTaskId) => {
    const currentGroup = MIA_TASKS_STRUCTURE[currentGroupId];
    const isLastTaskInGroup = currentGroup.totalGroupTasks === currentTaskId;
    const isLastGroup = currentGroupId === 4;

    if (isLastTaskInGroup && !isLastGroup) {
      // check the next task in the next group
      const nextGroupId = currentGroupId + 1;

      const nextGroupFirstTaskRow = pages.tasksPage.tasks.row(nextGroupId, 1);

      nextGroupFirstTaskRow.link().should('not.be.visible');

      nextGroupFirstTaskRow.status().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Cannot start yet');
      });
    } else if (!isLastTaskInGroup && !isLastGroup) {
      // check the next task in current group
      const nextTaskId = currentTaskId + 1;

      const nextTaskRow = pages.tasksPage.tasks.row(currentGroupId, nextTaskId);

      nextTaskRow.link().should('not.be.visible');

      nextTaskRow.status().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Cannot start yet');
      });
    }
  };

  const submitTaskCompleteAndAssertOtherTasks = (groupId, taskId) => {
    submitTaskInProgress(groupId, taskId);

    pages.tasksPage.filterRadioAllTasks().click();

    assertCannotClickNextTask(groupId, taskId);

    submitTaskComplete(groupId, taskId);

    pages.tasksPage.filterRadioAllTasks().click();

    assertCompleteTask(groupId, taskId);

    assertNextTaskStatus(groupId, taskId);

    assertCannotClickPreviousTask(groupId, taskId);
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
    //--------------------------------------------------------------
    const group1Tasks = new Array(MIA_TASKS_STRUCTURE[1].totalGroupTasks);
    const group2Tasks = new Array(MIA_TASKS_STRUCTURE[2].totalGroupTasks);
    const group3Tasks = new Array(MIA_TASKS_STRUCTURE[3].totalGroupTasks);
    const group4Tasks = new Array(MIA_TASKS_STRUCTURE[4].totalGroupTasks);

    cy.wrap(group1Tasks).each((task, index) => {
      const taskId = index + 1;
      return new Cypress.Promise((resolve) => {
        submitTaskCompleteAndAssertOtherTasks(1, taskId);
        resolve();
      });
    });

    cy.wrap(group2Tasks).each((task, index) => {
      const taskId = index + 1;
      return new Cypress.Promise((resolve) => {
        submitTaskCompleteAndAssertOtherTasks(2, taskId);
        resolve();
      });
    });

    cy.wrap(group3Tasks).each((task, index) => {
      const taskId = index + 1;
      return new Cypress.Promise((resolve) => {
        submitTaskCompleteAndAssertOtherTasks(3, taskId);
        resolve();
      });
    });

    cy.wrap(group4Tasks).each((task, index) => {
      const taskId = index + 1;
      return new Cypress.Promise((resolve) => {
        submitTaskCompleteAndAssertOtherTasks(4, taskId);
        resolve();
      });
    });
  });

  it('starting the first task in the first group updates the deal stage from `Application` to `In progress`', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioAllTasks().click();

    // check initial deal stage
    partials.caseSummary.ukefDealStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Application');
    });

    submitTaskInProgress(1, 1);

    partials.caseSummary.ukefDealStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('In progress');
    });
  });

  it('completing the first task in the first group updates the deal stage from `Application` to `In progress`', () => {
    partials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', relative(`/case/${dealId}/tasks`));

    pages.tasksPage.filterRadioAllTasks().click();

    // check initial deal stage
    partials.caseSummary.ukefDealStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Application');
    });

    submitTaskComplete(1, 1);

    partials.caseSummary.ukefDealStage().invoke('text').then((text) => {
      expect(text.trim()).to.equal('In progress');
    });
  });
});
