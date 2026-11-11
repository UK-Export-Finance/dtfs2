import { continueButton } from '../../e2e/partials';

/**
 * clickContinueButton
 * Click the continue button.
 */
export const clickContinueButton = () => {
  cy.document().its('readyState').should('eq', 'complete');

  continueButton().click();
};
