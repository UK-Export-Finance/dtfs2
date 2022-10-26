const applicationActivities = {
  activityTimeline: () => cy.get('[data-cy="portal-activities-timeline"]'),

  // sub navigation bar
  subNavigationBar: () => cy.get('[data-cy="application-preview-sub-navigation"]'),
  subNavigationBarApplication: () => cy.get('[data-cy="application-preview-link"]'),
  subNavigationBarActivities: () => cy.get('[data-cy="application-activities-link"]'),
  facilityActivityChangedBy: (id) => cy.get(`[data-cy="facility-changedby-${id}"]`),
  facilityActivityCheckedBy: (id) => cy.get(`[data-cy="facility-checkedby-${id}"]`),
  facilityActivityLink: (id) => cy.get(`[data-cy="facility-link-${id}"]`),
  facilityActivityUnissuedTag: (id) => cy.get(`[data-cy="facility-unissued-tag-${id}"]`),
  facilityActivityIssuedTag: (id) => cy.get(`[data-cy="facility-issued-tag-${id}"]`),
};

module.exports = applicationActivities;
