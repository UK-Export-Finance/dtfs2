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
