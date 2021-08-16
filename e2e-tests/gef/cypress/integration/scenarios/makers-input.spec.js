/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from '../relativeURL';
import applicationDetails from '../pages/application-details';
import applicationSubmission from '../pages/application-submission';
import CREDENTIALS from '../../fixtures/credentials.json';
import applicationPreview from '../pages/application-preview';
import returnToMaker from '../pages/return-to-maker';

const applicationIds = [];

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
          applicationIds.push(item._id);
        });
      });

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    // login as the maker and submit
    // then login as the checker and return to the maker with a comment.
    cy.login(CREDENTIALS.MAKER);
    cy.visit(relative(`/gef/application-details/${applicationIds[2]}`));
    applicationDetails.submitButton().click();
    applicationSubmission.commentsField().type('DTFS2-4536 Comments from maker');
    applicationSubmission.submmitButton().click();
    applicationSubmission.confirmation();
    cy.login(CREDENTIALS.CHECKER);
    cy.visit(relative(`/gef/application-details/${applicationIds[2]}`));
    applicationPreview.returnButton().click();
    returnToMaker.comment().type('DTFS2-4536 return to maker comment by the checker');
    returnToMaker.submitButton().click();
    cy.location('pathname').should('contain', 'dashboard/gef');
    cy.login(CREDENTIALS.MAKER);

    cy.visit(relative(`/gef/application-details/${applicationIds[2]}`));
    cy.on('uncaught:exception', () => false);
  });

  describe('DTFS2-4536 Review AIN when returned to maker', () => {
    it('allows the maker the ability to review an AIN with the status "Return to maker"', () => {
      applicationDetails.bankRefName().should('have.text', 'HSBC 123');
      applicationDetails.addCashFacilityButton();
      applicationDetails.addContingentFacilityButton();

      // it displays the comments from the checker
      applicationPreview.task();
      applicationPreview.comments();
      applicationPreview.comments().contains('DTFS2-4536 return to maker comment by the checker');

      // it allows the maker to submit to be checked at the bank
      applicationDetails.submitButton().click();

      // it allows the maker to optionally add additional comments
      applicationSubmission.commentsField().type('Comments from the maker');
      applicationSubmission.submmitButton().click();
      applicationSubmission.confirmation();

      // it changes the status to Ready for Checker's approval
      cy.visit(relative(`/gef/application-details/${applicationIds[2]}`));
      applicationPreview.status().contains("Ready for Checker's approval");
    });
  });
});
