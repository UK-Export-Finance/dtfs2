const relative = require('../../relativeURL');
const page = require('../../pages/contact');

const emailAddress = Cypress.env('CONTACT_US_EMAIL_ADDRESS').trim();

context('contact', () => {
  beforeEach(() => {
    page.visit();
  });

  describe('visit contact us page', () => {
    it('should ensure the page URL is correct', () => {
      cy.url().should('eq', relative('/contact'));
    });

    it('should ensure the portal headings are rendered', () => {
      cy.assertText(page.heading(), 'Contact us');
      cy.assertText(page.emailHeading(), 'Email');
    });

    it('should ensure the contact us email address is valid', () => {
      cy.assertText(page.email(), emailAddress);
    });

    it('should ensure the contact us timeframe is valid', () => {
      cy.assertText(page.timeframe(), 'Monday to Friday, 9am to 5pm (excluding public holidays)');
    });
  });
});
