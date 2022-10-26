const activitiesPage = {
  mainHeading: () => cy.get('[data-cy="activity-heading"]'),
  addACommentHeading: () => cy.get('[data-cy="main-heading"]'),

  filterAllActivity: () => cy.get('[data-cy="activity-comment-radio-button-all-activities"]'),
  filterCommentsOnly: () => cy.get('[data-cy="activity-comment-radio-button-comments-only"]'),

  addACommentButton: () => cy.get('[data-cy="add-comment-button"]'),
  activitiesTimeline: () => cy.get('[data-cy="activities-timeline"]'),
};

module.exports = activitiesPage;
