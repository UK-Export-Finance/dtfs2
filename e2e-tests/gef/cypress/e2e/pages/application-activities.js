const applicationActivities = {
  activityTimeline: () => cy.get('[data-cy="portal-activities-timeline"]'),
  byline: (activityTitle) => cy.get(`[data-cy="activity-${activityTitle}-byline"]`),
  dealLink: (id) => cy.get(`[data-cy="deal-link-${id}"]`),
  dateTime: (activityTitle) => cy.get(`[data-cy="activity-${activityTitle}-date-time"]`),
  facilityActivityChangedBy: (id) => cy.get(`[data-cy="facility-changed-by-${id}"]`),
  facilityActivityCheckedBy: (id) => cy.get(`[data-cy="facility-checked-by-${id}"]`),
  facilityActivityLink: (id) => cy.get(`[data-cy="facility-link-${id}"]`),
  newStatusTag: (id) => cy.get(`[data-cy="new-status-tag-${id}"]`),
  previousStatusTag: (id) => cy.get(`[data-cy="previous-status-tag-${id}"]`),
  title: (activityTitle) => cy.get(`[data-cy="activity-${activityTitle}-title"]`),
  subNavigationBar: () => cy.get('[data-cy="application-preview-sub-navigation"]'),
  subNavigationBarApplication: () => cy.get('[data-cy="application-preview-link"]'),
  subNavigationBarActivities: () => cy.get('[data-cy="application-activities-link"]'),
};

module.exports = applicationActivities;
