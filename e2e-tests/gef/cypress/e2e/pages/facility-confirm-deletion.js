const facilityConfirmDeletion = {
  content: () => cy.get('[data-cy="content"]'),
  deleteButton: () => cy.get('[data-cy="delete-button"]'),
  keepButton: () => cy.get('[data-cy="keep-button"]'),
};

export default facilityConfirmDeletion;
