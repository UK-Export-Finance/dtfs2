const applicationActivities = {
  activityTimeline: () => cy.get('[data-cy="portal-activities-timeline"]'),

  // sub navigation bar
  subNavigationBar: () => cy.get('[data-cy="application-preview-sub-navigation"]'),
  subNavigationBarApplication: () => cy.get('[data-cy="application-preview-link"]'),
  subNavigationBarActivities: () => cy.get('[data-cy="application-activities-link"]'),
  facilityActivityChangedBy: (id) => cy.get(`[data-cy="facility-changed-by-${id}"]`),
  facilityActivityCheckedBy: (id) => cy.get(`[data-cy="facility-checked-by-${id}"]`),
  facilityActivityLink: (id) => cy.get(`[data-cy="facility-link-${id}"]`),
  previousStatusTag: (id) => cy.get(`[data-cy="previous-status-tag-${id}"]`),
  newStatusTag: (id) => cy.get(`[data-cy="new-status-tag-${id}"]`),
};

module.exports = applicationActivities;
