/**
 * Asserts that the correct risk margin validation error message is shown for a given input value.
 *
 * @param {string|number} params.value - The value to input for validation.
 * @param {string} params.expectedMessage - The expected validation error message.
 * @param {function} params.goToPage - Function to navigate to the relevant page, called with facilityId.
 * @param {string|number} params.facilityId - The facility ID to use for navigation.
 * @param {function} params.inputSelector - Function returning the Cypress selector for the input field.
 * @param {function} params.errorSelector - Function returning the Cypress selector for the error message element.
 * @param {Object} params.partials - Object containing page partials, including taskListHeader.
 * @param {string} [params.detailsTabName='financial-details'] - The tab name to return to after navigation.
 */
export const assertRiskMarginValidationError = ({
  value,
  expectedMessage,
  goToPage,
  facilityId,
  inputSelector,
  errorSelector,
  partials,
  detailsTabName = 'financial-details',
}) => {
  goToPage(facilityId);
  cy.keyboardInput(inputSelector(), value);
  cy.clickSubmitButton();

  // User is navigated away, so return to the page
  partials.taskListHeader.itemLink(detailsTabName).click();

  cy.url().should('include', '/financial-details');
  errorSelector().should('be.visible').and('contain', expectedMessage);
};
