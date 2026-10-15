import { continueButton } from '../../../e2e/partials';

/**
 * clickContinueButton
 * Click the cancel button.
 */
const clickContinueButton = () => {
  cy.document().its('readyState').should('eq', 'complete');
  continueButton().click();
};

export default clickContinueButton;
