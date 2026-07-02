const nameApplication = {
  internalRef: () => cy.get('[data-cy="internal-ref"]'),
  additionalRef: () => cy.get('[data-cy="additional-ref"]'),
  formError: () => cy.get('[data-cy="internal-ref-error"]'),
  firstErrorLink: () => cy.get('[data-cy="error-summary"]').first('a'),
  applicationDetailsPage: () => cy.get('[data-cy="application-details-page"]'),
};

export default nameApplication;
