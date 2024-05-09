const taskPage = {
  taskHeading: () => cy.get('[data-cy="task-heading"]'),

  assignedToSelectInput: () => cy.get('[data-cy="assigned-to-select-input"]').first(),
  assignedToSelectInputOption: () => cy.get('[data-cy="assigned-to-select-input"] option'),
  assignedToSelectInputSelectedOption: () => cy.get('[data-cy="assigned-to-select-input"]').first().find('option:selected'),

  taskStatusRadioInput: () => cy.get('[data-cy="task-status-radios"] input'),
  taskStatusRadioInputTodo: () => cy.get('[data-cy="task-status-to-do"]'),
  taskStatusRadioInputInProgress: () => cy.get('[data-cy="task-status-in-progress"]'),
  taskStatusRadioInputDone: () => cy.get('[data-cy="task-status-done"]'),

  submitButton: () => cy.get('[data-cy="submit-button"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
};

module.exports = taskPage;
