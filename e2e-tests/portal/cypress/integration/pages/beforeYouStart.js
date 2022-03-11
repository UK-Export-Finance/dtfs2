const page = {
  visit: () => cy.visit('/before-you-start'),
  true: () => cy.get('[data-cy="criteriaMet-true"]'),
  false: () => cy.get('[data-cy="criteriaMet-false"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),

  mandatoryCriteriaHeading: () => cy.get('[data-cy="mandatory-criteria-heading"]'),
  mandatoryCriteriaSubHeading: () => cy.get('[data-cy="mandatory-criteria-sub-heading"]'),
  mandatoryCriteriaIntro: () => cy.get('[data-cy="mandatory-criteria-intro"]'),
  mandatoryCriterion: () => cy.get('[data-cy="mandatory-criteria-criterion"]'),
};

module.exports = page;
