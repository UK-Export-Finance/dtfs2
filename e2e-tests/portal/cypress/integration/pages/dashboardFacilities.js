const page = {
  visit: () => cy.visit('/dashboard/facilities'),

  row: {
    nameLink: (id) => cy.get(`[data-cy="facility__name--link--${id}"]`),
    ukefFacilityId: (id) => cy.get(`[data-cy="facility__ukefId--${id}"]`),
    type: (id) => cy.get(`[data-cy="facility__type--${id}"]`),
    noticeType: (id) => cy.get(`[data-cy="facility__noticeType--${id}"]`),
    value: (id) => cy.get(`[data-cy="facility__value--${id}"]`),
    bankStage: (id) => cy.get(`[data-cy="facility__bankStage--${id}"]`),
    issuedDate: (id) => cy.get(`[data-cy="facility__issuedDate--${id}"]`),
  },

  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
};

module.exports = page;
