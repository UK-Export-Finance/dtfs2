const ukefComments = {
  specialCondition: {
    title: () => cy.get('[data-cy="special-conditions-title"]'),
    text: () => cy.get('[data-cy="special-conditions-text"]'),
  },
  comments: {
    title: () => cy.get('[data-cy="ukef-comments-title"]'),
    text: () => cy.get('[data-cy="ukef-comments-text"]'),
  },
};

module.exports = ukefComments;
