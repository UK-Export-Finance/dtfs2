import relative from '../../relativeURL';
import pages from '../../pages';

context('TFM footer', () => {
  beforeEach(() => {
    cy.saveSession();
    pages.feedbackPage.visit();
  });

  it('Footer is visible and contains specific links', () => {
    pages.footer.footer().should('exist');
    pages.footer.contactUs().contains('Contact us');
    pages.footer.accessibilityLink().should('exist');
    pages.footer.cookiesLink().should('exist');
  });

  it('Footer accessibility link takes you to accessibility statement page', () => {
    pages.footer.accessibilityLink().click();
    cy.url().should('eq', relative('/accessibility-statement'));
  });

  it('Footer cookies link takes you to cookies statement page', () => {
    pages.footer.cookiesLink().click();
    cy.url().should('eq', relative('/cookies'));
  });
});
