export const backLink = () => cy.get('[data-cy="back-link"]');
export const continueButton = () => cy.get('[data-cy="continue-button"]');
export const errorSummary = () => cy.get('[data-cy="error-summary"]');
export const form = () => cy.get('[data-cy="form"]');
export const headingCaption = () => cy.get('[data-cy="heading-caption"]');
export const mainHeading = () => cy.get('[data-cy="main-heading"]');
export const saveAndReturnButton = () => cy.get('[data-cy="save-and-return-button"]');
export const submitButton = () => cy.get('[data-cy="submit-button"]');

// TODO: search for submitbUtton instances.
// and other selectors

// don't need the exist part.
// submitButton().should('exist');
// submitButton().click();

// TODO (?)
// cancelButton
