import relative from '../relativeURL';
import { errorSummary, mainHeading, submitButton } from '../partials';
import returnToMaker from '../pages/return-to-maker';
import { BANK1_CHECKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

let dealIds = [];

context('Return to Maker', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_CHECKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealIds = body.items.map((item) => item._id);
      });
  });

  beforeEach(() => {
    cy.saveSession();
    cy.apiLogin(BANK1_CHECKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiSetApplicationStatus(dealIds[2], token, "Ready for Checker's approval");
      });

    cy.login(BANK1_CHECKER1);
    cy.visit(relative(`/gef/application-details/${dealIds[2]}/return-to-maker`));
  });

  describe('Return to maker', () => {
    it('displays the page as expected', () => {
      mainHeading();
      returnToMaker.comment();
      returnToMaker.submitButton();
      returnToMaker.cancelLink();
    });

    it("does not display for applications that aren't in checking state", () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/return-to-maker`));
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('submits without comments ', () => {
      submitButton().click();
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('submits with comments', () => {
      returnToMaker.comment().type('Test comment');
      submitButton().click();
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('display an error when the comment is greater than 400 characters', () => {
      const longComment = 'a'.repeat(401);

      returnToMaker.comment().type(longComment);
      submitButton().click();
      errorSummary();
    });

    it('takes checker back to application preview page when cancelled', () => {
      returnToMaker.comment().type('Some comments here ....');
      returnToMaker.cancelLink().click();
      cy.location('pathname').should('eq', `/gef/application-details/${dealIds[2]}`);
    });
  });
});
