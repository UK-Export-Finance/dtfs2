import relative from '../../relativeURL';
import { mainHeading, form, continueButton, saveAndReturnButton } from '../../partials';
import automaticCover from '../../pages/automatic-cover';
import ineligibleAutomaticCover from '../../pages/ineligible-automatic-cover';
import manualInclusion from '../../pages/manual-inclusion-questionnaire';
import securityDetails from '../../pages/security-details';
import applicationDetails from '../../pages/application-details';
import { BANK1_MAKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';

let dealId;

context('Eligibility Criterion 16', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[0]._id;
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealId}/automatic-cover`));
  });

  describe('Visiting page eligibility criteria page', () => {
    it('displays the correct elements', () => {
      mainHeading();
      form();
      automaticCover.automaticCoverTerm(16).should('exist');
      continueButton();
      saveAndReturnButton();
    });
  });

  describe('Selecting false on eligibility criteria 16', () => {
    it('the eligibility criteria have the correct aria-labels on radio buttons for true and false', () => {
      automaticCover
        .trueRadioButton(16)
        .first()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal(
            "Eligibility criterion, 16, The Bank has received an Exporter Declaration which confirms that the Exporter's Revenue Threshold Test Percentage (as defined in the relevant Exporter Declaration) is below 5%., true",
          );
        });

      automaticCover
        .falseRadioButton(16)
        .first()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal(
            "Eligibility criterion, 16, The Bank has received an Exporter Declaration which confirms that the Exporter's Revenue Threshold Test Percentage (as defined in the relevant Exporter Declaration) is below 5%., false",
          );
        });
    });

    it('selecting false on criterion 16 and pressing continue should take user to manual inclusion questionnaire page', () => {
      // All criterion
      cy.automaticEligibilityCriteria();

      // Criterion 16 - Converts to manual application
      automaticCover.falseRadioButton(16).click();

      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/ineligible-automatic-cover`));

      mainHeading().contains('This is not eligible for automatic cover');
      ineligibleAutomaticCover.content().contains("You'll now need to complete a manual inclusion application.");
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));

      cy.uploadFile('upload-file-valid.doc', `/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadSuccess('upload_file_valid.doc');
    });

    it('successfully uploading file takes you to security details page', () => {
      cy.visit(relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/security-details`));

      mainHeading().contains('Enter security details');
      securityDetails.exporterSecurity().type('exporter test');
      securityDetails.facilitySecurity().type('facility test');
      cy.clickContinueButton();
    });

    it('eligibility criteria and supporting information sections should be completed', () => {
      cy.visit(relative(`/gef/application-details/${dealId}`));

      applicationDetails.supportingInfoStatus().contains('Completed');
      applicationDetails.automaticCoverStatus().contains('Completed');
    });
  });
});
