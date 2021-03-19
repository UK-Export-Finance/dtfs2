const tasksPage = {
  tasksListItems: () => cy.get('[data-cy="tasks-list"] li'),
  tasks: {
    listItem: (taskId) => {
      const listItem = cy.get(`[data-cy="task-${taskId}-list-item"]`);
      return {
        listItem,
        link: () => listItem.get(`[data-cy="task-${taskId}-list-item-link"]`),
      };
    },
  },
};

module.exports = tasksPage;
