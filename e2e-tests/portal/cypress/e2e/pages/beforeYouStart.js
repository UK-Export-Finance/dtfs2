const page = {
  visit: () => cy.visit('/before-you-start'),

  mandatoryCriteriaHeading: () => cy.get('[data-cy="mandatory-criteria-heading"]'),
  mandatoryCriteriaSubHeading: () => cy.get('[data-cy="mandatory-criteria-sub-heading"]'),
  mandatoryCriteriaIntro: () => cy.get('[data-cy="mandatory-criteria-intro"]'),
  mandatoryCriterion: () => cy.get('[data-cy="mandatory-criteria-criterion"]'),

  mandatoryCriterionOneTitle: () => cy.get('[data-cy="mandatory-criteria-criterion-1-title"]'),
  mandatoryCriterionTwoTitle: () => cy.get('[data-cy="mandatory-criteria-criterion-2-title"]'),
  mandatoryCriterionThreeTitle: () => cy.get('[data-cy="mandatory-criteria-criterion-3-title"]'),
  mandatoryCriterionFourTitle: () => cy.get('[data-cy="mandatory-criteria-criterion-4-title"]'),
  mandatoryCriterionFiveTitle: () => cy.get('[data-cy="mandatory-criteria-criterion-5-title"]'),

  true: () => cy.get('[data-cy="criteriaMet-true"]'),
  false: () => cy.get('[data-cy="criteriaMet-false"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
};

module.exports = page;
