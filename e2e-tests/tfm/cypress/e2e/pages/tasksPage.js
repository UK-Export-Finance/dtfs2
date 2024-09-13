const tasksPage = {
  tasksHeading: () => cy.get('[data-cy="tasks-heading"]'),
  tasksTableRows: () => cy.get('[data-cy="tasks-table"] tbody tr'),
  taskGroupTable: () => cy.get('[data-cy="task-group-table"]'),
  taskTypeHeading: () => cy.get('[data-cy="tasks-deal-submission-type"]'),
  taskGroupHeading: () => cy.get('[data-cy="task-group-title"]'),
  tasks: {
    row: (groupId, taskId) => {
      cy.get(`[data-cy="task-group-${groupId}-task-${taskId}-row"]`).as('row');
      return {
        link: () => cy.get('@row').get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-link"]`),
        title: () => cy.get('@row').get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-title"]`),
        assignedTo: () => cy.get('@row').get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-user-full-name"]`),
        team: () => cy.get('@row').get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-team-name"]`),
        dateStarted: () => cy.get('@row').get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-date-started"]`),
        dateCompleted: () => cy.get('@row').get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-date-completed"]`),
        status: () => cy.get('@row').get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-status"]`),
      };
    },
  },
  filterRadioYourTasks: () => cy.get('[data-cy="task-radio-button-your-tasks"]'),
  filterRadioYourTeam: () => cy.get('[data-cy="task-radio-button-your-team"]'),
  filterRadioAllTasks: () => cy.get('[data-cy="task-radio-button-all"]'),
};

module.exports = tasksPage;
