import relative from '../relativeURL';
import { mainHeading, continueButton } from '../partials';
import ineligibleAutomaticCover from '../pages/ineligible-automatic-cover';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

let dealId;

context('Ineligible Automatic Cover Page', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        dealId = body.items[0]._id;
      });
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/gef/application-details/${dealId}/ineligible-automatic-cover`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      mainHeading();
      ineligibleAutomaticCover.content();
      continueButton();
    });
  });

  describe('Clicking on Continue button', () => {
    it('redirects user to Manual Application Page', () => {
      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/supporting-information/document/manual-inclusion-questionnaire`));
    });
  });
});
