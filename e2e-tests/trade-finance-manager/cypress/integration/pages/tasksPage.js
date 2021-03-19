const tasksPage = {
  tasksListRows: () => cy.get('[data-cy="tasks-list"] tbody tr'),
  tasks: {
    row: (taskId) => {
      const row = cy.get(`[data-cy="task-${taskId}-row"]`);
      return {
        row,
        link: () => row.get(`[data-cy="task-${taskId}-link"]`),
      };
    },
  },
};

module.exports = tasksPage;
