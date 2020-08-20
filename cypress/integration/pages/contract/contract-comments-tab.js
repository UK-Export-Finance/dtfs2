const page = {
  visit: (deal) => cy.visit(`/contract/${deal._id}/comments`),
  specialCondition: {
    title: () => cy.get('[data-cy="special-conditions-title"]'),
    text: () => cy.get('[data-cy="special-conditions-text"]'),
  },
  ukefComments: {
    title: () => cy.get('[data-cy="ukef-comments-title"]'),
    text: () => cy.get('[data-cy="ukef-comments-text"]'),
  },
  row: (counter) => ({
    comment: () => cy.get(`[data-cy="comment-${counter}"]`),
    commentorName: () => cy.get(`[data-cy="commentor-name-${counter}"]`),
    commentDateTime: () => cy.get(`[data-cy="comment-datetime-${counter}"]`),
  }),
};

module.exports = page;
