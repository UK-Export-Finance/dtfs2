const page = {
  visit: () => cy.visit('/dashboard/facilities/gef'),

  stage: () => cy.get('[data-cy="stage"]'),
  type: () => cy.get('[data-cy="type"]'),
  ukefId: () => cy.get('[data-cy="ukefId"]'),
  bankId: () => cy.get('[data-cy="bankInternalRefName"]'),

  results: () => cy.get('.govuk-table__body'),
  bankFacilityId: (id) => cy.get(`[data-cy="facility__bankId--${id}"]`),
  ukefFacilityId: (id) => cy.get(`[data-cy="facility__ukefId--${id}"]`),
  facilityType: (id) => cy.get(`[data-cy="facility__facilityType--${id}"]`),
  noticeType: (id) => cy.get(`[data-cy="facility__noticeType--${id}"]`),
  facilityValue: (id) => cy.get(`[data-cy="facility__value--${id}"]`),
  bankStage: (id) => cy.get(`[data-cy="facility__bankStage--${id}"]`),
  ukefStage: (id) => cy.get(`[data-cy="facility__ukefStage--${id}"]`),
  issuedDate: (id) => cy.get(`[data-cy="facility__date--${id}"]`),

  first: () => cy.get('[data-cy="First"]'),
  previous: () => cy.get('[data-cy="Previous"]'),
  next: () => cy.get('[data-cy="Next"]'),
  last: () => cy.get('[data-cy="Last"]'),
  totalItems: () => cy.get('[data-cy="totalItems"]'),
};

module.exports = page;
