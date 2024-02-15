import relative from '../../relativeURL';
import pages from '../../pages';

context('TFM footer', () => {
  it('Footer is visible and contains specific links', () => {
    // TODO: After SSO user can't visit landingPage.
    // pages.landingPage.visit();
    pages.feedbackPage.visit();
    pages.footer.footer().should('exist');
    pages.footer.contactUs().contains('Contact us');
    pages.footer.accessibilityLink().should('exist');
    pages.footer.cookiesLink().should('exist');
  });

  it('Footer accessibility link takes you to accessibility statement page', () => {
    // TODO: After SSO user can't visit landingPage.
    // pages.landingPage.visit();
    pages.feedbackPage.visit();
    pages.footer.accessibilityLink().click();
    cy.url().should('eq', relative('/accessibility-statement'));
  });

  it('Footer cookies link takes you to cookies statement page', () => {
    // TODO: After SSO user can't visit landingPage.
    // pages.landingPage.visit();
    pages.feedbackPage.visit();
    pages.footer.cookiesLink().click();
    cy.url().should('eq', relative('/cookies'));
  });
});
