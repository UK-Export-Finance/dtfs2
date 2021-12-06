const applicationActivities = {
  activityTimeline: () => cy.get('[data-cy="portal-activities-timeline"]'),

  // sub navigation bar
  subNavigationBar: () => cy.get('[data-cy="application-preview-sub-navigation"]'),
  subNavigationBarApplication: () => cy.get('[data-cy="application-preview-link"]'),
  subNavigationBarActivities: () => cy.get('[data-cy="application-activities-link"]'),
};

module.exports = applicationActivities;
