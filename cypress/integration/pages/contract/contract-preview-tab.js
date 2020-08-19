const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/submission-details`),

  header: () => cy.get('[data-cy="heading"]'),
  specialCondition: {
    title: () => cy.get('[data-cy="special-conditions-title"]'),
    text: () => cy.get('[data-cy="special-conditions-text"]'),
  },
  ukefComments: {
    title: () => cy.get('[data-cy="ukef-comments-title"]'),
    text: () => cy.get('[data-cy="ukef-comments-text"]'),
  },

};

module.exports = page;
