const { contract, eligibilityCriteria, eligibilityDocumentation } = require('../../pages');
const { errorSummary } = require('../../partials');


context('Eligibility Documentation', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.createADeal({
      username: 'MAKER',
      password: 'MAKER',
      bankDealId: 'someDealId',
      bankDealName: 'someDealName',
    });

    contract.eligibilityCriteriaLink().click();
  });

  it('should display validation error if Manual Inclusion Questionnaire not submitted', () => {
    eligibilityCriteria.eligibiityProgressNav.supportingDocumentation().click();
    eligibilityDocumentation.saveButton().click();

    eligibilityDocumentation.fieldErrorMessage('exporterQuestionnaire').should('have.length', 1);
  });

  it('should display validation error for finance fields if EC12 is false', () => {
    eligibilityCriteria.eligibilityCriteriaFalse(12).click();
    eligibilityCriteria.nextPageButton().click();
    eligibilityCriteria.eligibiityProgressNav.supportingDocumentation().click();

    eligibilityDocumentation.saveButton().click();

    eligibilityDocumentation.fieldErrorMessage('auditedFinancialStatements').should('have.length', 1);
    eligibilityDocumentation.fieldErrorMessage('yearToDateManagement').should('have.length', 1);
    eligibilityDocumentation.fieldErrorMessage('financialForecasts').should('have.length', 1);
    eligibilityDocumentation.fieldErrorMessage('financialInformationCommentary').should('have.length', 1);
  });

  it('should display validation error for finance fields if EC13 is false', () => {
    eligibilityCriteria.eligibilityCriteriaFalse(13).click();
    eligibilityCriteria.nextPageButton().click();
    eligibilityCriteria.eligibiityProgressNav.supportingDocumentation().click();

    eligibilityDocumentation.saveButton().click();

    eligibilityDocumentation.fieldErrorMessage('auditedFinancialStatements').should('have.length', 1);
    eligibilityDocumentation.fieldErrorMessage('yearToDateManagement').should('have.length', 1);
    eligibilityDocumentation.fieldErrorMessage('financialForecasts').should('have.length', 1);
    eligibilityDocumentation.fieldErrorMessage('financialInformationCommentary').should('have.length', 1);
  });

  it('should not display validation error for finance fields if both EC12 & EC13 are true', () => {
    eligibilityCriteria.eligibilityCriteriaTrue(12).click();
    eligibilityCriteria.eligibilityCriteriaTrue(13).click();
    eligibilityCriteria.nextPageButton().click();
    eligibilityCriteria.eligibiityProgressNav.supportingDocumentation().click();

    eligibilityDocumentation.saveButton().click();

    eligibilityDocumentation.fieldErrorMessage('auditedFinancialStatements').should('have.length', 0);
    eligibilityDocumentation.fieldErrorMessage('yearToDateManagement').should('have.length', 0);
    eligibilityDocumentation.fieldErrorMessage('financialForecasts').should('have.length', 0);
    eligibilityDocumentation.fieldErrorMessage('financialInformationCommentary').should('have.length', 0);
  });

  it('should make exporter questionnaire mandatory for non AIN', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().click({ multiple: true });
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.falseInput().first().click();
    eligibilityCriteria.nextPageButton().click();
    eligibilityDocumentation.fieldErrorMessage('exporterQuestionnaire').should('have.length', 1);
  });

  it('should not make exporter questionnaire mandatory for AIN', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().click({ multiple: true });
    eligibilityCriteria.nextPageButton().click();
    eligibilityDocumentation.fieldErrorMessage('exporterQuestionnaire').should('have.length', 0);
  });

  it('should redirect to preview page if no validation errors', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().click({ multiple: true });
    eligibilityCriteria.nextPageButton().click();
    eligibilityDocumentation.saveButton().click();

    cy.url().should('include', '/eligibility/preview');
  });
});
