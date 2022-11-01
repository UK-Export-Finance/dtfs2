import relative from '../../relativeURL';
import automaticCover from '../../pages/automatic-cover';
import ineligibleAutomaticCover from '../../pages/ineligible-automatic-cover';
import manualInclusion from '../../pages/manual-inclusion-questionnaire';
import securityDetails from '../../pages/security-details';
import applicationDetails from '../../pages/application-details';
import CREDENTIALS from '../../../fixtures/credentials.json';

let dealId;

context('Eligibility Criterion 16', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[0]._id;
      });
    cy.login(CREDENTIALS.MAKER);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    Cypress.Cookies.preserveOnce('_csrf');
    cy.visit(relative(`/gef/application-details/${dealId}/automatic-cover`));
  });

  describe('Visiting page eligibility criteria page', () => {
    it('displays the correct elements', () => {
      automaticCover.mainHeading();
      automaticCover.form();
      automaticCover.automaticCoverTerm().its('length').should('be.gt', 0); // contains terms
      automaticCover.continueButton();
      automaticCover.saveAndReturnButton();
    });
  });

  describe('Selecting false on eligibility criteria 16', () => {
    it('the eligibility criteria have the correct aria-labels on radio buttons for true and false', () => {
      automaticCover.trueRadioButton().first().invoke('attr', 'aria-label').then((label) => {
        expect(label).to.equal('Eligibility criterion, 12, The period between the Cover Start Date and the Cover End Date does not exceed the Facility Maximum Cover Period., true');
      });

      automaticCover.falseRadioButton().first().invoke('attr', 'aria-label').then((label) => {
        expect(label).to.equal('Eligibility criterion, 12, The period between the Cover Start Date and the Cover End Date does not exceed the Facility Maximum Cover Period., false');
      });
    });

    it('selecting false on criterion 16 and pressing continue should take user to manual inclusion questionnaire page', () => {
      automaticCover.automaticCoverTerm().each(($el, index) => {
        if (index === 4) {
          $el.find('[data-cy="automatic-cover-false"]').trigger('click');
        } else {
          $el.find('[data-cy="automatic-cover-true"]').trigger('click');
        }
      });

      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/ineligible-automatic-cover`));

      ineligibleAutomaticCover.mainHeading().contains('This is not eligible for automatic cover');
      ineligibleAutomaticCover.content().contains('You\'ll now need to complete a manual inclusion application.');
      ineligibleAutomaticCover.continueButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));

      cy.uploadFile('upload-file-valid.doc', `/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire/upload`);
      manualInclusion.uploadSuccess('upload_file_valid.doc');
    });

    it('successfully uploading file takes you to security details page', () => {
      cy.visit(relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));
      manualInclusion.continueButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/security-details`));

      securityDetails.mainHeading().contains('Enter security details');
      securityDetails.exporterSecurity().type('exporter test');
      securityDetails.facilitySecurity().type('facility test');
      securityDetails.continueButton().click();
    });

    it('eligibility criteria and supporting information sections should be completed', () => {
      cy.visit(relative(`/gef/application-details/${dealId}`));

      applicationDetails.supportingInfoStatus().contains('Completed');
      applicationDetails.automaticCoverStatus().contains('Completed');
    });
  });
});
