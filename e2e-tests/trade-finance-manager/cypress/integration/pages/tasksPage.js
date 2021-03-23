const tasksPage = {
  tasksTableRows: () => cy.get('[data-cy="tasks-table"] tbody tr'),
  tasks: {
    row: (taskId) => {
      const row = cy.get(`[data-cy="task-${taskId}-row"]`);
      return {
        row,
        link: () => row.get(`[data-cy="task-table-row-${taskId}-link"]`),
        assignedTo: () => row.get(`[data-cy="task-table-row-${taskId}-user-full-name"]`),
        status: () => row.get(`[data-cy="task-table-row-${taskId}-status"]`),
      };
    },
  },
};

module.exports = tasksPage;
