import relative from './relativeURL';
import returnToMaker from './pages/return-to-maker';
import CREDENTIALS from '../fixtures/credentials.json';
import applicationDetails from './pages/application-details';
import automaticCover from './pages/automatic-cover';
import manualInclusion from './pages/manual-inclusion-questionnaire';
import securityDetails from './pages/security-details';
import applicationSubmission from './pages/application-submission';
import applicationPreview from './pages/application-preview';
import statusBanner from './pages/application-status-banner';

let applicationId;

context('Return to Maker as MIA', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.CHECKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        applicationId = body.items[2]._id;

        cy.login(CREDENTIALS.MAKER);
      });
  });

  describe('create and submit an MIA', () => {
    before(() => {
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${applicationId}`));
      Cypress.Cookies.preserveOnce('connect.sid');
    });

    it('create an MIA as a Maker and submit it to the Checker', () => {
      // Make the deal an Manual Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
        if (index === 7) {
          $el.find('[data-cy="automatic-cover-false"]').trigger('click');
        }
      });
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationId}/ineligible-automatic-cover`));
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationId}/supporting-information/manual-inclusion-questionnaire`));
      cy.uploadFile('upload-file-valid.doc', `${manualInclusion.url(applicationId)}/upload`);
      manualInclusion.uploadSuccess('upload-file-valid.doc');
      securityDetails.visit(applicationId);
      securityDetails.exporterSecurity().type('test');
      securityDetails.applicationSecurity().type('test2');
      securityDetails.continueButton().click();

      applicationDetails.submitButton().click();
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();
    });
  });

  describe('return the application to the Maker', () => {
    before(() => {
      cy.login(CREDENTIALS.CHECKER);
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.visit(relative(`/gef/application-details/${applicationId}`));
    });

    it('should return the application to the Maker', () => {
      applicationPreview.returnButton().click();
      returnToMaker.comment().type('comment1');
      returnToMaker.submitButton().click();
      cy.location('pathname').should('contain', 'dashboard');
    });
  });

  describe('return to maker', () => {
    before(() => {
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${applicationId}`));
    });

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
    });

    it('comments are showing', () => {
      applicationPreview.comments().contains('comment1');
      statusBanner.bannerStatus().contains('Further Maker\'s input required');
    });

    it('can change security details comments', () => {
      securityDetails.securityDetailsChangeCta().click();
      securityDetails.exporterSecurity().type(' test3');
      securityDetails.applicationSecurity().type('test4');
      securityDetails.continueButton().click();
    });

    it('can submit back to checker', () => {
      applicationDetails.submitButton().click();
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle().contains('Manual Inclusion Application submitted for checking at your bank');
      cy.visit(relative(`/gef/application-details/${applicationId}`));
      statusBanner.bannerStatus().contains('Ready for Checker\'s approval');
    });
  });
});
