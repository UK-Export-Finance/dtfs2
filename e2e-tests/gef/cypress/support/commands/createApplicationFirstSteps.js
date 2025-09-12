import dashboardPage from '../../e2e/pages/dashboard-page';

/**
 * Sets up a new GEF application from the dashboard page including
 * the application name and GEF type and mandatory criteria
 */
export const createApplicationFirstSteps = () => {
  dashboardPage.createNewSubmission().click();
  dashboardPage.gefSubmission().click();
  cy.clickContinueButton();

  dashboardPage.mandatoryCriteriaYes().click();
  cy.clickContinueButton();

  cy.keyboardInput(dashboardPage.internalRefName(), 'A');
  cy.clickContinueButton();
};
