import relative from './relativeURL';
import ineligibleAutomaticCover from './pages/ineligible-automatic-cover';
import CREDENTIALS from '../fixtures/credentials.json';

let dealId;

context('Ineligible Automatic Cover Page', () => {
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
    cy.visit(relative(`/gef/application-details/${dealId}/ineligible-automatic-cover`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      ineligibleAutomaticCover.mainHeading();
      ineligibleAutomaticCover.content();
      ineligibleAutomaticCover.continueButton();
    });
  });

  describe('Clicking on Continue button', () => {
    it('redirects user to Manual Application Page', () => {
      ineligibleAutomaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));
    });
  });
});
