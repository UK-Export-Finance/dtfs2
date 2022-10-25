import relative from '../relativeURL';
import applicationDetails from '../pages/application-details';
import automaticCover from '../pages/automatic-cover';
import applicationSubmission from '../pages/application-submission';
import CREDENTIALS from '../../fixtures/credentials.json';
import applicationPreview from '../pages/application-preview';
import returnToMaker from '../pages/return-to-maker';
import statusBanner from '../pages/application-status-banner';

const dealIds = [];

context('Review application when returned to maker', () => {
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
    // login as the maker
    cy.login(CREDENTIALS.MAKER);
    cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

    // Make the deal an Automatic Inclusion Application
    applicationDetails.automaticCoverDetailsLink().click();
    automaticCover.automaticCoverTerm().each(($el, index) => {
      $el.find('[data-cy="automatic-cover-true"]').trigger('click');
    });
    automaticCover.saveAndReturnButton().click();

    // submit the deal with a comment
    applicationDetails.submitButton().click();
    applicationSubmission.commentsField().type('Hello');
    applicationSubmission.submitButton().click();
    applicationSubmission.confirmationPanelTitle();

    // then login as the checker and return to the maker with a comment
    cy.login(CREDENTIALS.CHECKER);
    cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
    applicationPreview.returnButton().click();
    returnToMaker.comment().type('Nope');
    returnToMaker.submitButton().click();
    cy.location('pathname').should('contain', 'dashboard');
    cy.login(CREDENTIALS.MAKER);

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
      applicationDetails.submitButton().click();

      // it allows the maker to optionally add additional comments
      applicationSubmission.commentsField().type('Comments from the maker');
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle();

      // it changes the status to Ready for Checker's approval
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      statusBanner.bannerStatus().contains("Ready for Checker's approval");
    });
  });
});
