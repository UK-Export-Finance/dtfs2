import relative from '../relativeURL';
import { submitButton } from '../partials';
import applicationDetails from '../pages/application-details';
import applicationSubmission from '../pages/application-submission';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';
import applicationPreview from '../pages/application-preview';
import returnToMaker from '../pages/return-to-maker';
import statusBanner from '../pages/application-status-banner';

const dealIds = [];

context('Review application when returned to maker', () => {
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
    // login as the maker
    cy.login(BANK1_MAKER1);
    cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

    // Make the deal an Automatic Inclusion Application
    applicationDetails.automaticCoverDetailsLink().click();
    cy.automaticEligibilityCriteria();
    cy.clickSaveAndReturnButton();

    // submit the deal with a comment
    submitButton().click();
    applicationSubmission.commentsField().type('Hello');
    submitButton().click();
    applicationSubmission.confirmationPanelTitle();

    // then login as the checker and return to the maker with a comment
    cy.login(BANK1_CHECKER1);
    cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
    applicationPreview.returnButton().click();
    returnToMaker.comment().type('Nope');
    submitButton().click();
    cy.location('pathname').should('contain', 'dashboard');
    cy.login(BANK1_MAKER1);

    cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
  });

  describe('DTFS2-4536 Review AIN when returned to maker', () => {
    it('allows the maker the ability to review an AIN with the status "Return to maker"', () => {
      applicationDetails.editRefNameLink().should('have.text', 'HSBC 123');
      applicationDetails.addCashFacilityButton();
      applicationDetails.addContingentFacilityButton();

      // it displays the comments from the checker
      applicationPreview.comments();
      applicationPreview.comments().contains('Nope');

      // it allows the maker to submit to be checked at the bank
      submitButton().click();

      // it allows the maker to optionally add additional comments
      applicationSubmission.commentsField().type('Comments from the maker');
      submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // it changes the status to Ready for Checker's approval
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      statusBanner.bannerStatus().contains("Ready for Checker's approval");
    });
  });
});
