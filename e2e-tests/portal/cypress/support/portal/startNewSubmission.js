const { dashboard, selectScheme, beforeYouStart } = require('../../e2e/pages');
/**
 * Initiates a new submission process for a BSS (Business Support Scheme) deal.
 *  * This function performs the following steps:
 * 1. Clicks the button to create a new submission on the dashboard.
 * 2. Selects the BSS scheme.
 * 3. Clicks the continue button.
 * 4. Confirms the "Before You Start" step.
 * 5. Clicks the submit button to finalize the initiation.
 */
const startNewSubmission = () => {
  dashboard.createNewSubmission().click();
  selectScheme.bss().click();
  cy.clickContinueButton();
  beforeYouStart.true().click();
  cy.clickSubmitButton();
};

export { startNewSubmission };
