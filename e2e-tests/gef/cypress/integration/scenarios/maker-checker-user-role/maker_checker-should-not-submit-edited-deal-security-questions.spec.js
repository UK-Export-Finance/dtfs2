import relative from '../../relativeURL';
import applicationDetails from '../../pages/application-details';
import automaticCover from '../../pages/automatic-cover';
import applicationSubmission from '../../pages/application-submission';
import manualInclusion from '../../pages/manual-inclusion-questionnaire';
import securityDetails from '../../pages/security-details';
import CREDENTIALS from '../../../fixtures/credentials.json';
import applicationPreview from '../../pages/application-preview';
import returnToMaker from '../../pages/return-to-maker';

context('Create application as MAKER, edit as MAKER_CHECKER, submit application to UKEF as MAKER_CHECKER', () => {
  const dealIds = [];

  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        body.items.forEach((item) => {
          dealIds.push(item._id);
        });
      });
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  describe('BANK1_MAKER1 makes application, MAKER_CHECKER adds security questions only, MAKER_CHECKER should not be able to submit to ukef', () => {
    it('does not allow a MAKER_CHECKER to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      automaticCover.automaticCoverTerm().each(($el, index) => {
        $el.find('[data-cy="automatic-cover-true"]').trigger('click');
        if (index === 7) {
          $el.find('[data-cy="automatic-cover-false"]').trigger('click');
        }
      });
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[2]}/ineligible-automatic-cover`));
      automaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealIds[2]}/supporting-information/manual-inclusion-questionnaire`));
      cy.uploadFile('upload-file-valid.doc', `${manualInclusion.url(dealIds[2])}/upload`);
      manualInclusion.uploadSuccess('upload-file-valid.doc');

      // login as MAKER_CHECKER only to fill in security questions
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      securityDetails.visit(dealIds[2]);
      securityDetails.exporterSecurity().type('test');
      securityDetails.facilitySecurity().type('test2');
      securityDetails.continueButton().click();

      cy.login(CREDENTIALS.MAKER);

      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      // submit the deal
      applicationDetails.submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // login as a maker_checker and ensure that cannot return or submit to ukef
      cy.login(CREDENTIALS.MAKER_CHECKER);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().should('not.exist');
      returnToMaker.submitButton().should('not.exist');
    });
  });
});
