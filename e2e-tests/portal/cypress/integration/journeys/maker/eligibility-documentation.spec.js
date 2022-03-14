const { contract, eligibilityCriteria, eligibilityDocumentation } = require('../../pages');
const { taskListHeader } = require('../../partials');

const MOCK_USERS = require('../../../fixtures/users');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Eligibility Documentation', () => {
  beforeEach(() => {
    cy.createADeal({
      ...BANK1_MAKER1,
      bankDealId: 'someDealId',
      bankDealName: 'someDealName',
    });

    contract.eligibilityCriteriaLink().click();
  });

  it('should display correct title for Eligibility Documentation', () => {
    taskListHeader.itemLink('supporting-documentation').click();
    eligibilityDocumentation.title().contains('Add supporting documentation');
  });

  it('should display validation error if Manual Inclusion Questionnaire not submitted', () => {
    taskListHeader.itemLink('supporting-documentation').click();
    eligibilityDocumentation.saveButton().click();

    eligibilityDocumentation.fieldErrorMessage('exporterQuestionnaire').should('have.length', 1);
  });

  it('should make exporter questionnaire mandatory for non AIN', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().click({ multiple: true });
    eligibilityCriteria.eligibilityCriteriaFalse(14).click();
    eligibilityCriteria.nextPageButton().click();
    eligibilityDocumentation.fieldErrorMessage('exporterQuestionnaire').should('have.length', 1);
  });

  it('should not make exporter questionnaire mandatory for AIN', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().click({ multiple: true });
    eligibilityCriteria.nextPageButton().click();
    eligibilityDocumentation.fieldErrorMessage('exporterQuestionnaire').should('have.length', 0);
  });

  it('should show optional for optional supporting documentations', () => {
    eligibilityCriteria.nextPageButton().click();
    eligibilityDocumentation.questionnaireFileInput().should('not.contain', '(optional)');
    eligibilityDocumentation.financialStatements().contains('Financial statements for the past 3 years (optional)');
    eligibilityDocumentation.yearToDate().contains('Year to date management accounts (optional)');
    eligibilityDocumentation.financialForecast().contains('Financial forecasts for the next 3 years (optional)');
    eligibilityDocumentation.financialCommentary().contains('Brief commentary on the financial information (optional)');
    eligibilityDocumentation.corporateStructure().contains('Corporate structure diagram (optional)');
    eligibilityDocumentation.securityText().contains('Security (optional)');
  });

  it('should redirect to preview page if no validation errors', () => {
    eligibilityCriteria.eligibilityCriteriaItemsRadioButtons.trueInput().click({ multiple: true });
    eligibilityCriteria.nextPageButton().click();
    eligibilityDocumentation.saveButton().click();

    cy.url().should('include', '/eligibility/check-your-answers');
  });

  it('should only display upload button when a file has been chosen', () => {
    taskListHeader.itemLink('supporting-documentation').click();
    eligibilityDocumentation.downloadMIQuestionaireLinkDoc().contains('Download Manual Inclusion Questionnaire.docx (21KB)');
    eligibilityDocumentation.downloadMIQuestionaireLinkDoc().invoke('attr', 'href').then((href) => {
      expect(href).to.equal('/assets/files/Manual%20Inclusion%20Questionnaire%20v2_0.docx');
    });
    eligibilityDocumentation.downloadMIQuestionaireLinkPdf().contains('Download Manual Inclusion Questionnaire.pdf (129KB)');
    eligibilityDocumentation.downloadMIQuestionaireLinkPdf().invoke('attr', 'href').then((href) => {
      expect(href).to.equal('/assets/files/Manual%20Inclusion%20Questionnaire%20v2_0.pdf');
    });
    eligibilityDocumentation.questionnaireFileInputUploadButton().should('not.be.visible');
    eligibilityDocumentation.questionnaireFileInputUpload().attachFile('test-upload.txt');
    eligibilityDocumentation.questionnaireFileInputUploadButton().should('be.visible');
  });

  it('should list the uploaded files and remove them', () => {
    taskListHeader.itemLink('supporting-documentation').click();
    eligibilityDocumentation.questionnaireFileInputUpload().attachFile('test-upload.txt');
    eligibilityDocumentation.questionnaireFileInputUploadButton().click();
    eligibilityDocumentation.questionnaireFileInputUploadButton().should('not.be.visible');

    eligibilityDocumentation.questionnaireFileUploaded().should('have.length', 1);
    eligibilityDocumentation.questionnaireFileUploaded().contains('test-upload.txt (16 B)');
    eligibilityDocumentation.questionnaireFileUploadedRemove().should('have.length', 1);

    eligibilityDocumentation.questionnaireFileUploadedRemove().click();
    eligibilityDocumentation.questionnaireFileUploaded().should('not.exist');
    eligibilityDocumentation.questionnaireFileUploadedRemove().should('not.exist');
  });
});
