import relative from '../relativeURL';
import { mainHeading, backLink } from '../partials';
import ineligibleGef from '../pages/ineligible-gef';
import { BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

context('Ineligible GEF Page', () => {
  before(() => {
    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative('/gef/ineligible-gef'));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      mainHeading();
      ineligibleGef.content();
      backLink();
    });
  });

  describe('Clicking on Back Button', () => {
    it('redirects user to the applications and notices page', () => {
      cy.clickBackLink();
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });
  });
});
