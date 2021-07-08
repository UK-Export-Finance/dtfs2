const tasksPage = {
  tasksTableRows: () => cy.get('[data-cy="tasks-table"] tbody tr'),
  taskGroupTable: () => cy.get('[data-cy="task-group-table"]'),
  tasks: {
    row: (groupId, taskId) => {
      const row = cy.get(`[data-cy="task-group-${groupId}-task-${taskId}-row"]`);
      return {
        row,
        link: () => row.get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-link"]`),
        title: () => row.get(`[data-cy="task-table-row-${taskId}-title"]`),
        assignedTo: () => row.get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-user-full-name"]`),
        dateStarted: () => row.get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-date-started"]`),
        dateCompleted: () => row.get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-date-completed"]`),
        status: () => row.get(`[data-cy="task-table-row-group-${groupId}-task-${taskId}-status"]`),
      };
    },
  },
  filterRadioYourTasks: () => cy.get('[data-cy="task-radio-button-your-tasks"]'),
  filterRadioYourTeam: () => cy.get('[data-cy="task-radio-button-your-team"]'),
  filterRadioAllTasks: () => cy.get('[data-cy="task-radio-button-all"]'),
};

module.exports = tasksPage;
