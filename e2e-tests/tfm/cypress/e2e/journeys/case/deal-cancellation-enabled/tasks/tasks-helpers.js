const MOCK_MIA_TASKS = require('../../../../../fixtures/tasks-MIA');
const pages = require('../../../../pages');

const getGroup = (groupId) => MOCK_MIA_TASKS.find((g) => g.id === groupId);

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

const submitTaskInProgress = (groupId, taskId, userId) => {
  const firstGroupFirstTask = pages.tasksPage.tasks.row(groupId, taskId);
  firstGroupFirstTask.link().click();

  pages.taskPage.assignedToSelectInput().select(userId);
  pages.taskPage.taskStatusRadioInputInProgress().click();
  cy.clickSubmitButton();
};

const submitTaskComplete = (groupId, taskId, userId) => {
  const firstGroupFirstTask = pages.tasksPage.tasks.row(groupId, taskId);
  firstGroupFirstTask.link().click();

  pages.taskPage.assignedToSelectInput().select(userId);
  pages.taskPage.taskStatusRadioInputDone().click();
  cy.clickSubmitButton();
};

const assertCannotClickPreviousTask = (currentGroupId, currentTaskId) => {
  if (currentGroupId !== 1) {
    const isFirstTaskInGroup = currentTaskId === 1;

    if (isFirstTaskInGroup) {
      const previousGroup = MIA_TASKS_STRUCTURE[currentGroupId - 1];
      const previousGroupId = currentGroupId - 1;

      const lastTaskIdInPreviousGroup = previousGroup.totalGroupTasks;

      const lastTaskRow = pages.tasksPage.tasks.row(previousGroupId, lastTaskIdInPreviousGroup);

      lastTaskRow.link().should('not.exist');
    }
  } else if (currentTaskId !== 1) {
    const previousTaskId = currentTaskId - 1;

    const lastTaskRow = pages.tasksPage.tasks.row(currentGroupId, previousTaskId);

    lastTaskRow.link().should('not.exist');
  }
};

const assertCompleteTask = (groupId, taskId) => {
  const row = pages.tasksPage.tasks.row(groupId, taskId);

  row.link().should('not.exist');

  cy.assertText(row.status(), 'Done');
};

const assertTaskStatus = (row, expectedStatus) => {
  cy.assertText(row.status(), expectedStatus);
};

const assertTaskLinkExists = (row) => {
  row.link().should('exist');
};

const assertTaskLinkDoesNotExist = (row) => {
  row.link().should('not.exist');
};

const assertTaskStatusAndLink = (groupId, taskId, expectedStatus) => {
  const taskRow = pages.tasksPage.tasks.row(groupId, taskId);

  assertTaskStatus(taskRow, expectedStatus);

  assertTaskLinkExists(taskRow);
};

const assertNextTaskStatus = (currentGroupId, currentTaskId) => {
  const currentGroup = MIA_TASKS_STRUCTURE[currentGroupId];
  const isLastTaskInGroup = currentGroup.totalGroupTasks === currentTaskId;
  const isLastGroup = currentGroupId === 4;

  if (isLastTaskInGroup && !isLastGroup) {
    // check the next task in the next group
    const nextGroupId = currentGroupId + 1;

    const nextGroupFirstTaskRow = pages.tasksPage.tasks.row(nextGroupId, 1);

    cy.assertText(nextGroupFirstTaskRow.status(), 'To do');
  } else if (!isLastTaskInGroup && !isLastGroup) {
    // check the next task in current group
    const nextTaskId = currentTaskId + 1;

    const nextTaskRow = pages.tasksPage.tasks.row(currentGroupId, nextTaskId);

    cy.assertText(nextTaskRow.status(), 'To do');
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

    nextGroupFirstTaskRow.link().should('not.exist');

    cy.assertText(nextGroupFirstTaskRow.status(), 'Cannot start yet');
  } else if (!isLastTaskInGroup && !isLastGroup) {
    // check the next task in current group
    const nextTaskId = currentTaskId + 1;

    const nextTaskRow = pages.tasksPage.tasks.row(currentGroupId, nextTaskId);

    nextTaskRow.link().should('not.exist');

    cy.assertText(nextTaskRow.status(), 'Cannot start yet');
  }
};

const submitTaskCompleteAndAssertOtherTasks = (groupId, taskId, userId) => {
  submitTaskInProgress(groupId, taskId, userId);

  pages.tasksPage.filterRadioAllTasks().click();

  assertCannotClickNextTask(groupId, taskId);

  submitTaskComplete(groupId, taskId, userId);

  pages.tasksPage.filterRadioAllTasks().click();

  assertCompleteTask(groupId, taskId);

  assertNextTaskStatus(groupId, taskId);

  assertCannotClickPreviousTask(groupId, taskId);
};

module.exports = {
  getGroup,
  MIA_TASKS_STRUCTURE,
  submitTaskInProgress,
  submitTaskComplete,
  assertCompleteTask,
  assertTaskStatus,
  assertTaskLinkExists,
  assertTaskLinkDoesNotExist,
  assertTaskStatusAndLink,
  assertNextTaskStatus,
  assertCannotClickNextTask,
  submitTaskCompleteAndAssertOtherTasks,
};
