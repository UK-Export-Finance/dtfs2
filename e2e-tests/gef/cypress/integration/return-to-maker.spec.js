/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import returnToMaker from './pages/return-to-maker';
import CREDENTIALS from '../fixtures/credentials.json';

let applicationIds = [];

context('Return to Maker', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.CHECKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        applicationIds = body.items.map((item) => item._id);
      });
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.apiLogin(CREDENTIALS.CHECKER)
      .then((token) => token)
      .then((token) => {
        cy.apiSetApplicationStatus(applicationIds[2], token, 'BANK_CHECK');
      });

    cy.login(CREDENTIALS.MAKER);
    cy.visit(relative(`/gef/application-details/${applicationIds[2]}/return-to-maker`));
    cy.on('uncaught:exception', () => false);
  });

  describe('Return to maker', () => {
    it('displays the page as expected', () => {
      returnToMaker.mainHeading();
      returnToMaker.comment();
      returnToMaker.submitButton();
      returnToMaker.cancelLink();
    });

    it('does not display for applications that aren\'t in checking state', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[0]}/return-to-maker`));
      cy.location('pathname').should('contain', 'dashboard/gef');
    });

    it('submits without comments ', () => {
      returnToMaker.submitButton().click();
      cy.location('pathname').should('contain', 'dashboard/gef');
    });

    it('submits with comments', () => {
      returnToMaker.comment().type('Test comment');
      returnToMaker.submitButton().click();
      cy.location('pathname').should('contain', 'dashboard/gef');
    });

    it('display an error when the comment is greater than 400 characters', () => {
      const longComment = 'a'.repeat(401);

      returnToMaker.comment().type(longComment);
      returnToMaker.submitButton().click();
      returnToMaker.errorSummary();
    });

    it('takes checker back to application preview page when cancelled', () => {
      returnToMaker.comment().type('Some comments here ....');
      returnToMaker.cancelLink().click();
      cy.location('pathname').should('eq', `/gef/application-details/${applicationIds[2]}/`);
    });
  });
});
