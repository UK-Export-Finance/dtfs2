import relative from '../../relativeURL';
import { submitButton } from '../../partials';
import applicationDetails from '../../pages/application-details';
import applicationSubmission from '../../pages/application-submission';
import { BANK1_MAKER1, BANK1_MAKER_CHECKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import applicationPreview from '../../pages/application-preview';
import returnToMaker from '../../pages/return-to-maker';
import statusBanner from '../../pages/application-status-banner';

context('Create application as MAKER, submit application to UKEF as MAKER_CHECKER', () => {
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

  describe('DTFS2-4698 MAKER_CHECKER should not be able to submit own edited deals when submitting to checker as MAKER_CHECKER', () => {
    it('does not allow a MAKER_CHECKER to submit own edited deals', () => {
      // login as a MAKER and submit
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      cy.automaticEligibilityCriteria();
      cy.clickSaveAndReturnButton();

      // submit the deal
      submitButton().click();
      applicationSubmission.commentsField().type('DTFS2-4698 Comments from original maker');
      submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // login as a MAKER_CHECKER and return to the maker with a comment.
      cy.login(BANK1_MAKER_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().click();
      returnToMaker.comment().type('nope');
      submitButton().click();
      cy.location('pathname').should('contain', 'dashboard');
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      applicationDetails.editRefNameLink().should('have.text', 'HSBC 123');

      // could update the application as the MAKER_CHECKER
      applicationDetails.addCashFacilityButton();
      applicationDetails.addContingentFacilityButton();

      // it displays the comments from the checker
      applicationPreview.comments();
      applicationPreview.comments().contains('nope');

      // it allows the MAKER_CHECKER to submit to be checked at the bank
      // submit the application to be checked again
      submitButton().click();

      // it allows the maker to optionally add additional comments
      applicationSubmission.commentsField().type('Hello');
      submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // it changes the status to Ready for Checker's approval
      // view the application as the MAKER_CHECKER
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      statusBanner.bannerStatus().contains("Ready for Checker's approval");

      // the ability to return the application or submit to ukef should not be visible
      submitButton().should('not.exist');
      applicationPreview.returnButton().should('not.exist');
    });
  });
});
