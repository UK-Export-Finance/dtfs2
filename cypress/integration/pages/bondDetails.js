const page = {
  bondIssuerInput: () => cy.get('[data-cy="bond-issuer"]'),
  bondTypeSelectInput: () => cy.get('[data-cy="bond-type"]'),
  bondStageUnissuedInput: () => cy.get('[data-cy="bond-stage-unissued"]'),
  bondStageIssuedInput: () => cy.get('[data-cy="bond-stage-issued"]'),
  ukefGuaranteeInMonthsInput: () => cy.get('[data-cy="ukef-guarantee-in-months"]'),
  bondBeneficiaryInput: () => cy.get('[data-cy="bond-beneficiary"]'),
  submit: () => cy.get('button'),
};

module.exports = page;
