const facilities = {
  hasBeenIssuedHeading: () => cy.get('[data-cy="has-been-issued-heading"]'),
  hasBeenIssuedError: () => cy.get('[data-cy="has-been-issued-error"]'),
  hasBeenIssuedRadioYesRadioButton: () => cy.get('[data-cy="has-been-issued-radio-yes"]'),
  hasBeenIssuedRadioNoRadioButton: () => cy.get('[data-cy="has-been-issued-radio-no"]'),
};

export default facilities;
