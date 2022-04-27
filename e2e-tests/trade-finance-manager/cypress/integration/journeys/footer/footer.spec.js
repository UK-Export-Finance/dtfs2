import relative from '../../relativeURL';
import pages from '../../pages';

context('TFM footer', () => {
  it('Footer is visible and contains specific links', () => {
    pages.landingPage.visit();
    pages.footer.footer().should('exist');
    pages.footer.contactUs().contains('Contact us');
    pages.footer.accessiblityLink().should('exist');
    pages.footer.cookiesLink().should('exist');
  });

  it('Footer accessibility link takes you to accessibility statement page', () => {
    pages.landingPage.visit();
    pages.footer.accessiblityLink().click();
    cy.url().should('eq', relative('/accessibility-statement'));
  });

  it('Footer cookies link takes you to cookies statement page', () => {
    pages.landingPage.visit();
    pages.footer.cookiesLink().click();
    cy.url().should('eq', relative('/cookies'));
  });
});
