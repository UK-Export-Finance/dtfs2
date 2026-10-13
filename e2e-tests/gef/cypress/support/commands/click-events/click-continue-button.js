import { continueButton } from '../../../e2e/partials';

/**
 * clickContinueButton
 * Click the continue button.
 */
const clickContinueButton = () => {
  cy.document().its('readyState').should('eq', 'complete');
  continueButton().click();
};

export default clickContinueButton;
