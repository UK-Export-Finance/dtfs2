import relative from '../../relativeURL';
import { continueButton, saveAndReturnButton, submitButton } from '../../partials';
import applicationDetails from '../../pages/application-details';
import automaticCover from '../../pages/automatic-cover';
import applicationSubmission from '../../pages/application-submission';
import manualInclusion from '../../pages/manual-inclusion-questionnaire';
import securityDetails from '../../pages/security-details';
import { BANK1_MAKER1, BANK1_MAKER_CHECKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import applicationPreview from '../../pages/application-preview';

context('Create application as MAKER, edit as MAKER_CHECKER, submit application to UKEF as MAKER_CHECKER', () => {
  const dealIds = [];

  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        body.items.forEach((item) => {
          dealIds.push(item._id);
        });
      });
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('BANK1_MAKER1 makes application, MAKER_CHECKER adds document only, MAKER_CHECKER should not be able to submit to ukef', () => {
    it('does not allow a MAKER_CHECKER to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationDetails.automaticCoverDetailsLink().click();

      // Accept all ECs
      cy.automaticEligibilityCriteria();
      // Deny EC
      automaticCover.falseRadioButton(19).click();

      saveAndReturnButton().click();

      // login as maker_checker to add a file only and then complete as maker
      cy.login(BANK1_MAKER_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}/supporting-information/document/manual-inclusion-questionnaire`));

      cy.uploadFile('upload-file-valid.doc', `${manualInclusion.url(dealIds[2])}/upload`);
      manualInclusion.uploadSuccess('upload_file_valid.doc');

      cy.login(BANK1_MAKER1);
      securityDetails.visit(dealIds[2]);
      securityDetails.exporterSecurity().type('test');
      securityDetails.facilitySecurity().type('test2');
      continueButton().click();

      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      // submit the deal
      submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // login as a maker_checker and ensure that cannot return or submit to ukef
      cy.login(BANK1_MAKER_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().should('not.exist');
      submitButton().should('not.exist');
    });
  });
});
