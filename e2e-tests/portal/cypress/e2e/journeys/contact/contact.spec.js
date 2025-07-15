const relative = require('../../relativeURL');
const { contact } = require('../../pages');

const emailAddress = Cypress.env('CONTACT_US_EMAIL_ADDRESS').trim();

context('contact', () => {
  beforeEach(() => {
    contact.visit();
  });

  describe('visit contact us page', () => {
    it('should ensure the page URL is correct', () => {
      cy.url().should('eq', relative('/contact'));
    });

    it('should ensure the portal headings are rendered', () => {
      cy.assertText(contact.heading(), 'Contact us');
      cy.assertText(contact.emailHeading(), 'Email');
    });

    it('should ensure the contact us email address is valid', () => {
      cy.assertText(contact.email(), emailAddress);
    });

    it('should ensure the contact us timeframe is valid', () => {
      cy.assertText(contact.timeframe(), 'Monday to Friday, 9am to 5pm (excluding public holidays)');
    });
  });
});
