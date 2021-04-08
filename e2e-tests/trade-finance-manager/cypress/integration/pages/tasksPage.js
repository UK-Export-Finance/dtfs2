const tasksPage = {
  tasksTableRows: () => cy.get('[data-cy="tasks-table"] tbody tr'),
  tasks: {
    row: (taskId) => {
      const row = cy.get(`[data-cy="task-${taskId}-row"]`);
      return {
        row,
        link: () => row.get(`[data-cy="task-table-row-${taskId}-link"]`),
        title: () => row.get(`[data-cy="task-table-row-${taskId}-title"]`),
        assignedTo: () => row.get(`[data-cy="task-table-row-${taskId}-user-full-name"]`),
        status: () => row.get(`[data-cy="task-table-row-${taskId}-status"]`),
      };
    },
  },
  filterRadioYourTasks: () => cy.get('[data-cy="task-radio-button-your-tasks"]'),
  filterRadioYourTeam: () => cy.get('[data-cy="task-radio-button-your-team"]'),
  filterRadioAllTasks: () => cy.get('[data-cy="task-radio-button-all"]'),
};

module.exports = tasksPage;
